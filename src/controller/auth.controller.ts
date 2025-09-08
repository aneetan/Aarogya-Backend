import { NextFunction, Request, Response } from "express";
import { LoginUserInput, loginUserSchema, RegisterUserInput, registerUserSchema } from "../schemas/user.schema";
import { validateSchema } from "../middleware/validateSchema";
import userRepository from "../repositories/user.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import { generateJwtToken } from "../utils/jwtToken.utils";
import { redis } from "../config/redis.config";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken"
import emailService from "../services/email.service";


class AuthController {
   register = [
      validateSchema(registerUserSchema),
      async(req:Request<{}, {}, RegisterUserInput['body']>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const userDto = req.body;

            if(userDto.password !== userDto.confirmPassword) {
               throw new Error("Password doesn't match");
            }

            const existingUser = await userRepository.findByEmail(userDto.email);
            if(existingUser) {
               throw new Error("Email already in use")
            };

            const userData = {
               fullName: userDto.fullName,
               email: userDto.email,
               role: userDto.role,
               password: userDto.password,
               emailVerified: false
            };

            const newUser = await userRepository.createUser(userData);

              // Generate email verification token
            const verificationToken = generateJwtToken(
               { userId: newUser.id, email: newUser.email },
               '24h'
            );

            // Store verification token in Redis with expiration
            await redis.set(
               `verification:${newUser.id}`, 
               verificationToken, 
               "EX", 
               24 * 60 * 60 
            );

            // Send verification email
            await emailService.sendVerificationEmail(
               newUser.email,
               verificationToken,
               newUser.fullName
            );

            const plainUser = newUser.get({ plain: true });
            const { password, ...userWithoutPassword } = plainUser;

            res.status(201).json(userWithoutPassword);
         } catch (e) {
            errorResponse(e, res, "Error while registering user");
            next(e);
         }
      }
   ];

   login = [
      validateSchema(loginUserSchema),
      async(req:Request<{}, {}, LoginUserInput['body']>, res: Response, next: NextFunction) => {
            try{
                const {email, password} = req.body;

                const user = await userRepository.findByEmailAndPassword(email, password);
                if (!user) {
                    return res.status(401).json({error : "Authentication failed"});
                }

                 // Check if email is verified
                if (!user.emailVerified) {
                    return res.status(403).json({
                        error: "Email not verified",
                        message: "Please verify your email before logging in",
                        userId: user.id
                    });
                }

                const accessToken = generateJwtToken({user}, '1h');
                await redis.set(`accessToken:${user.id}`, accessToken, "EX", 60 * 60);

                res
                  .status(200)
                  .json({"message": "User logged in successfully", accessToken, id: user.id});  
            } catch (e) {
                errorResponse(e, res, "Invalid email or password");
                next(e);
            }
        }
    ];

   verifyEmail = [
   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
         const { token } = req.query;

         if (!token || typeof token !== 'string') {
         throw new Error("Verification token is required");
         }

         // Verify the token
         const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
         
         if (!decoded.userId) {
         throw new Error("Invalid verification token");
         }

         // Check if token exists in Redis
         const storedToken = await redis.get(`verification:${decoded.userId}`);
         if (!storedToken || storedToken !== token) {
         throw new Error("Invalid or expired verification token");
         }

         // Update user's email verification status
         await userRepository.updateVerificationStatus(decoded.userId);

         // Remove the verification token from Redis
         await redis.del(`verification:${decoded.userId}`);

         res.status(200).json({ 
         message: "Email verified successfully" 
         });
      } catch (e) {
         errorResponse(e, res, "Email verification failed");
         next(e);
      }
   }
   ];

    logout = [
      verifyAccessToken,
      async(req: Request, res: Response) => {
         const userId = req.body.userId;
         const token = req.header("Authorization")?.replace("Bearer ", "");
         if (!token) return res.status(400).json({ error: "Token required" });

         const decoded = jwt.decode(token!) as JwtPayload;
         await redis.del(`accessToken:${userId}`);

         const expInSeconds = decoded?.exp! -Math.floor(Date.now() / 1000);
         if (expInSeconds > 0) {
               await redis.set(`blacklist:${token}`, "true", "EX", expInSeconds);
         }

         res.json({ message: "Logged out" });
      }
    ]


}

export default new AuthController();
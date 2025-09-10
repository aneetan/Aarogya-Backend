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
import dotenv from "dotenv"
import emailService from "../services/email.service";
import { OTPService } from "../services/otp.service";
import { VerifyOTPInput, verifyOTPSchema } from "../schemas/otp.schema";

dotenv.config();

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
            const email = newUser.email;

            const otp = OTPService.generateOTP();

            OTPService.storeOTP(email, otp);

            const otpToken = OTPService.generateOTPToken({
               email,
               otp,
               purpose: 'password_reset'
            })

            await emailService.sendOTPEmail(email, otp, newUser.fullName);

            res.status(200).json({
               message: 'OTP sent to email',
               token: otpToken,
               email: email
            });

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

   verifyOTP =[
      validateSchema(verifyOTPSchema),
      async (req: Request<{}, {}, VerifyOTPInput['body']>, res: Response, next: NextFunction) => {
         try{
            const {email, otp, token} = req.body;

            let isValid= false;
            if(token) {
               try{
                  const payload = OTPService.verifyOTPToken(token);
                  isValid = payload.otp === otp && payload.email === email;
               } catch {
                  isValid = false;
               }
            }
            if (!isValid) {
               throw new Error('Invalid or expired OTP');
            }

            await userRepository.updateVerificationStatus(email);


            res.status(200).json({
               message: 'OTP verified successfully',
            });
            
         } catch (e) {
            errorResponse(e, res, "Invalid or expired OTP");
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
import User from "../models/user.model";
import bcrypt from 'bcryptjs';
import { UserAttributes } from "../types/auth.types";

class UserRepository {
   async findByEmail(email: string): Promise<User | null> {
      return await User.findOne({where:{email}});
   }

   async createUser(userData: Omit<UserAttributes, "id">): Promise<User> {
      const {fullName, email, password, role} = userData;

      return await User.create({
         fullName,
         email,
         role,
         password
      });
   }

   async findByEmailAndPassword(email:string, password:string): Promise<User | null> {
      const user = await User.findOne({
         where: { email },
         attributes: {include: ['password'] }
      });

      if(!user) return null;

      if(user){
         const isPasswordValid = bcrypt.compareSync(password, user.password);
         if(!isPasswordValid) return null;
      }

      return user;
   }

   async updateVerificationStatus(id: number): Promise<User> {
      const user = await User.findByPk(id);

      if (!user) throw new Error('User not found');

      await user.update({ emailVerified: true });
      return user;
   }
}

export default new UserRepository();
import { DataTypes, InitOptions, Model, ModelAttributes } from "sequelize";
import bcrypt from 'bcryptjs';
import { UserAttributes } from "../types/auth.types";

class User extends Model<UserAttributes , Omit<UserAttributes, 'id'>> implements UserAttributes {
   public id!: number;
   public fullName!: string;
   public email!: string;
   public role!: "user" | "local_body";
   public password!: string;

   static initialize(sequelize : any): typeof User {
      const attributes: ModelAttributes<User, UserAttributes> = {
         id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
         },
         fullName: {
            type: DataTypes.STRING,
            validate: {
               len: [5, 100]
            },
            allowNull: false
         },
         email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               isEmail: true
            },
            unique: true
         },
         role: {
            type: DataTypes.ENUM('user', 'local_body'),
            allowNull: false,
            defaultValue: 'upcoming',
            validate: {
               isIn: [['user', 'local_body']]
            }
         },
         password: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value: string) {
               const hashed = bcrypt.hashSync(value, 10);
               this.setDataValue('password', hashed);
            }
         }
      };

      const options: InitOptions<User> = {
         sequelize,
         modelName: "User",
         tableName: "users",
         timestamps: false,
      };

      return User.init(attributes, options) as typeof User;
   }

   public static associate(models: any){
      User.hasMany(models.Notes, {
         foreignKey: 'userId',
      });
   }
}

export default User;
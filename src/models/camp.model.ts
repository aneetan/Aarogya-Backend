import { DataTypes, InitOptions, Model, ModelAttributes, Sequelize } from "sequelize";
import { CampAttributes } from "../types/camp.types";

class Camp extends Model<CampAttributes, Omit<CampAttributes, 'id'>> implements CampAttributes {
   public id!: number;
   public name!: string;
   public location!: string;
   public organizer!: string;
   public contact!: string;
   public description!: string;
   public date!: Date;
   public days!: number;
   public starting_time!: string;
   public ending_time!: string;
   public lat!: number;
   public lng!: number;
   public status!: "upcoming" | "active" | "expired";

   static initialize(sequelize: Sequelize) : typeof Camp {
      const attributes: ModelAttributes<Camp, CampAttributes> = {
         id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
         },
         name:{
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               len: [5, 100]
            }
         },
         location: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               len: [5, 100]
            }
         },
         organizer: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               len: [5, 100]
            }
         },
         contact: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               notEmpty: true,
               is: /^[\+]?[1-9][\d]{0,15}$/ 
            }
         },
         description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
               len: [10, 2000],
               notEmpty: true
            }
         },
         date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
               isDate: true,
               isAfter: new Date().toISOString().split('T')[0] 
            }
         },
         days: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
               min: 1
            }
         },
         starting_time: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ 
            }
         },
         ending_time: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
               is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            }
         },
         lat: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
               min: -90,
               max: 90,
               isFloat: true
            }
         },
         lng: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
               min: -180,
               max: 180,
               isFloat: true
            }
         },
         status: {
            type: DataTypes.ENUM('upcoming', 'active', 'expired'),
            allowNull: false,
            defaultValue: 'upcoming',
            validate: {
               isIn: [['upcoming', 'active', 'expired']]
            }
         },
      };

      const options: InitOptions<Camp> = {
         sequelize,
         modelName: "Camps",
         tableName: "camps",
         timestamps: true,
         paranoid: true
      }

      return Camp.init(attributes, options) as typeof Camp;
   }

   static associate(models: any): void {
      // Add associations here if needed
   }
}

export default Camp;
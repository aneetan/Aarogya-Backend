import {Sequelize} from "sequelize"
import dotenv from "dotenv"
import { initializeModels } from "../models/init";

dotenv.config();

//initialize db connection
const sequelize = new Sequelize(process.env.DB_URL!, {
   dialect: "postgres",
   dialectOptions: {
      ssl: {
         require: true,
         rejectUnauthorized: false
      },
   },
   logging: false,
});

export const connectToDB = async(): Promise<void> => {
   try {
      await sequelize.authenticate();
      initializeModels(sequelize);
      await sequelize.sync({ alter: false });
      console.log("Connected to database in 5432");

   } catch (e){
      console.log("Failed to connect db: ", e);
   }
}


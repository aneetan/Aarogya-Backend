import {Sequelize} from "sequelize"
import dotenv from "dotenv"

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
      await sequelize.sync({ alter: true });
      console.log("Connected to database in 5432");

   } catch (e){
      console.log("Failed to connect db: ", e);
   }
}


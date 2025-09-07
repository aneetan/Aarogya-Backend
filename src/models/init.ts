import { Sequelize } from "sequelize";
import Camp from "./camp.model";

interface Models {
   Camp: typeof Camp
}
   
export function  initializeModels(sequelize: Sequelize): Models {
   const models: Models = {
      Camp: Camp.initialize(sequelize)
   }

   // //set up associations
   // Object.values(models).forEach(model => {
   //    if(model.associate){
   //       model.associate(models);
   //    }
   // })

   return models;
}

export type {Models}
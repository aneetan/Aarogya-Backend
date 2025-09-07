import Camp from "../models/camp.model";
import { CampAttributes } from "../types/camp.types";

class CampRepository {
   async createCamp(campData: Omit<CampAttributes, 'id'>): Promise<Camp> {
      return await Camp.create(campData);
   }

    async getCamps(): Promise<Camp[]> {
      return await Camp.findAll({
         order: [
            ['date', 'ASC'] 
         ]
      });
   }

   async getRecentCamps(): Promise<Camp[]> {
      return await Camp.findAll({
         order: [
            ['date', 'ASC'] 
         ],
         limit: 6 
      });
   }
}

export default new CampRepository;
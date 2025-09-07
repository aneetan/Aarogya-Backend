import Camp from "../models/camp.model";
import { CampAttributes } from "../types/camp.types";

class CampRepository {
   async createCamp (note: Omit<CampAttributes ,'id'>): Promise<Camp> {
      const {
         name,
         location,
         organizer,
         contact,
         description,
         date,
         days,
         starting_time,
         ending_time,
         lat,
         lng,
         status
      } = note;

      return await Camp.create({
         name, location, organizer, contact, description, date, days, starting_time, ending_time, lat, lng, status
      })
   }

    async getCamps(): Promise<Camp[]> {
      return await Camp.findAll();
   }
}

export default new CampRepository;
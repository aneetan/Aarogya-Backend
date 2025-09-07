import { NextFunction, Request, Response } from "express";
import { CampAttributes, CampFormData } from "../types/camp.types";
import campRepository from "../repositories/camp.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import { validateSchema } from "../middleware/validateSchema";
import { addCampSchema, CampFormUserInput } from "../schemas/camp.schema";

class CampController {
   addCamp = [
      validateSchema(addCampSchema),
      async (req: Request, res: Response, next: NextFunction) => {
         try {
            const campDto = req.body as Omit<CampAttributes, 'id'> ;

            const newCamp: Omit<CampAttributes, 'id'> = {
               name: campDto.name,
               location: campDto.location,
               organizer: campDto.organizer,
               contact: campDto.contact,
               description: campDto.description,
               date: campDto.date,
               days: campDto.days ,
               starting_time: campDto.starting_time,
               ending_time: campDto.ending_time,
               lat: campDto.lat ,
               lng: campDto.lng ,
               status: campDto.status || 'upcoming',
            };

            const saveCamp = await campRepository.createCamp(newCamp);

            res.status(201).json({ 
               data: saveCamp, 
               message: "Camp created successfully" 
            });
         } catch (e) {
            console.log(e)
            errorResponse(e, res, "Error while creating camp"); 
            next(e);
         }
      }
   ]
   getCamps= [
      // verifyAccessToken,
      async (req: Request, res: Response, next: NextFunction) => {
         try{
            const notes: CampAttributes[] = await campRepository.getCamps();
            res.status(200).json(notes);
         } catch (e) {
            errorResponse(e, res, "Error while retrieving notes"); 
            next(e);
         }
      }
   ]

   getRecentCamps= [
      // verifyAccessToken,
      async (req: Request, res: Response, next: NextFunction) => {
         try{
            const notes: CampAttributes[] = await campRepository.getRecentCamps();
            res.status(200).json(notes);
         } catch (e) {
            errorResponse(e, res, "Error while retrieving notes"); 
            next(e);
         }
      }
   ]

}

export default new CampController();
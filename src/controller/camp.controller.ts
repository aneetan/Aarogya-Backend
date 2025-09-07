import { NextFunction, Request, Response } from "express";
import { CampAttributes, CampFormData } from "../types/camp.types";
import campRepository from "../repositories/camp.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import { validateSchema } from "../middleware/validateSchema";
import { addCampSchema, CampFormUserInput } from "../schemas/camp.schema";

class CampController {
   addCamp = [
      validateSchema(addCampSchema),
      async (req: Request<{}, {}, CampFormUserInput['body']>, res: Response, next: NextFunction) => {
         try {
            const campDto = req.body;

            // Validate required fields
            if (!campDto.name || !campDto.location || !campDto.organizer || !campDto.contact) {
               return res.status(400).json({ message: "Missing required fields" });
            }

            const campData: CampFormData = {
               name: campDto.name,
               location: campDto.location,
               organizer: campDto.organizer,
               contact: campDto.contact,
               description: campDto.description || "",
               date: campDto.date ? new Date(campDto.date) : new Date(),
               days: campDto.days ? campDto.days: 1,
               starting_time: campDto.starting_time || "09:00",
               ending_time: campDto.ending_time || "17:00",
               lat: campDto.lat ? campDto.lat : 0,
               lng: campDto.lng ? campDto.lng : 0,
               status: campDto.status || "upcoming"
            };

            const newCamp = await campRepository.createCamp(campData);

            res.status(201).json({ 
               data: newCamp, 
               message: "Camp created successfully" 
            });
         } catch (e) {
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

}

export default new CampController();
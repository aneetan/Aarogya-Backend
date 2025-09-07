import { Router } from "express";
import campController from "../controller/camp.controller";

const campRouter = Router();

campRouter.post('/add', campController.addCamp);
campRouter.get('/', campController.getCamps);
 

export default campRouter;
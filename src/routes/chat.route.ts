import { Request, Response, Router } from "express";
import { loadDataset, validateDataset } from "../helpers/dataset.helper";
import { createChatService } from "../services/chat.service";

const chatRouter = Router();

const dataset = loadDataset();
validateDataset(dataset);
const chatService = createChatService(dataset);

let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    await chatService.initialize();
    initialized = true;
  }
}

chatRouter.post('/', async(req: Request, res: Response) => {
   try{
      await ensureInitialized;

      const { message } = req.body;
      if (!message || typeof message !== 'string') {
         return res.status(400).json({ error: 'Missing or invalid "message" in request body' });
      }

      const chatResponse = await chatService.processMessage(message);
      res.json(chatResponse);
   } catch (error) {
      console.error('Error in /chat route:', error);
      res.status(500).json({ error: 'Internal server error' });
   }
});

export default chatRouter;
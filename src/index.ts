import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import { createChatService } from './services/chat.service';
import { DatasetProps } from './types/embedding.types';
import firstAidDataset from '../data/datasets.json';
import { loadDataset, validateDataset } from './helpers/dataset.helper';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/', async(req: Request, res: Response) => {
   const dataset = loadDataset();
    validateDataset(dataset);

  const chatService = createChatService(dataset);
   await chatService.initialize();

  const response = await chatService.processMessage("How do perform cpr?");
  console.log("Bot response:", response.response);

  res.json({ message: 'Hello from Express + TypeScript! This is to test CI/CD' });

});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
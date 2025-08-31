import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import { createChatService } from './services/chat.service';
import { DatasetProps } from './types/embedding.types';
import firstAidDataset from '../data/datasets.json';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/', async(req: Request, res: Response) => {
  const dataset: DatasetProps = firstAidDataset as DatasetProps;
  const chatService = createChatService(dataset);
  const response = await chatService.processMessage("How do I perform CPR?");
  console.log("Bot response:", response.response);
  console.log("Sources:", response.sources);

  res.json({ message: 'Hello from Express + TypeScript! This is to test CI/CD' });

});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
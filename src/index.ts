import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import { createChatService } from './services/chat.service';
import { DatasetProps } from './types/embedding.types';
import firstAidDataset from '../data/datasets.json';
import { loadDataset, validateDataset } from './helpers/dataset.helper';
import chatRouter from './routes/chat.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/chat', chatRouter);

app.get('/', async(req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript! This is to test CI/CD' });

});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
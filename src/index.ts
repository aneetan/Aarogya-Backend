import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import chatRouter from './routes/chat.route';
import campRouter from './routes/camp.route';
import { connectToDB } from './config/dbconfig';
import authRouter from './routes/auth.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

connectToDB()
    .then(() => {
        app.use('/chat', chatRouter);
        app.use('/camp', campRouter);
        app.use('/auth', authRouter);

        app.get('/', async(req: Request, res: Response) => {
          res.json({ message: 'Hello from AidLink' });
        });

        app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))  
    })
    .catch((e) => {
        console.log("Failed to initialize application", e);
    })
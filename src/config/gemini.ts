import { GoogleGenerativeAI } from "@google/generative-ai";
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

//Initialize embedding models
export const getEmbeddingModel = () => {
   return genAI.getGenerativeModel({ 
      model: "models/embedding-001"
   });
};

//Initialize the model for responses
export const getGenerativeModel = () => {
   return genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
         temperature: 0.2,
         topP: 0.8,
         topK: 40,
      }
   })
};

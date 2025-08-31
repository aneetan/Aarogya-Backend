import { getEmbeddingModel } from "../config/gemini";
import { DatasetProps, IntentProps } from "../types/embedding.types";

class EmbeddingService {
   private model: any;

   constructor() {
      this.model = getEmbeddingModel();
   }

   //Generate Embedding for text
   async generateEmbeddings (text: string):  Promise<number[]> {
      try {
         const result = await this.model.embedContent(text);

         if (!result || !result.embedding || !result.embedding.values) {
            throw new Error('Invalid embedding response from Gemini');
         }

         return result.embedding.values;
      } catch(e: any) {
         console.error("Error generating embeddings: " , e);

         if (e.message.includes('API_KEY') || e.message.includes('key')) {
         throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.');
         } else if (e.message.includes('quota') || e.message.includes('rate')) {
         throw new Error('Gemini API quota exceeded or rate limited.');
         } else if (e.message.includes('model') || e.message.includes('embedding')) {
         throw new Error('Embedding model not found or unavailable. Check if "embedding-001" is available.');
         }
         throw e;
      }
   }

   //Generate embeddings for all intents in datasets
   async generateAllEmbeddings (dataset: DatasetProps):  Promise<IntentProps[]> {
      const embeddingIntents: IntentProps[] = [];

      for (const [index, intent] of dataset.intents.entries()) {
         //create embedding for instruction steps
         const stepsText = intent.response.steps.map((step) => 
            `${step.step_number}. ${step.instruction}`
         ).join(' ');

         const fullText = `
            ${intent.intent_name}.
            ${intent.response.context || ''}.
            ${stepsText}.
            ${intent.response.additional_notes || ''}.
            Warnings: ${intent.metadata.warnings.join(', ')}.
         `.trim();

         const embedding = await this.generateEmbeddings(fullText);

         embeddingIntents.push({
            ...intent,
            embeddings: embedding
         });

         await new Promise(resolve => setTimeout(resolve, 100));
      }

      return embeddingIntents;
   }
}

export default new EmbeddingService();
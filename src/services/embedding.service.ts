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
         return result.embedding.values;
      } catch(e) {
         console.error("Error generating embeddings: " , e);
         throw e;
      }
   }

   //Generate embeddings for all intents in datasets
   async generateAllEmbeddings (dataset: DatasetProps):  Promise<IntentProps[]> {
      const embeddingIntents = [];

      for (const intent of dataset.intents) {
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
         `;

         const embedding = await this.generateEmbeddings(fullText);

         embeddingIntents.push({
            ...intent,
            embedding: embedding
         });
      }

      return embeddingIntents;
   }
}

export default new EmbeddingService();
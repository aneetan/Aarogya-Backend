import embeddingService from "./embedding.service";
import vectorStoreService from "./vectorStore.service";
import { ChatResponse, DatasetProps } from "../types/embedding.types";
import { getGenerativeModel } from "../config/gemini";
import formatResponse from "../helpers/formatResponse.helper";

class ChatService {
   private embeddingService:  typeof embeddingService;
   private vectorStore: typeof vectorStoreService;
   private dataset: DatasetProps;
   private initialized: boolean;

   constructor(dataset: DatasetProps) {
      this.embeddingService = embeddingService;
      this.vectorStore = vectorStoreService;
      this.dataset = dataset;
      this.initialized = false;
   }

    // Initialize the service with embeddings
   async initialize() {
      if (this.initialized) return;

      const embeddedIntents = await this.embeddingService.generateAllEmbeddings(this.dataset);
      await vectorStoreService.initialize();
      await this.vectorStore.addVectors(embeddedIntents);

      this.initialized = true;
   }

    // Process a user message and generate a response
    async processMessage(userMessage: string):  Promise<ChatResponse> {
      if (!this.initialized) await this.initialize();

      // Generate embedding for the user message
      const queryEmbedding = await this.embeddingService.generateEmbeddings(userMessage);

      // Find similar intents
      const similarIntents = await this.vectorStore.findSimilarVectors(queryEmbedding);

      if (similarIntents.length === 0) {
         return {
         response: "I'm not sure how to help with that. Please try to describe your first aid concern more specifically, or call emergency services if this is an urgent medical situation.",
         sources: []
         };
      }

      // Prepare context from similar intents
      const context = similarIntents.map(item => {
         const intent = item.intent;
         const steps = intent.response.steps.map(step => 
         `${step.step_number}. ${step.instruction}`
         ).join('\n');
         
         return `
            TOPIC: ${intent.intent_name}
            CONTEXT: ${intent.response.context || 'No additional context'}
            STEPS:
            ${steps}
            NOTES: ${intent.response.additional_notes || 'No additional notes'}
            WARNINGS: ${intent.metadata.warnings.join('; ')}
            SOURCE: ${intent.metadata.source}
            `;
      }).join('\n\n');

      // Generate response using Gemini
      const model = getGenerativeModel();
      const prompt = `
         You are a first aid assistant. Use the following context to answer the user's question.
         Always prioritize safety and recommend seeking professional medical help when appropriate.

         Context information from our first aid database:
         ${context}

         User question: "${userMessage}"

         Please provide a helpful, accurate response based on the context above. 
         Format your response clearly with the following structure:

         1. Start with a brief introduction if needed
         2. List any important WARNINGS first (safety precautions)
         3. Provide step-by-step instructions in numbered format
         4. Include any additional notes or important information
         5. End with a recommendation to seek professional medical help

         Important formatting rules:
         - Do NOT use markdown formatting (no **, *, etc.)
         - Use clear line breaks between sections
         - Number steps clearly (1., 2., 3., etc.)
         - Keep the language simple and easy to understand
         - If the context doesn't contain relevant information, acknowledge this and suggest contacting medical professionals.
      `;

       try {
         const result = await model.generateContent(prompt);
         const response = await result.response;
         const text = response.text();

         const formattedResponse = formatResponse(text);
         
         return {
         response: formattedResponse,
         sources: similarIntents.map(item => ({
            intent: item.intent.intent_name,
            similarity: item.similarity,
            source: item.intent.metadata.source
         }))
         };
      } catch (error) {
         console.error('Error generating response:', error);
         return {
         response: "I'm experiencing technical difficulties. Please try again later or seek help from a medical professional if this is urgent.",
         sources: []
      };
   }
   }
}

export function createChatService(dataset: DatasetProps): ChatService {
  return new ChatService(dataset);
}
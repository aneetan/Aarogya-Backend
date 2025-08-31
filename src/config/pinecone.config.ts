import { Pinecone } from "@pinecone-database/pinecone";
require('dotenv').config();

class PineconeConfig {
    private static instance: PineconeConfig;
    private pinecone: Pinecone;
    private isInitialized= false;

    private constructor() {
      this.pinecone = new Pinecone({
         apiKey: process.env.PINECONE_API_KEY!,
      })
    }

    public static getInstance() : PineconeConfig {
      if(!PineconeConfig.instance) {
         PineconeConfig.instance = new PineconeConfig();
      }

      return PineconeConfig.instance;
    }

    public async initialize(): Promise<void> {
      if (this.isInitialized) return;

      try {
         // Verify connection by listing indexes
         await this.pinecone.listIndexes();
         this.isInitialized = true;
      } catch (error) {
         console.error('Failed to initialize Pinecone client:', error);
         throw error;
      }
   }

   public getPineconeClient(): Pinecone {
      if (!this.isInitialized) {
         throw new Error('Pinecone client not initialized. Call initialize() first.');
      }
      return this.pinecone;
   }

   public getIndex(indexName: string) {
      return this.getPineconeClient().index(indexName);
   }
}

export default PineconeConfig;
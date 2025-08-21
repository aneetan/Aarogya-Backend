 import { Pinecone } from '@pinecone-database/pinecone';

export interface PineconeVector {
  id: string;
  values: number[];
  metadata: {
    text: string;
    page: number;
    chunkIndex: number;
    source: string;
    fullTextLength: number;
  };
}

export class PineconeService {
  private pinecone: Pinecone;
  private index: any;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  async initIndex(indexName: string = 'aidlink') {
    this.index = this.pinecone.Index(indexName);
    console.log('✅ Pinecone index initialized');
  }

  async upsertVectors(vectors: PineconeVector[]) {
    try {
      await this.index.upsert(vectors);
      console.log(`✅ Saved ${vectors.length} vectors to Pinecone`);
    } catch (error) {
      console.error('Error saving vectors to Pinecone:', error);
      throw error;
    }
  }
}
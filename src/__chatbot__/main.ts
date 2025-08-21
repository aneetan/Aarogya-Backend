import dotenv from 'dotenv';
import { PineconeService, PineconeVector } from './pineconeService';
import { GeminiService } from './embeddingServices';
import { PDFTextProcessor } from './pdfLoader';
import { Chunk } from '../types/chatbot';

dotenv.config();

class VectorizationPipeline {
  private geminiService: GeminiService;
  private pineconeService: PineconeService;

  constructor() {
    this.geminiService = new GeminiService();
    this.pineconeService = new PineconeService();
  }

  async run() {
    const textFilePath = "src/__chatbot__/data_sources/extracted_text.txt";
    
    try {
      // 1. Process PDF text into chunks
      const chunks = await PDFTextProcessor.processBySections(textFilePath);
      
      // 2. Initialize Pinecone
      await this.pineconeService.initIndex();
      
      // 3. Generate embeddings and prepare vectors
      const vectors = await this.prepareVectors(chunks);
      
      // 4. Save to Pinecone in batches
      await this.saveVectorsInBatches(vectors, 10);
      
      console.log('Pipeline completed successfully!');
      
    } catch (error) {
      console.error('Pipeline failed:', error);
      process.exit(1);
    }
  }

  private async prepareVectors(chunks: Chunk[]): Promise<PineconeVector[]> {
    const vectors: PineconeVector[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`🔨 Preparing chunk ${i + 1}/${chunks.length}...`);
      
      try {
        const embedding = await this.geminiService.generateEmbedding(chunk.text);
        
        const vector: PineconeVector = {
          id: `chunk-${chunk.metadata.chunkIndex}-page-${chunk.metadata.page}`,
          values: embedding,
          metadata: {
            text: chunk.text.substring(0, 500),
            page: chunk.metadata.page,
            chunkIndex: chunk.metadata.chunkIndex,
            source: chunk.metadata.source,
            fullTextLength: chunk.text.length
          }
        };
        
        vectors.push(vector);
        
        // Small delay to avoid rate limiting
        if (i % 5 === 0) {
          await this.delay(500);
        }
        
      } catch (error) {
        console.error(`Error preparing chunk ${i}:`, error);
      }
    }
    
    return vectors;
  }

  private async saveVectorsInBatches(vectors: PineconeVector[], batchSize: number) {
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      
      try {
        await this.pineconeService.upsertVectors(batch);
        await this.delay(1000); 
      } catch (error) {
        console.error(`Error saving batch ${Math.floor(i/batchSize) + 1}:`, error);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the pipeline
async function main() {  
  const pipeline = new VectorizationPipeline();
  await pipeline.run();
}

main().catch(console.error);
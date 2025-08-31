import { Pinecone } from "@pinecone-database/pinecone";
import { context } from "@pinecone-database/pinecone/dist/assistant/data/context";
import { DatasetProps, FindSimilarVectorsResult, IntentProps, PineconeQueryResponse, VectorProps } from "../types/embedding.types";
require('dotenv').config();

class VectorStoreService {
   pinecone: Pinecone;
   indexName: string;
   vectorDimensions: number;
   index: any;

   constructor() {
      this.pinecone = new Pinecone({
         apiKey: process.env.PINECONE_API_KEY!,
      });
      this.indexName = 'firstaid-embeddings';
      this.vectorDimensions = 768;
      this.index = this.pinecone.Index(this.indexName);
   }

   // Add embedded intents to vector store
   async addVectors (embeddedIntents: IntentProps[]): Promise<void> {
      try {
         const vectors: VectorProps[] = embeddedIntents.map((intent, idx) => ({
            id: `intent-${idx}-${intent.intent_name.replace(/\s+/g, '-').toLowerCase()}`,
            values: intent.embeddings ?? [],
            metadata : {
               intent_name: intent.intent_name,
               immediate_action: intent.response.immediate_action || '',
               context: intent.response.context || '',
               steps: JSON.stringify(intent.response.steps),
               additional_notes: intent.response.additional_notes || '',
               warnings: JSON.stringify(intent.metadata.warnings),
               source: intent.metadata.source,
               last_updated: intent.metadata.last_updated,
               user_queries: JSON.stringify(intent.user_queries)
            }
         }));

         // Upsert vectors in batches (Pinecone recommends batches of 100)
         const batchSize = 100;
         for (let i= 0; i < vectors.length; i += batchSize ){
            const batch = vectors.slice(i, i+batchSize);
            await this.index.upsert(batch);
         }

         console.log(`Successfully added ${vectors.length} vectors to Pinecone`);
      } catch (e) {
         console.error('Error adding vectors to Pinecone:', e);
         throw e;
      }
   }

    // Find the most similar intents to a query
   async findSimilarVectors(
      queryEmbedding: number[],
      topK: number = 3
   ): Promise<FindSimilarVectorsResult[]> {
      try {
         const queryResponse: PineconeQueryResponse = await this.index.query({
            vector: queryEmbedding,
            topK: topK,
            includeMetadata: true,
            includeValues: false
         });

         // Transform Pinecone results to match our expected format
         return queryResponse.matches
            .filter(match => match.score > 0.7) // Only return reasonably similar results
            .map(match => ({
               similarity: match.score,
               intent: [{
                  intent_name: match.metadata.intent_name,
                  response: {
                     immediate_action: match.metadata.immediate_action,
                     context: match.metadata.context,
                     steps: JSON.parse(match.metadata.steps),
                     additional_notes: match.metadata.additional_notes
                  },
                  metadata: {
                     warnings: JSON.parse(match.metadata.warnings),
                     source: match.metadata.source,
                     last_updated: match.metadata.last_updated
                  },
                  user_queries: JSON.parse(match.metadata.user_queries)
               }]
            }));
      } catch (e) {
         console.error('Error querying Pinecone:', e);
         throw e;
      }
   }
}

export default new VectorStoreService();
import { PineconeRecord, RecordMetadata } from "@pinecone-database/pinecone";

export interface DatasetProps {
   intents: IntentProps[];
}

export interface IntentProps {
   intent_name: string;
   user_queries : string[];
   response : ResponseProps;
   metadata: MetadataProps;
   embeddings?: number[];
}

export interface ResponseProps {
   immediate_action: string;
   context: string;
   steps: StepProps[];
   additional_notes: string;
}

export interface StepProps{
   step_number: number;
   instruction: string;
}

export interface MetadataProps {
   warnings: string[];
   source: string;
   last_updated: string;
}

export interface VectorMetadata extends RecordMetadata {
   intent_name: string;
   immediate_action: string;
   context: string;
   steps: string;
   additional_notes: string;
   warnings: string;
   source: string;
   last_updated: string;
   user_queries: string;
}

export interface VectorProps extends PineconeRecord {
   id: string;
   values: number[];
   metadata: VectorMetadata;
}

export interface FindSimilarVectorsResult {
   similarity: number;
    intent: {
    intent_name: string;
    response: ResponseProps;
    metadata: MetadataProps;
    user_queries: string[];
  };
}

export interface PineconeMatch {
   id: string;
   score: number;
   metadata?: Record<string, any>;
   values?: number[];
}

export interface PineconeQueryResponse {
   matches: PineconeMatch[];
   namespace: string;
}

export interface ChatResponse {
   response: string;
   sources : {
      intent: string;
      similarity: number;
      source: string;
   }[];
}
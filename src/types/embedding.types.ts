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

export interface VectorMetadata {
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

export interface VectorProps {
   id: string;
   values: number[];
   metadata: VectorMetadata;
}

export interface FindSimilarVectorsResult {
   similarity: number;
   intent: IntentProps;
}

export interface PineconeMatch {
   score: number;
   metadata: {
      intent_name: string;
      immediate_action: string;
      context: string;
      steps: string;
      additional_notes: string;
      warnings: string;
      source: string;
      last_updated: string;
      user_queries: string;
   };
   values?: number[];
}

export interface PineconeQueryResponse {
   matches: PineconeMatch[];
}

export interface ChatResponse {
   response: string;
   sources : {
      intent: string;
      similarity: number;
      source: string;
   }[];
}
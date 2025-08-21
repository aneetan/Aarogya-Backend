export interface Chunk {
  text: string;
  metadata: {
    page: number;
    chunkIndex: number;
    source: string;
  };
}

export interface VectorEmbedding {
  id: string;
  values: number[];
  metadata: Chunk['metadata'] & { text: string };
}

export interface PineconeConfig {
  apiKey: string;
  indexName: string;
}
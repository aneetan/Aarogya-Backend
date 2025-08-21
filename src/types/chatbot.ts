export interface Chunk {
  text: string;
  metadata: {
    page: number;
    chunkIndex: number;
    source: string;
  };
}
import { StepProps } from "./embedding.types";

export interface Chunk {
  text: string;
  metadata: {
    page: number;
    chunkIndex: number;
    source: string;
  };
}

export interface MedicalResponse {
  title: string;
  overview?: string;
  warnings: string[];
  steps: StepProps[];
  additionalNotes?: string[];
  emergencyAction?: string;
}
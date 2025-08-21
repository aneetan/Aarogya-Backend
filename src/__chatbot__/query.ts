 import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';

export interface QueryResult {
  text: string;
  score: number;
  page: number;
  chunkIndex: number;
}

export class QueryService {
  private genAI: GoogleGenerativeAI;
  private pinecone: Pinecone;
  private indexName: string;

  constructor(geminiApiKey: string, pineconeApiKey: string, indexName: string) {
    this.genAI = new GoogleGenerativeAI(geminiApiKey);
    this.pinecone = new Pinecone({ apiKey: pineconeApiKey });
    this.indexName = indexName;
  }

  private async getIndex() {
    return this.pinecone.Index(this.indexName);
  }

  async searchSimilarDocuments(query: string, topK: number = 5): Promise<QueryResult[]> {
    try {
      // Generate query embedding
      const model = this.genAI.getGenerativeModel({ model: "models/embedding-001" });
      const result = await model.embedContent(query);
      const queryEmbedding = result.embedding.values;

      // Query Pinecone
      const index = await this.getIndex();
      const response = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      });

      // Format results
      const results: QueryResult[] = [];
      
      if (response.matches) {
        for (const match of response.matches) {
          if (match.metadata) {
            const metadata = match.metadata as any;
            results.push({
              text: metadata.text || '',
              score: match.score || 0,
              page: metadata.page || 1,
              chunkIndex: metadata.chunkIndex || 0
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search documents');
    }
  }

  async generateAnswerFromContext(question: string, context: QueryResult[]): Promise<string> {
    try {
      if (context.length === 0) {
        return "I couldn't find any relevant information in the documents to answer your question.";
      }

      // Prepare context text from search results
      const contextText = context
        .map((result, index) => 
          `[Source ${index + 1}, Page ${result.page}]: ${result.text}`
        )
        .join('\n\n');

      // Use Gemini to generate an answer
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
        }
      });

      const prompt = `Based on the following context from documents, please answer the question.

CONTEXT:
${contextText}

QUESTION: ${question}

INSTRUCTIONS:
1. Provide a clear and concise answer based ONLY on the provided context
2. If the context doesn't contain enough information, say "I cannot find enough information to answer this question based on the provided documents."
3. Do not make up information or use external knowledge
4. Keep your answer focused and relevant to the question

ANSWER:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text() || "I couldn't generate an answer for this question.";
    } catch (error) {
      console.error('Error generating answer:', error);
      throw new Error('Failed to generate answer');
    }
  }

  async askQuestion(question: string, topK: number = 3): Promise<{
    answer: string;
    sources: QueryResult[];
  }> {
    try {
      // First, find relevant document chunks
      const relevantChunks = await this.searchSimilarDocuments(question, topK);
      
      // Generate answer using the context
      const answer = await this.generateAnswerFromContext(question, relevantChunks);

      return {
        answer,
        sources: relevantChunks
      };
    } catch (error) {
      console.error('Error in askQuestion:', error);
      throw new Error('Failed to process question');
    }
  }
}
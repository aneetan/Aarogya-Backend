import dotenv from 'dotenv';
import {PDFTextProcessor } from './pdfLoader';
import fs from 'fs';
import { Chunk } from '../types/chatbot';

dotenv.config();

class TextVectorizer {
  async processPDFText(filePath: string): Promise<Chunk[]> {
    try {
      await PDFTextProcessor.analyzeTextFile(filePath);

      const chunks = await PDFTextProcessor.processBySections(filePath);
      
      return chunks;
      
    } catch (error) {
      console.error('Error processing PDF text:', error);
      throw error;
    }
  }
}

async function main() {
  const textFilePath = "src/__chatbot__/data_sources/extracted_text.txt";
  
  if (!fs.existsSync(textFilePath)) {
    console.error(`❌ Text file not found: ${textFilePath}`);
    process.exit(1);
  }

  console.log(`📖 Processing: ${textFilePath}`);
  
  try {
    const vectorizer = new TextVectorizer();
    const chunks = await vectorizer.processPDFText(textFilePath);
        
    saveChunksToFile(chunks, 'src/__chatbot__/data_sources/vector/processed_chunks.json');
    
  } catch (error) {
    console.error('❌ Failed to process PDF text:', error);
    process.exit(1);
  }
}

function saveChunksToFile(chunks: Chunk[], filename: string): void {
  try {
    const data = chunks.map(chunk => ({
      text: chunk.text.substring(0, 100) + '...',
      metadata: chunk.metadata
    }));
    
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  } catch (error) {
    console.warn('Could not save chunks to file:', error);
  }
}

// Enable periodic garbage collection
if (global.gc) {
  setInterval(() => {
    if (typeof global.gc === 'function') {
      global.gc();
      console.log('🧹 Periodic garbage collection performed');
    }
  }, 30000);
}

// Run the application
main().catch(console.error);
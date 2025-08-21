import fs from 'fs';
import readline from 'readline';
import { Chunk } from '../types/chatbot';

export class PDFTextProcessor {
  // Analyze the text file to understand its structure
  static async analyzeTextFile(filePath: string): Promise<void> {    
    let totalLines = 0;
    let totalChars = 0;
    let emptyLines = 0;
    let sectionCount = 0;

    const fileStream = fs.createReadStream(filePath, {
      encoding: 'utf8',
      highWaterMark: 64 * 1024
    });

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      totalLines++;
      totalChars += line.length;
      
      if (line.trim().length === 0) {
        emptyLines++;
      }
      
      // Count section headers
      if (this.isSectionHeader(line)) {
        sectionCount++;
      }
    }
  }

  // Detect section headers based on your PDF structure
  private static isSectionHeader(line: string): boolean {
    const trimmedLine = line.trim();
    return (
      trimmedLine.startsWith('When the person') ||
      trimmedLine.startsWith('When the person is') ||
      trimmedLine.includes('coMbat rules') ||
      trimmedLine.includes('Wounded') ||
      trimmedLine.includes('eneMy') ||
      trimmedLine.includes('ciVilians') ||
      trimmedLine.includes('respect for') ||
      trimmedLine.includes('CODE OF CONDUCT') ||
      trimmedLine.includes('SUGAR') && trimmedLine.includes('SALT') && trimmedLine.includes('WATER') ||
      (trimmedLine.length > 10 && /^[A-Z][a-z]+/.test(trimmedLine) && !trimmedLine.includes(' '))
    );
  }

  // Main section-based processing method
  static async processBySections(filePath: string): Promise<Chunk[]> {
    const chunks: Chunk[] = [];
    let currentSection = '';
    let currentSectionTitle = '';
    let chunkIndex = 0;
    let pageNumber = 1;

    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(filePath, {
        encoding: 'utf8',
        highWaterMark: 32 * 1024 
      });

      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      rl.on('line', (line) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine === '' || trimmedLine.includes('---')) {
          pageNumber++;
          return;
        }

        if (this.isSectionHeader(trimmedLine)) {
          // Save the previous section if it has content
          if (currentSection.trim().length > 0) {
            this.addSectionAsChunk(currentSection, currentSectionTitle, pageNumber, chunkIndex, chunks);
            chunkIndex++;
            currentSection = '';
          }
          
          currentSectionTitle = trimmedLine;
          currentSection = trimmedLine + '\n';
        } else {
          currentSection += line + '\n';
        }
      });

      rl.on('close', () => {
        if (currentSection.trim().length > 0) {
          this.addSectionAsChunk(currentSection, currentSectionTitle, pageNumber, chunkIndex, chunks);
        }
        
        resolve(chunks);
      });

      rl.on('error', (error) => {
        reject(new Error(`Error reading file: ${error}`));
      });
    });
  }

  private static addSectionAsChunk(
    sectionText: string,
    sectionTitle: string,
    page: number,
    chunkIndex: number,
    chunks: Chunk[]
  ): void {
    const cleanText = sectionText.trim();
    
    if (cleanText.length > 50) { 
      chunks.push({
        text: cleanText,
        metadata: {
          page,
          chunkIndex,
          source: 'pdf'
        }
      });
    }
  }
}
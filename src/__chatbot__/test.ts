import { QueryService } from './query';
import dotenv from 'dotenv';

dotenv.config();

async function testWithPrompt() {
  console.log('🧠 Testing prompt-based answers...\n');

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;

  if (!geminiApiKey || !pineconeApiKey || !indexName) {
    throw new Error('Missing required environment variables');
  }

  const queryService = new QueryService(geminiApiKey, pineconeApiKey, indexName);

  // Test questions
  const testQuestions = [
    "My friend is choking",
    "My friend is bleeding.",
    "Someone is fainting"
  ];

  for (const question of testQuestions) {
    console.log(`\n🔵 QUESTION: "${question}"`);
    console.log('─'.repeat(80));

    try {
      const result = await queryService.askQuestion(question, 3);
      
      console.log('\n🟢 ANSWER:');
      console.log(result.answer);

      console.log('\n' + '═'.repeat(80));

      // Add a small delay between questions
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Error processing question: ${error}`);
    }
  }
}

// Run the test
testWithPrompt().catch(console.error);
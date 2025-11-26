import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in .env');
      process.exit(1);
    }

    console.log('🔑 Using API Key:', apiKey.substring(0, 10) + '...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try different model names
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
    ];

    console.log('\n🧪 Testing available models...\n');

    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName} - WORKS!`);
        console.log(`   Response: ${text.substring(0, 50)}...\n`);
      } catch (error: any) {
        console.log(`❌ ${modelName} - Failed: ${error.message.substring(0, 100)}\n`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

listModels();

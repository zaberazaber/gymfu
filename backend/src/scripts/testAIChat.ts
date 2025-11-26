import mongoose from 'mongoose';
import { aiProviderManager } from '../services/AIProviderManager';
import { aiService } from '../services/AIService';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymfu';

async function testAIChat() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Initialize AI providers
    console.log('🤖 Initializing AI providers...');
    await aiProviderManager.initialize();
    console.log('✅ AI providers initialized\n');

    // Check provider health
    console.log('🏥 Checking provider health...');
    const health = await aiProviderManager.checkHealth();
    console.log('Provider Health Status:');
    Object.entries(health).forEach(([name, status]) => {
      console.log(`  ${status ? '✅' : '❌'} ${name}: ${status ? 'Available' : 'Unavailable'}`);
    });
    console.log('');

    // Test AI chat with a simple prompt
    console.log('💬 Testing AI Chat...');
    const testPrompt = 'What are 3 quick tips for staying fit?';
    console.log(`Prompt: "${testPrompt}"\n`);

    const response = await aiService.generateCompletion(
      'test-user-123',
      'chat',
      testPrompt,
      {
        maxTokens: 200,
        temperature: 0.7,
      }
    );

    console.log('🎉 AI Response:');
    console.log('─'.repeat(60));
    console.log(response);
    console.log('─'.repeat(60));
    console.log('\n✅ AI Chat test completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testAIChat();

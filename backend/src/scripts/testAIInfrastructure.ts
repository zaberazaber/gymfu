import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initializeDatabases } from '../config/database';

dotenv.config();

const testInfrastructure = async () => {
  console.log('🧪 Testing AI Infrastructure...\n');

  try {
    // Test 1: Database Connections
    console.log('📊 Test 1: Database Connections');
    console.log('================================');
    
    try {
      await initializeDatabases();
      console.log('✅ PostgreSQL: Connected');
      console.log('✅ MongoDB: Connected');
      console.log('✅ Redis: Connected');
    } catch (error: any) {
      console.log('❌ Database connection failed:', error.message);
      console.log('\n💡 Make sure MongoDB and Redis are running:');
      console.log('   - MongoDB: Should be running on localhost:27017');
      console.log('   - Redis: Should be running on localhost:6379');
      process.exit(1);
    }

    // Test 2: AI Provider Configuration
    console.log('\n📊 Test 2: AI Provider Configuration');
    console.log('====================================');
    
    const AIProviderConfig = (await import('../models/AIProviderConfig')).default;
    const configs = await AIProviderConfig.find({});
    
    if (configs.length === 0) {
      console.log('⚠️  No AI providers configured yet');
      console.log('💡 Run: npm run db:seed-ai-providers');
    } else {
      console.log(`✅ Found ${configs.length} AI provider configurations:`);
      configs.forEach(config => {
        const hasKey = config.apiKey && config.apiKey.length > 10;
        const status = config.enabled && hasKey ? '✅ Ready' : '⚠️  No API key';
        console.log(`   - ${config.name}: ${status}`);
      });
    }

    // Test 3: Check API Keys
    console.log('\n📊 Test 3: API Keys Configuration');
    console.log('==================================');
    
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const huggingfaceKey = process.env.HUGGINGFACE_API_KEY;
    
    let hasAnyKey = false;
    
    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      console.log('✅ OpenAI API key configured');
      hasAnyKey = true;
    } else {
      console.log('⚠️  OpenAI API key not configured');
    }
    
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      console.log('✅ Gemini API key configured');
      hasAnyKey = true;
    } else {
      console.log('⚠️  Gemini API key not configured');
    }
    
    if (huggingfaceKey && huggingfaceKey !== 'your_huggingface_api_key_here') {
      console.log('✅ Hugging Face API key configured');
      hasAnyKey = true;
    } else {
      console.log('⚠️  Hugging Face API key not configured');
    }
    
    if (!hasAnyKey) {
      console.log('\n💡 To enable AI features, add at least one API key to backend/.env:');
      console.log('   Get free keys from:');
      console.log('   - OpenAI: https://platform.openai.com/api-keys');
      console.log('   - Gemini: https://makersuite.google.com/app/apikey');
      console.log('   - Hugging Face: https://huggingface.co/settings/tokens');
    }

    // Test 4: AI Provider Manager
    console.log('\n📊 Test 4: AI Provider Manager');
    console.log('===============================');
    
    try {
      const { aiProviderManager } = await import('../services/AIProviderManager');
      await aiProviderManager.initialize();
      
      const providers = aiProviderManager.getProviders();
      if (providers.length > 0) {
        console.log(`✅ AI Provider Manager initialized with ${providers.length} provider(s)`);
        
        // Check health
        const health = await aiProviderManager.checkHealth();
        console.log('   Provider health:');
        Object.entries(health).forEach(([name, status]) => {
          console.log(`   - ${name}: ${status ? '✅ Available' : '❌ Unavailable'}`);
        });
      } else {
        console.log('⚠️  No providers available (need API keys)');
      }
    } catch (error: any) {
      console.log('⚠️  AI Provider Manager initialization skipped:', error.message);
    }

    // Test 5: Cache Manager
    console.log('\n📊 Test 5: Cache Manager');
    console.log('========================');
    
    try {
      const { cacheManager } = await import('../services/CacheManager');
      const isAvailable = await cacheManager.isAvailable();
      
      if (isAvailable) {
        console.log('✅ Cache Manager: Available');
        
        const stats = await cacheManager.getStats();
        console.log(`   - Total keys: ${stats.totalKeys}`);
        console.log(`   - AI cache keys: ${stats.aiKeys}`);
        console.log(`   - Memory used: ${stats.memoryUsed}`);
        
        // Test cache operations
        const testKey = 'test:infrastructure:check';
        await cacheManager.set(testKey, 'test-value', 10);
        const value = await cacheManager.get(testKey);
        
        if (value === 'test-value') {
          console.log('✅ Cache read/write: Working');
          await cacheManager.delete(testKey);
        } else {
          console.log('⚠️  Cache read/write: Failed');
        }
      } else {
        console.log('❌ Cache Manager: Not available (Redis not connected)');
      }
    } catch (error: any) {
      console.log('❌ Cache Manager error:', error.message);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 SUMMARY');
    console.log('='.repeat(50));
    
    if (hasAnyKey && configs.length > 0) {
      console.log('✅ AI Infrastructure is ready!');
      console.log('   You can now start the server and use AI features.');
      console.log('\n   Next steps:');
      console.log('   1. Start server: npm run dev');
      console.log('   2. Test health: curl http://localhost:3000/api/v1/ai/health');
    } else if (configs.length === 0) {
      console.log('⚠️  Setup incomplete - Need to seed providers');
      console.log('\n   Next steps:');
      console.log('   1. Run: npm run db:seed-ai-providers');
      console.log('   2. Add API key to backend/.env');
      console.log('   3. Run this test again');
    } else {
      console.log('⚠️  Setup incomplete - Need API keys');
      console.log('\n   Next steps:');
      console.log('   1. Get a free API key (see links above)');
      console.log('   2. Add it to backend/.env');
      console.log('   3. Run this test again');
    }
    
    console.log('='.repeat(50) + '\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

testInfrastructure();

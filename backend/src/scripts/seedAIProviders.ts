import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AIProviderConfig from '../models/AIProviderConfig';

dotenv.config();

const seedAIProviders = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymfu';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing configurations
    await AIProviderConfig.deleteMany({});
    console.log('Cleared existing AI provider configurations');

    // Helper to check if API key is a real key (not a placeholder)
    const isValidApiKey = (key: string | undefined): boolean => {
      if (!key) return false;
      // Check for common placeholder patterns
      const placeholders = ['your_', 'your-', 'placeholder', 'xxx', 'key_here', 'api_key_here'];
      const lowerKey = key.toLowerCase();
      return !placeholders.some(p => lowerKey.includes(p));
    };

    // Seed AI provider configurations
    const providers = [
      {
        name: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        endpoint: 'https://api.openai.com/v1',
        modelName: 'gpt-3.5-turbo',
        rateLimit: {
          requestsPerMinute: 60,
          tokensPerDay: 10000,
        },
        currentUsage: {
          requestsThisMinute: 0,
          tokensToday: 0,
          lastReset: new Date(),
        },
        enabled: isValidApiKey(process.env.OPENAI_API_KEY),
        priority: 1, // Highest priority
      },
      {
        name: 'gemini',
        apiKey: process.env.GEMINI_API_KEY || '',
        endpoint: 'https://generativelanguage.googleapis.com/v1',
        modelName: 'gemini-2.5-flash',
        rateLimit: {
          requestsPerMinute: 60,
          tokensPerDay: 50000, // Gemini has generous free tier
        },
        currentUsage: {
          requestsThisMinute: 0,
          tokensToday: 0,
          lastReset: new Date(),
        },
        enabled: isValidApiKey(process.env.GEMINI_API_KEY),
        priority: 2,
      },
      {
        name: 'huggingface',
        apiKey: process.env.HUGGINGFACE_API_KEY || '',
        endpoint: 'https://api-inference.huggingface.co',
        modelName: 'mistralai/Mistral-7B-Instruct-v0.1',
        rateLimit: {
          requestsPerMinute: 30,
          tokensPerDay: 5000,
        },
        currentUsage: {
          requestsThisMinute: 0,
          tokensToday: 0,
          lastReset: new Date(),
        },
        enabled: isValidApiKey(process.env.HUGGINGFACE_API_KEY),
        priority: 3,
      },
    ];

    await AIProviderConfig.insertMany(providers);
    console.log('✅ AI provider configurations seeded successfully');
    console.log(`Enabled providers: ${providers.filter(p => p.enabled).map(p => p.name).join(', ')}`);
    
    if (providers.every(p => !p.enabled)) {
      console.warn('⚠️  No API keys configured. Please add API keys to .env file:');
      console.warn('   - OPENAI_API_KEY');
      console.warn('   - GEMINI_API_KEY');
      console.warn('   - HUGGINGFACE_API_KEY');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding AI providers:', error);
    process.exit(1);
  }
};

seedAIProviders();

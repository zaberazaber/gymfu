# AI Infrastructure Testing Guide

## Prerequisites

Before testing, ensure you have:
1. MongoDB running (for provider configs and interaction logs)
2. Redis running (for caching)
3. At least one AI provider API key configured

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install the new AI SDK packages:
- `openai` (^4.20.0)
- `@google/generative-ai` (^0.1.3)
- `@huggingface/inference` (^2.6.4)

## Step 2: Configure API Keys

### Option A: Get Free API Keys (Recommended)

1. **OpenAI** (Free tier with limits)
   - Visit: https://platform.openai.com/api-keys
   - Sign up and create an API key
   - Copy the key (starts with `sk-`)

2. **Google Gemini** (Generous free tier)
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Create API key
   - Copy the key

3. **Hugging Face** (Free tier)
   - Visit: https://huggingface.co/settings/tokens
   - Create account and generate token
   - Copy the token (starts with `hf_`)

### Option B: Use Test Mode (No API Keys)

If you don't have API keys yet, the system will still start but AI features won't work. You can test the infrastructure without actual AI calls.

### Add Keys to .env

Edit `backend/.env` and add your keys:

```env
# AI Providers (Free Tier)
OPENAI_API_KEY=sk-your-actual-key-here
GEMINI_API_KEY=your-gemini-key-here
HUGGINGFACE_API_KEY=hf_your-token-here
```

**Note**: You only need ONE API key to test. The system will use whichever provider has a valid key.

## Step 3: Seed AI Provider Configurations

```bash
cd backend
npm run db:seed-ai-providers
```

**Expected Output:**
```
Connected to MongoDB
Cleared existing AI provider configurations
✅ AI provider configurations seeded successfully
Enabled providers: openai, gemini, huggingface
Disconnected from MongoDB
```

If you see warnings about missing API keys, that's okay - just add at least one key to `.env`.

## Step 4: Start the Server

```bash
npm run dev
```

**Expected Output:**
```
🔌 Connected to PostgreSQL
🍃 Connected to MongoDB
🔴 Connected to Redis
🤖 AI Provider Manager initialized
🚀 Server is running on port 3000
📊 Health check available at /health
💾 Database health check at /health/db
🔐 Auth routes enabled at /api/v1/auth
...
🤖 AI routes enabled at /api/v1/ai
```

**Key Line to Look For:**
```
🤖 AI Provider Manager initialized
```

If you see this, the AI infrastructure is ready!

**If You See Warnings:**
```
⚠️  AI Provider Manager initialization failed: ...
   AI features will not be available
```

This means no valid API keys were found. Add at least one key to `.env` and restart.

## Step 5: Test AI Service Health

### Test 1: Health Check (No Auth Required)

```bash
curl http://localhost:3000/api/v1/ai/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "providers": {
      "openai": true,
      "gemini": true,
      "huggingface": false
    },
    "cache": {
      "available": true,
      "stats": {
        "totalKeys": 0,
        "aiKeys": 0,
        "memoryUsed": "1.2M"
      }
    }
  }
}
```

**What This Tells You:**
- `providers`: Which AI providers are available (true = working, false = no API key or error)
- `cache.available`: Whether Redis caching is working
- `cache.stats`: Current cache statistics

### Test 2: Get AI Usage Stats (Requires Auth)

First, you need an auth token. Register or login to get one:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "1234567890",
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# This will return an OTP in the console logs
# Then verify OTP (check server logs for the OTP code)
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "1234567890",
    "otp": "123456"
  }'
```

**Save the token from the response**, then test AI stats:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/api/v1/ai/stats
```

**Expected Response (First Time):**
```json
{
  "success": true,
  "data": {
    "totalInteractions": 0,
    "cachedInteractions": 0,
    "cacheHitRate": 0,
    "totalTokens": 0,
    "byType": {},
    "byProvider": {}
  }
}
```

## Step 6: Test AI Service Programmatically

Create a test file to verify the AI service works:

```bash
# Create test file
cat > backend/src/scripts/testAIService.ts << 'EOF'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { aiService } from '../services/AIService';
import { initializeDatabases } from '../config/database';

dotenv.config();

const testAIService = async () => {
  try {
    // Connect to databases
    await initializeDatabases();
    console.log('✅ Connected to databases');

    // Initialize AI provider manager
    const { aiProviderManager } = await import('../services/AIProviderManager');
    await aiProviderManager.initialize();
    console.log('✅ AI Provider Manager initialized');

    // Test AI completion
    console.log('\n🧪 Testing AI completion...');
    const response = await aiService.generateCompletion(
      'test-user-123',
      'chat',
      'Say hello in one sentence',
      {
        maxTokens: 50,
        temperature: 0.7,
      }
    );

    console.log('\n✅ AI Response:', response);

    // Test caching (make same request again)
    console.log('\n🧪 Testing cache (same request)...');
    const cachedResponse = await aiService.generateCompletion(
      'test-user-123',
      'chat',
      'Say hello in one sentence',
      {
        maxTokens: 50,
        temperature: 0.7,
      }
    );

    console.log('✅ Cached Response:', cachedResponse);

    // Get usage stats
    console.log('\n📊 Usage Statistics:');
    const stats = await aiService.getUsageStats('test-user-123');
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testAIService();
EOF
```

Run the test:

```bash
npx ts-node backend/src/scripts/testAIService.ts
```

**Expected Output:**
```
✅ Connected to databases
✅ AI Provider Manager initialized

🧪 Testing AI completion...
Using AI provider: openai (attempt 1/3)
Cache SET: ai:test-user-123:chat:abc123... (TTL: 86400s)

✅ AI Response: Hello! I'm here to help you with your fitness journey.

🧪 Testing cache (same request)...
Cache HIT: ai:test-user-123:chat:abc123...
Returning cached AI response

✅ Cached Response: Hello! I'm here to help you with your fitness journey.

📊 Usage Statistics:
{
  "totalInteractions": 2,
  "cachedInteractions": 1,
  "cacheHitRate": 50,
  "totalTokens": 15,
  "byType": {
    "chat": 2
  },
  "byProvider": {
    "openai": 1,
    "cached": 1
  }
}

✅ All tests passed!
```

**What This Proves:**
- ✅ AI provider is working
- ✅ Caching is working (second request was cached)
- ✅ Logging is working (2 interactions recorded)
- ✅ Statistics are accurate (50% cache hit rate)

## Step 7: Test Provider Fallback

To test that fallback works when a provider fails, you can temporarily break one provider:

```bash
# Edit .env and set an invalid key
OPENAI_API_KEY=sk-invalid-key-for-testing

# Restart server
npm run dev
```

The system should automatically try the next provider (Gemini or Hugging Face).

## Step 8: Monitor Cache Performance

Check Redis to see cached AI responses:

```bash
# Connect to Redis CLI
redis-cli

# List all AI cache keys
KEYS ai:*

# Get a specific cached response
GET ai:test-user-123:chat:abc123...

# Check cache stats
INFO memory
```

## Common Issues & Solutions

### Issue 1: "AI Provider Manager initialization failed"

**Cause**: No valid API keys configured

**Solution**: Add at least one API key to `backend/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
```

### Issue 2: "Cannot find module 'openai'"

**Cause**: Dependencies not installed

**Solution**:
```bash
cd backend
npm install
```

### Issue 3: "Redis client not connected"

**Cause**: Redis is not running

**Solution**:
```bash
# Start Redis
redis-server

# Or on macOS with Homebrew
brew services start redis

# Or on Windows with WSL
sudo service redis-server start
```

### Issue 4: "All AI providers failed"

**Cause**: All API keys are invalid or rate limits exceeded

**Solution**:
1. Check API keys are correct
2. Verify you haven't exceeded free tier limits
3. Check provider status pages:
   - OpenAI: https://status.openai.com/
   - Google: https://status.cloud.google.com/

### Issue 5: Cache not working

**Cause**: Redis connection issue

**Solution**:
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check Redis is running
redis-cli INFO server
```

## Performance Benchmarks

After testing, you should see:

| Metric | Target | How to Check |
|--------|--------|--------------|
| First AI Request | < 5s | Check server logs for timing |
| Cached Request | < 100ms | Check "Cache HIT" in logs |
| Cache Hit Rate | > 40% | GET /api/v1/ai/stats |
| Provider Availability | > 95% | GET /api/v1/ai/health |

## Next Steps After Testing

Once all tests pass:

1. ✅ **Infrastructure is ready** - AI provider management, caching, and logging all work
2. 📝 **Implement features** - Start building actual AI features (workout analysis, nutrition, etc.)
3. 🧪 **Write property tests** - Implement Tasks 1.2, 1.4, 1.6 for comprehensive testing
4. 📊 **Monitor usage** - Use `/api/v1/ai/stats` to track API usage and costs

## Testing Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] At least one API key configured in `.env`
- [ ] MongoDB running and connected
- [ ] Redis running and connected
- [ ] AI providers seeded (`npm run db:seed-ai-providers`)
- [ ] Server starts without errors
- [ ] Health check returns success
- [ ] Test script runs successfully
- [ ] Cache is working (second request is faster)
- [ ] Statistics are being tracked

## Quick Test Commands

```bash
# 1. Install
cd backend && npm install

# 2. Seed providers
npm run db:seed-ai-providers

# 3. Start server
npm run dev

# 4. Test health (in another terminal)
curl http://localhost:3000/api/v1/ai/health

# 5. Run test script
npx ts-node backend/src/scripts/testAIService.ts
```

---

**Status**: If all tests pass, your AI infrastructure is production-ready! 🎉

**Need Help?** Check the error messages in server logs - they're designed to be helpful and point you to the solution.

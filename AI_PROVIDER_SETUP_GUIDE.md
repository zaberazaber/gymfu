# AI Provider Setup Guide 🤖

## Current Status
The AI providers have been seeded in the database, but they need valid API keys to work.

## Available Providers

### 1. Google Gemini (Currently Configured) ✅
You have a Gemini API key configured in your `.env` file:
```
GEMINI_API_KEY=AIzaSyAi4r94sF7LDDfnk12XSjMIS98cBZi25PM
```

**Status**: Should work after backend restart

### 2. OpenAI (Needs API Key) ⚠️
Currently has placeholder:
```
OPENAI_API_KEY=your_openai_api_key_here
```

**To enable**:
1. Get API key from: https://platform.openai.com/api-keys
2. Replace the placeholder in `backend/.env`
3. Restart backend

### 3. Hugging Face (Needs API Key) ⚠️
Currently has placeholder:
```
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

**To enable**:
1. Get API key from: https://huggingface.co/settings/tokens
2. Replace the placeholder in `backend/.env`
3. Restart backend

## Quick Fix - Use Gemini

Since you already have a Gemini API key, the AI Chat should work after restarting the backend:

```bash
# Stop the backend (Ctrl+C)
# Then restart it
cd backend
npm run dev
```

## Provider Priority

The system tries providers in this order:
1. OpenAI (priority: 1) - Most reliable but requires paid API key
2. Gemini (priority: 2) - Free tier available, good quality
3. Hugging Face (priority: 3) - Free tier available, variable quality

## Testing AI Providers

After restarting the backend, you can test the providers:

```bash
cd backend
npx ts-node src/scripts/testAIInfrastructure.ts
```

This will show which providers are working.

## Troubleshooting

### "All AI providers failed"
- Check that at least one provider has a valid API key
- Restart the backend after adding API keys
- Run the test script to verify provider status

### "Provider validation failed: unknown"
- This happens when no providers initialize successfully
- Make sure you have at least one valid API key
- Check the backend logs for specific provider errors

### Rate Limits
Each provider has rate limits:
- **OpenAI**: 3 requests/min, 10,000 tokens/day (free tier)
- **Gemini**: 15 requests/min, 1,500,000 tokens/day (free tier)
- **Hugging Face**: 10 requests/min, 100,000 tokens/day (free tier)

## Next Steps

1. **Restart your backend** - This will pick up the Gemini API key
2. **Test the AI Chat** - It should now work with Gemini
3. **Optional**: Add OpenAI or Hugging Face keys for fallback options

## Free API Keys

All three providers offer free tiers:

- **Gemini**: Already configured! ✅
- **OpenAI**: $5 free credit for new accounts
- **Hugging Face**: Completely free, no credit card required

---

**Current Recommendation**: Restart the backend and test with Gemini. It should work immediately!

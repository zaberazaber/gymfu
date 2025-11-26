# Gemini API Setup Required 🔧

## Current Status

Your Gemini API key (`AIzaSyBFHXrE2LsTdGCqaZj1av2TxoHzKPu8-bo`) is **valid** but the **Generative AI API is not enabled** for this key.

## Error Message
```
models/gemini-1.5-flash is not found for API version v1beta, or is not supported 
for generateContent. Call ListModels to see the list of available models and their 
supported methods.
```

## What This Means

The API key exists and is recognized by Google, but you need to:
1. Enable the Generative AI API in your Google Cloud project
2. OR create a new API key with the correct permissions

## 🔧 How to Fix

### Option 1: Enable the API (Recommended)

1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Make sure you're in the correct project
3. Click "ENABLE" button
4. Wait a few minutes for the API to activate
5. Test again

### Option 2: Create a New API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Select "Create API key in new project" or choose an existing project
4. Copy the new API key
5. Replace in `backend/.env`:
   ```
   GEMINI_API_KEY=your_new_key_here
   ```
6. Reseed providers:
   ```bash
   cd backend
   npx ts-node src/scripts/seedAIProviders.ts
   ```

### Option 3: Use a Different Provider

If you want to skip Gemini setup, you can use Hugging Face (completely free, no setup):

1. Get token from: https://huggingface.co/settings/tokens
2. Add to `backend/.env`:
   ```
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```
3. Fix the TypeScript error in `HuggingFaceProvider.ts` (remove the `baseUrl` option)
4. Reseed and restart

## 🧪 Testing

After enabling the API or getting a new key, test with:

```bash
cd backend
npx ts-node src/scripts/testGeminiSimple.ts
```

You should see:
```
✅ SUCCESS! Gemini API is working!
Response text: Hello! ...
```

## 📋 Complete Setup Checklist

- [ ] Enable Generative AI API OR get new API key
- [ ] Update `backend/.env` with the key
- [ ] Run: `npx ts-node src/scripts/seedAIProviders.ts`
- [ ] Run: `npx ts-node src/scripts/testGeminiSimple.ts` (should succeed)
- [ ] Run: `npx ts-node src/scripts/testAIChat.ts` (should succeed)
- [ ] Restart backend: `npm run dev`
- [ ] Test AI Chat in web app: http://localhost:5173/ai-chat
- [ ] Test AI Chat in mobile app

## 🎯 What's Already Done

✅ AI Chat UI (web + mobile) - Complete
✅ Backend API endpoint - Complete
✅ Provider infrastructure - Complete
✅ All bug fixes applied - Complete
✅ API key added to .env - Complete

⏳ **Only Missing**: Generative AI API needs to be enabled

## ⏱️ Time to Fix

- **Option 1** (Enable API): 2-5 minutes
- **Option 2** (New key): 2 minutes
- **Option 3** (Hugging Face): 3 minutes

## 💡 Recommendation

**Enable the Generative AI API** (Option 1) - it's the fastest and uses your existing key. Just visit the link, click "Enable", and wait a few minutes.

---

**Next Step**: Visit https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com and click "ENABLE"

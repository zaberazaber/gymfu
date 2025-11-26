# Quick Guide: Get a Free AI API Key

## Recommended: Google Gemini (Easiest & Most Generous)

Google Gemini has the most generous free tier and is the easiest to set up.

### Steps:

1. **Visit**: https://makersuite.google.com/app/apikey

2. **Sign in** with your Google account

3. **Click "Create API Key"**

4. **Copy the API key** (it will look like: `AIzaSy...`)

5. **Add to backend/.env**:
   ```env
   GEMINI_API_KEY=AIzaSy_your_actual_key_here
   ```

6. **Test it**:
   ```bash
   cd backend
   npx ts-node src/scripts/testAIInfrastructure.ts
   ```

### Free Tier Limits:
- ✅ 60 requests per minute
- ✅ 50,000 tokens per day (very generous!)
- ✅ No credit card required

---

## Alternative: OpenAI (Popular but requires phone verification)

### Steps:

1. **Visit**: https://platform.openai.com/api-keys

2. **Sign up** (requires phone verification)

3. **Create API key**

4. **Copy the key** (starts with `sk-`)

5. **Add to backend/.env**:
   ```env
   OPENAI_API_KEY=sk-your_actual_key_here
   ```

### Free Tier Limits:
- ✅ $5 free credit for new accounts
- ⚠️  Requires phone verification
- ⚠️  Credit expires after 3 months

---

## Alternative: Hugging Face (Open source models)

### Steps:

1. **Visit**: https://huggingface.co/settings/tokens

2. **Sign up** (email only, no phone needed)

3. **Create new token** (Read access is enough)

4. **Copy the token** (starts with `hf_`)

5. **Add to backend/.env**:
   ```env
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```

### Free Tier Limits:
- ✅ 30 requests per minute
- ✅ 5,000 tokens per day
- ✅ No credit card required

---

## After Adding API Key

1. **Restart the test**:
   ```bash
   cd backend
   npx ts-node src/scripts/testAIInfrastructure.ts
   ```

2. **You should see**:
   ```
   ✅ Gemini API key configured (or OpenAI/Hugging Face)
   ✅ AI Infrastructure is ready!
   ```

3. **Start the server**:
   ```bash
   npm run dev
   ```

4. **Test the health endpoint**:
   ```bash
   curl http://localhost:3000/api/v1/ai/health
   ```

---

## Which One Should I Choose?

**For Testing/Development**: 
- 🥇 **Gemini** - Most generous free tier, easiest setup
- 🥈 **Hugging Face** - Good for open source models
- 🥉 **OpenAI** - Best quality but requires phone verification

**You only need ONE API key to get started!**

The system will automatically use whichever provider has a valid key.

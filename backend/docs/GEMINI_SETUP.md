# 🔑 How to Obtain and Configure the Google Gemini API Key

## Current Status
⚠️ The provided API key is **invalid**. Follow the steps below to obtain a valid key.

## Steps to Obtain the API Key

### 1. Go to Google AI Studio
Visit: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### 2. Sign In
- Use your Google account
- Accept the terms of service if prompted

### 3. Create a New API Key
1. Click **"Create API Key"** or **"Get API key"**
2. Select a Google Cloud project (or create a new one)
3. Copy the generated key (format: `AIzaSy...`)

### 4. Configure in the Project

#### Backend
Edit `/backend/.env`:
```env
GEMINI_API_KEY=YOUR_KEY_HERE
```

#### Test the Configuration
```bash
cd backend
npx ts-node tests/gemini.test.ts
```

## API Key Verification

### Method 1: Terminal
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY_HERE"
```

**Expected response:** JSON with generated content
**Expected error:** 400 Bad Request if the key is invalid

### Method 2: Node.js
```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("YOUR_KEY_HERE");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

model.generateContent("Hello")
  .then(result => console.log("✅ Valid API key!"))
  .catch(error => console.error("❌ Invalid API key:", error.message));
```

## Common Issues

### ❌ "API Key not found"
**Cause:** The key is not configured or is empty
**Solution:** 
- Ensure the `.env` file exists in `/backend`
- Confirm `GEMINI_API_KEY` is set
- Restart the server after editing `.env`

### ❌ "API Key invalid"
**Cause:** The key is incorrect or expired
**Solution:**
- Generate a new key in Google AI Studio
- Verify you copied the full key (no spaces)
- Confirm the key was not revoked in the console

### ❌ "Quota exceeded"
**Cause:** Free API quota exceeded
**Solution:**
- Wait for quota renewal (usually daily)
- Upgrade to a paid plan in Google Cloud
- Optimize requests (use caching)

### ❌ "Service not enabled"
**Cause:** Gemini API not enabled in the project
**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Library"
3. Search for "Generative Language API"
4. Click "Enable"

## Limits and Quotas

### Free Plan
- **Requests per minute:** 60
- **Requests per day:** 1,500
- **Tokens per request:** 32,000 (input + output)

### Paid Plan
- Higher limits (see docs)
- Pay-as-you-go
- Priority support

## Security

### ✅ Best Practices
- ✓ Never commit the key to Git
- ✓ Use environment variables (`.env`)
- ✓ Add `.env` to `.gitignore`
- ✓ Rotate keys periodically
- ✓ Use different keys for dev/prod

### ❌ Avoid
- ✗ Sharing the key publicly
- ✗ Exposing the key in the frontend
- ✗ Hardcoding in code files
- ✗ Using the same key across multiple projects

## Alternatives (If You Have Issues)

### 1. OpenAI GPT
```bash
npm install openai
```
```typescript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

### 2. Anthropic Claude
```bash
npm install @anthropic-ai/sdk
```
```typescript
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
```

### 3. Cohere
```bash
npm install cohere-ai
```
```typescript
import { CohereClient } from "cohere-ai";
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
```

## Additional Resources

- 📚 [Official Documentation](https://ai.google.dev/docs)
- 🎓 [Tutorials and Guides](https://ai.google.dev/tutorials)
- 💬 [Discord Community](https://discord.gg/google-ai)
- 🐛 [Report Bugs](https://github.com/google/generative-ai-js/issues)

## Next Steps

After obtaining a valid key:

1. ✅ Configure it in `.env`
2. ✅ Run tests: `npx ts-node tests/gemini.test.ts`
3. ✅ Start the backend: `npm run dev`
4. ✅ Test the endpoints via Postman/cURL
5. ✅ Integrate with the frontend

## Support

If you still have issues:
1. Check the Google AI Studio console
2. Review backend error logs
3. Consult the [troubleshooting docs](https://ai.google.dev/docs/troubleshooting)
4. Open an issue in the project repository

---

**Note:** Obtain a valid API key following the steps above. Never share or commit real keys to the repository.

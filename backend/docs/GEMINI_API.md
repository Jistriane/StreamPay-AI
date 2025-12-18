# Google Gemini AI - StreamPay Integration

## Overview
The Google Gemini AI integration provides advanced generative AI capabilities for StreamPay, including:
- Intelligent virtual assistant
- Stream and transaction analysis
- Compliance report generation
- Real-time insights and recommendations

## Configuration

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure API key
Add your Gemini API key to `.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

> ⚠️ **IMPORTANT:** Never commit your real API key to Git. Use it only for local development.

### 3. Obtain an API key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and add it to `.env`

## API Endpoints

### Chat with Virtual Assistant
**POST** `/api/gemini/chat`

Converse with the StreamPay AI virtual assistant.

**Headers:**
```
Authorization: wallet:password
Content-Type: application/json
```

**Body:**
```json
{
  "message": "How do I create a payment stream?",
  "context": "New user, first time using the platform"
}
```

**Response:**
```json
{
  "success": true,
  "response": "To create a payment stream on StreamPay..."
}
```

### Stream Analysis
**POST** `/api/gemini/analyze-stream`

Analyzes stream data and returns security and optimization insights.

**Headers:**
```
Authorization: wallet:password
Content-Type: application/json
```

**Body:**
```json
{
  "streamData": {
    "sender": "0x123...",
    "recipient": "0x456...",
    "amount": 1000,
    "token": "USDC",
    "duration": 3600,
    "status": "active"
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "Risk Analysis: Low\n1. Transaction within normal patterns..."
}
```

### Compliance Report
**POST** `/api/gemini/compliance-report`

Generates a detailed compliance report based on KYC data.

**Headers:**
```
Authorization: wallet:password
Content-Type: application/json
```

**Body:**
```json
{
  "kycData": {
    "wallet": "0x123...",
    "status": "approved",
    "documents": ["passport", "proof_of_address"],
    "transactionCount": 45
  }
}
```

**Response:**
```json
{
  "success": true,
  "report": "Risk Assessment: Low\n1. KYC status approved..."
}
```

## Programmatic Usage

### Import module
```typescript
import {
  chatAssistant,
  analyzeStreamData,
  generateComplianceReport,
  generateContent,
  generateContentStream
} from './gemini';
```

### Example: Assistant chat
```typescript
const response = await chatAssistant(
  "What is the status of my stream?",
  "User has 3 active streams"
);
console.log(response);
```

### Example: Stream analysis
```typescript
const streamData = {
  sender: "0x123...",
  recipient: "0x456...",
  amount: 1000,
  token: "USDC",
  duration: 3600,
  status: "active"
};

const analysis = await analyzeStreamData(streamData);
console.log(analysis);
```

### Example: Streaming response
```typescript
await generateContentStream(
  "Explain how payment streaming works",
  (chunk) => {
    process.stdout.write(chunk); // Prints in real time
  }
);
```

## Available Functions

### `generateContent(prompt: string)`
Generates text using Gemini Pro.
- **Parameters:** prompt (string)
- **Returns:** Promise<string>

### `generateContentStream(prompt: string, onChunk: (text: string) => void)`
Generates text with real-time streaming.
- **Parameters:**
  - prompt (string)
  - onChunk: callback for each text chunk
- **Returns:** Promise<void>

### `startChat(history?)`
Starts a chat session with optional history.
- **Parameters:** history (array of messages, optional)
- **Returns:** ChatSession

### `chatAssistant(userMessage: string, context?: string)`
Specialized StreamPay virtual assistant.
- **Parameters:**
  - userMessage: user message
  - context: additional context (optional)
- **Returns:** Promise<string>

### `analyzeStreamData(streamData: any)`
Analyzes stream data and provides insights.
- **Parameters:** streamData (stream data object)
- **Returns:** Promise<string>

### `generateComplianceReport(kycData: any)`
Generates a compliance report based on KYC data.
- **Parameters:** kycData (KYC data object)
- **Returns:** Promise<string>

## Use Cases

### 1. Customer Support
```typescript
const userQuestion = "How do I cancel a stream?";
const answer = await chatAssistant(userQuestion);
// Contextualized answer about cancellation
```

### 2. Fraud Detection
```typescript
const suspicious = await analyzeStreamData({
  sender: "0x...",
  recipient: "0x...",
  amount: 1000000, // very high amount
  duration: 60 // very short duration
});
// Returns a risk alert
```

### 3. Compliance Automation
```typescript
const report = await generateComplianceReport({
  wallet: "0x123...",
  status: "pending",
  transactionCount: 150
});
// Generates an automatic report for audit
```

### 4. User Education
```typescript
const explanation = await generateContent(
  "Explain what payment streaming is on blockchain in simple terms"
);
// Returns a simple explanation
```

## Best Practices

### 1. Error Handling
```typescript
try {
  const response = await chatAssistant(message);
  console.log(response);
} catch (error) {
  console.error("Error calling Gemini:", (error as Error).message);
  // Implement fallback or retry
}
```

### 2. Rate Limiting
Gemini API has rate limits. Implement:
- Cache for common responses
- Request throttling
- Retry with exponential backoff

### 3. Security
- ⚠️ **NEVER expose the API key on the frontend**
- ✅ Always validate user input
- ✅ Use authentication for Gemini endpoints
- ✅ Sanitize data before sending to the model
- ✅ Add `.env` to `.gitignore`

### 4. Efficient Context
```typescript
// Good: specific context
const response = await chatAssistant(
  "What is the status?",
  "3 active streams, 2 pending, balance: 5000 USDC"
);

// Bad: generic or missing context
const response = await chatAssistant("What is the status?");
```

## Limitations

- **Model:** Gemini Pro (text only)
- **Context:** ~32k tokens per request
- **Rate Limit:** Varies by plan (check console)
- **Language:** Best performance in English, supports Portuguese

## Additional Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API docs](https://ai.google.dev/docs)
- [Prompt examples](https://ai.google.dev/examples)
- [Best practices](https://ai.google.dev/docs/best_practices)

## Troubleshooting

### Error: Invalid API key
Verify the key in `.env` and ensure it is active in the Google AI console.

### Error: Rate limit exceeded
Wait a few seconds and try again. Implement automatic retry.

### Empty or generic response
Improve the prompt with more specific context and clear instructions.

### Timeout
Increase the request timeout or use `generateContentStream` for long responses.

## Next Steps

1. Implement Redis cache for common responses
2. Add user sentiment analysis
3. Integrate with conversation history in the database
4. Create a dashboard for AI usage metrics
5. Implement fine-tuning with StreamPay-specific data

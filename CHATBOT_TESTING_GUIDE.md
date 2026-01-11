# 🧪 ElizaOS Chatbot Testing Guide

**Status**: ✅ Services Running | **Date**: 01/11/2026

## 📊 Current Services Status

```
✅ Backend (3001):  OK
✅ ElizaOS (3002):  OK  
✅ Frontend (3003): OK
```

## 🎯 Implemented Corrections

### 1. Fixed Validation Flow
- ✅ Trust verification moved to beginning
- ✅ Specific messages by intent type (CREATE_STREAM, CLAIM_STREAM, PAUSE_STREAM)
- ✅ Debug logs added for traceability

### 2. Enhanced Messages
When user types just "create stream" without parameters, now receives:

```
To create a stream, I need some information:

📝 **Complete command example:**
"Create stream of 1000 USDC for 0x1234... for 30 days"

🔹 **I need:**
• Amount (ex: 1000)
• Token (ex: USDC, DAI, ETH)
• Recipient address (0x...)
• Duration (ex: 30 days, 1 month)

💡 **Try something like:**
"Send 500 USDC to 0xabcd1234... for 7 days"
```

## 🧪 Recommended Tests

### Test 1: Incomplete Command (CREATE STREAM)

**Input:** `create stream`

**Expected Result:**
- Detailed message with complete example
- List of required parameters
- Command suggestion

**How to test:**
1. Access http://localhost:3002
2. Type "create stream" in chat
3. Verify you receive detailed message

---

### Test 2: Partial Command (CREATE STREAM)

**Input:** `create stream of 1000 USDC`

**Expected Result:**
- Identifies missing recipient and duration
- Provides example with all parameters

---

### Test 3: Complete Command (CREATE STREAM)

**Input:** `create stream of 1000 USDC for 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb for 30 days`

**Expected Result:**
- Processes command
- Returns confirmation or execution error (not parsing error)

---

### Test 4: Help Command

**Input:** `help` or `commands`

**Expected Result:**
- Complete command list
- Examples in English
- Clear formatting with emojis

---

### Test 5: Incomplete Command (CLAIM STREAM)

**Input:** `claim stream`

**Expected Result:**
```
To claim a stream, I need the ID.

📝 **Example:**
"Claim stream #123" or "Claim stream 5"
```

---

### Test 6: Incomplete Command (PAUSE STREAM)

**Input:** `pause stream`

**Expected Result:**
```
To pause a stream, I need the ID.

📝 **Example:**
"Pause stream #123" or "Stop stream 5"
```

---

### Test 7: Unknown Command (Low Confidence)

**Input:** `I want to do something`

**Expected Result:**
```
I'm not sure what you're asking for. Could you rephrase?

📋 **Available commands:**
• create stream - Create streaming payment
• claim stream - Claim tokens
• pause stream - Pause stream
• cancel stream - Cancel stream
• view streams - View my streams

💡 Use "help" or "commands" for more details.
```

---

## 🔍 Checking Debug Logs

Debug logs were added to facilitate tracing. To view:

### Option 1: Via npm run dev Terminal
```bash
# Logs appear automatically in terminal where npm run dev is running
# Look for lines like:
[StreamPayAgent] Parsed Intent: {...}
[StreamPayAgent] Validation result: {...}
[generateValidationErrorMessage] {...}
```

### Option 2: Via Browser Console
```bash
# 1. Open http://localhost:3002
# 2. Open DevTools (F12)
# 3. Go to Console tab
# 4. Type a command and see logs
```

## 📝 Validation Checklist

Run all tests and check:

- [ ] Test 1: Incomplete CREATE STREAM returns detailed message
- [ ] Test 2: Partial command identifies missing parameters  
- [ ] Test 3: Complete command is processed (no parsing error)
- [ ] Test 4: Help command shows complete list
- [ ] Test 5: CLAIM STREAM without ID returns example
- [ ] Test 6: PAUSE STREAM without ID returns example
- [ ] Test 7: Unknown command returns command list

## 🐛 Known Issues and Solutions

### Issue: Generic message still appears
**Solution:**
1. Verify ElizaOS was recompiled: `cd streampay-eliza && npm run build`
2. Restart service
3. Clear browser cache (Ctrl+Shift+Del)

### Issue: Logs don't appear
**Solution:**
1. Verify you're using correct terminal (where `npm run dev` ran)
2. Increase log level in development

### Issue: ElizaOS doesn't respond
**Solution:**
1. Check health: `curl http://localhost:3002/health`
2. Check if port 3002 is busy: `lsof -i:3002`
3. Restart: `pkill -f eliza && npm run dev`

## 📚 Useful Commands

```bash
# Check all services status
curl -s http://localhost:3001/health && echo " Backend OK"
curl -s http://localhost:3002/health && echo " ElizaOS OK"
curl -s http://localhost:3003 > /dev/null && echo " Frontend OK"

# View ElizaOS logs
tail -f /home/jistriane/Documentos/StreamPay\ AI/StreamPay-AI-1/eliza.log

# Restart only ElizaOS
pkill -f "elizaos dev"
cd streampay-eliza && npm run dev

# Recompile ElizaOS
cd streampay-eliza && npm run build
```

## ✅ Expected Final Result

After all corrections, chatbot should:

1. **Identify intent correctly** even with incomplete commands
2. **Provide specific messages** for each command type
3. **Show practical examples** in English
4. **Guide user** with tips and suggestions
5. **Have clear response for "help"** with all commands

## 📊 Success Metrics

- ✅ 0 generic messages for known commands
- ✅ 100% incomplete commands receive examples
- ✅ Debug logging working
- ✅ Help command operational
- ✅ Multi-language (English) working

---

**Last update**: 01/11/2026 04:00 UTC  
**Status**: ✅ Corrections implemented, awaiting user validation

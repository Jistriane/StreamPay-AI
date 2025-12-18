# E2E Tests - StreamPay AI

This directory contains end-to-end (E2E) tests for the StreamPay AI platform using Cypress.

## 📋 Test Structure

### Primary Tests

#### 1. **streampay-flows.cy.ts** — Core StreamPay Flows
Complete coverage of the 4 critical flows:

- **Stream Creation Flow** ✅
  - Navigate to stream creation
  - Fill the form (recipient, amount, duration)
  - Submit and confirm
  - Verify on dashboard

- **Stream Claiming Flow** ✅
  - Navigate to received streams
  - Find claimable streams
  - Claim with confirmation
  - Verify balance update

- **Liquidity Pool Flow** ✅
  - Navigate to liquidity section
  - View statistics (TVL, APY, Volume)
  - Add liquidity to pool
  - Remove liquidity

- **Real-time Chat Flow** ✅
  - Navigate to chat
  - Send messages
  - Receive messages via WebSocket
  - Typing indicator
  - Multiple messages in conversation

- **Integration Tests** ✅
  - Session persistence across features
  - Data sync via WebSocket

#### 2. **user-workflow.cy.ts**
Full user journey tests (onboarding, navigation, agent response)

#### 3. **agent-chat.cy.ts**
Chat UI-specific tests with the agent

#### 4. **dashboard.cy.ts**
Dashboard tests (loading, navigation, responsive design, error handling)

## 🎯 Custom Commands (streampay-commands.ts)

### Available Commands

```typescript
// Create a stream
cy.createStream(
  recipientWallet: string,  // '0x123...'
  amount: string,           // '100.00'
  duration: number          // 30 (dias)
);

// Claim stream
cy.claimStream();

// Add liquidity
cy.addLiquidity(amount: string);  // '10.00'

// Send chat message
cy.sendChatMessage(message: string);

// Wait for WebSocket event
cy.waitForWebSocketEvent(eventType: string, timeout?: number);

// Get current balance
cy.getBalance();

// Wait for transaction completion
cy.waitForTransaction(timeout?: number);
```

### Usage Examples

```typescript
describe('Stream Creation', () => {
  it('should create and claim a stream', () => {
    // Create stream
    cy.createStream('0xRecipient...', '100.00', 30);

    // Verify success
    cy.waitForTransaction();

    // Switch to recipient account
    cy.login('recipient', 'password');

    // Claim stream
    cy.claimStream();
    cy.waitForTransaction();

    // Verify new balance
    cy.getBalance().then(balance => {
      expect(balance).to.include('100');
    });
  });

  it('should chat about streams', () => {
    cy.sendChatMessage('How do I create a stream?');
    cy.sendChatMessage('What are the fees?');
  });
});
```

## 🚀 Executando os Testes

### Interactive Mode (Cypress UI)

```bash
# Open Cypress Test Runner
npm run test:e2e

# Or target a file
npm run test:e2e -- streampay-flows
```

### Headless Mode (CI/CD)

```bash
# Run all E2E tests
npm run test:e2e:headless

# Run specific test
npm run test:e2e:headless -- --spec="**streampay-flows.cy.ts"

# With reporter
npm run test:e2e:headless -- --reporter spec
```

### Run a Specific Test

```bash
# Stream Creation only
npm run test:e2e -- --grep "Stream Creation Flow"

# Chat only
npm run test:e2e -- --grep "Real-time Chat Flow"

# Integration tests
npm run test:e2e -- --grep "Integration"
```

## 📊 Configuration (cypress.config.ts)

```typescript
{
  baseUrl: 'http://localhost:3000',
  specPattern: 'src/__tests__/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  supportFile: 'src/__tests__/cypress/support/e2e.ts',
  defaultCommandTimeout: 10000,      // 10 seconds
  requestTimeout: 10000,             // HTTP requests
  responseTimeout: 10000,            // Responses
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnFailure: true,
}
```

## 🔍 Selection Strategies

Tests use multiple strategies to find elements:

### 1. **data-testid** (Recommended)
```html
<button data-testid="create-stream">Create Stream</button>
```

### 2. **Content selectors**
```typescript
cy.get('button:contains("Create")');
cy.contains('Stream');
```

### 3. **Common attributes**
```typescript
cy.get('input[placeholder*="amount"]');
cy.get('a[href*="chat"]');
```

### 4. **ARIA roles**
```typescript
cy.get('[role="dialog"]');
cy.get('[role="alert"]');
```

## ⚙️ Test Variables

```typescript
const TEST_USER_WALLET = 'test-wallet-123';
const TEST_RECIPIENT_WALLET = 'recipient-wallet-456';
const TEST_STREAM_AMOUNT = '100.00';
const TEST_DURATION_DAYS = 30;
```

## 🛠️ Available Hooks

```typescript
beforeEach(() => {
  cy.visit('/');           // Go to home page
  cy.wait(2000);           // Wait for load
  cy.login();              // Log in
});

afterEach(() => {
  cy.clearAppData();       // Clear local data
});
```

## 📈 WebSocket Events Covered

Tests validate real-time events:

- ✅ `stream:created` - Stream created
- ✅ `stream:claimed` - Stream claimed
- ✅ `stream:updated` - Stream updated
- ✅ `pool:liquidity_added` - Liquidity added
- ✅ `chat:message_received` - Message received
- ✅ `chat:typing_indicator` - Typing indicator
- ✅ `price:updated` - Price updated

## ✅ Test Checklist

### Before Running Tests

- [ ] Backend running at `http://localhost:3001`
- [ ] Frontend running at `http://localhost:3000`
- [ ] WebSocket active on port `3002`
- [ ] Database contains test data
- [ ] Environment variables configured

### Expected Flow

```
1. Stream Creation
  ├─ Navigate to create
  ├─ Fill form
  ├─ Submit
  └─ Verify on dashboard

2. Stream Claiming
  ├─ Navigate to received
  ├─ Find claimable stream
  ├─ Click claim
  ├─ Confirm
  └─ Balance updated

3. Liquidity Management
  ├─ Navigate to liquidity
  ├─ View stats
  ├─ Add liquidity
  ├─ Remove liquidity
  └─ Verify balance

4. Real-time Chat
  ├─ Navigate to chat
  ├─ Send message
  ├─ Receive via WebSocket
  ├─ Typing indicator
  └─ Multiple messages

5. Integration
  ├─ Session persistence
  ├─ Cross-tab sync
  └─ Logout
```

## 🐛 Troubleshooting

### Failing Tests

**Issue**: "Element not found"
```typescript
// Solution: Increase timeout
cy.get('[data-testid="element"]', { timeout: 15000 });
```

**Issue**: "Cypress failed to start"
```bash
# Solution: Reinstall Cypress
npm install --save-dev cypress
npx cypress cache clear
```

**Issue**: "WebSocket connection timeout"
```typescript
// Solution: Wait for WebSocket to connect
cy.wait(2000);
cy.waitForWebSocketEvent('connect', 5000);
```

### Slow Tests

- Increase `defaultCommandTimeout` in cypress.config.ts
- Use `cy.waitForApp()` to wait for load
- Check backend response time

## 📝 Best Practices

### ✅ Do

```typescript
// Use data-testid when possible
cy.get('[data-testid="stream-form"]');

// Wait for elements explicitly
cy.get('[data-testid="loading"]').should('not.exist');

// Use custom commands for common flows
cy.createStream(wallet, amount, duration);

// Clear data between tests
beforeEach(() => cy.login());
afterEach(() => cy.clearAppData());
```

### ❌ Don't

```typescript
// Avoid brittle indexes
cy.get('button').eq(3).click();  // ❌ Brittle

// Avoid arbitrary waits
cy.wait(5000);  // ❌ Imprecise

// Don't test implementation details
cy.get('.component-internal-class');  // ❌ Breaks with refactors

// Don't share state between tests
// ✅ Clean data after each test
```

## 🔄 Integração com CI/CD

### GitHub Actions

```yaml
- name: Run E2E Tests
  run: npm run test:e2e:headless
  
- name: Upload Videos
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: cypress-videos
    path: cypress/videos
```

## 📚 Recursos Adicionais

- [Cypress Documentation](https://docs.cypress.io)
- [Testing Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)
- [WebSocket Testing](https://docs.cypress.io/api/commands/intercept)

## 🎓 Scripts Disponíveis

```json
{
  "test:e2e": "cypress open",
  "test:e2e:headless": "cypress run",
  "test:e2e:report": "cypress run --reporter spec",
  "test:e2e:debug": "cypress run --headed --no-exit"
}
```

---

**Last Update**: Dec 14, 2024  
**Status**: ✅ E2E Tests Implemented

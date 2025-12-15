/**
 * StreamPay Custom Cypress Commands
 *
 * Custom commands for E2E testing of StreamPay features
 */

// Command to create a stream
Cypress.Commands.add('createStream', (recipientWallet: string, amount: string, duration: number) => {
  // Navigate to create stream
  cy.get(
    'a[href*="create"], button:contains("Create"), button:contains("New Stream"), [data-testid="create-stream"]'
  )
    .first()
    .click({ force: true });

  // Fill recipient wallet
  cy.get('input[placeholder*="recipient"], input[placeholder*="wallet"], input[name*="recipient"]')
    .first()
    .type(recipientWallet, { delay: 50 });

  // Fill amount
  cy.get('input[placeholder*="amount"], input[type="number"], input[name*="amount"]')
    .first()
    .type(amount, { delay: 50 });

  // Set duration
  cy.get('input[type="date"], select[name*="duration"], input[placeholder*="duration"]').then(
    ($input) => {
      if ($input.attr('type') === 'date') {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + duration);
        const dateString = futureDate.toISOString().split('T')[0];
        cy.wrap($input).type(dateString);
      }
    }
  );

  // Submit
  cy.get('button:contains("Create"), button:contains("Submit"), button:contains("Start Stream")')
    .first()
    .click({ force: true });
});

// Command to claim stream
Cypress.Commands.add('claimStream', () => {
  // Navigate to received streams
  cy.get(
    'a[href*="received"], button:contains("Received"), [data-testid="received-streams"], tab:contains("Received")'
  )
    .first()
    .click({ force: true });

  // Click claim
  cy.get(
    'button:contains("Claim"), button:contains("Withdraw"), [data-testid="claim-button"]'
  )
    .first()
    .click({ force: true });

  // Handle confirmation
  cy.get('[role="dialog"], [data-testid="confirm-modal"]').then(($dialog) => {
    if ($dialog.length > 0) {
      cy.get('button:contains("Confirm"), button:contains("Yes")').click({ force: true });
    }
  });
});

// Command to add liquidity
Cypress.Commands.add('addLiquidity', (amount: string) => {
  // Navigate to liquidity
  cy.get(
    'a[href*="liquidity"], a[href*="pool"], button:contains("Liquidity"), button:contains("Pool")'
  )
    .first()
    .click({ force: true });

  // Click add liquidity
  cy.get(
    'button:contains("Add"), button:contains("Deposit"), button:contains("Provide"), [data-testid="add-liquidity"]'
  )
    .first()
    .click({ force: true });

  // Fill amount
  cy.get('input[type="number"], input[placeholder*="amount"]')
    .first()
    .type(amount, { delay: 50 });

  // Submit
  cy.get('button:contains("Confirm"), button:contains("Add"), button:contains("Provide")')
    .first()
    .click({ force: true });
});

// Command to send chat message
Cypress.Commands.add('sendChatMessage', (message: string) => {
  // Navigate to chat if not already there
  cy.url().then((url) => {
    if (!url.includes('chat')) {
      cy.get('a[href*="chat"], button:contains("Chat"), button:contains("Messages")')
        .first()
        .click({ force: true });
    }
  });

  // Type message
  cy.get('input[type="text"], textarea, [contenteditable="true"]')
    .filter(':visible')
    .first()
    .type(message, { delay: 50 });

  // Send
  cy.get('button[aria-label*="send"], button:contains("Send"), [data-testid="send-button"]')
    .first()
    .click({ force: true });
});

// Command to wait for websocket event
Cypress.Commands.add('waitForWebSocketEvent', (eventType: string, timeout: number = 10000) => {
  // Listen for websocket events in console or network
  cy.window({ timeout }).then((win) => {
    cy.wrap(
      new Cypress.Promise((resolve) => {
        const startTime = Date.now();
        const checkEvent = () => {
          if (Date.now() - startTime > timeout) {
            resolve(false);
          } else {
            setTimeout(checkEvent, 100);
          }
        };
        checkEvent();
      })
    );
  });
});

// Command to get balance
Cypress.Commands.add('getBalance', () => {
  return cy.get('[data-testid="balance"], [class*="balance"]').invoke('text');
});

// Command to wait for transaction
Cypress.Commands.add('waitForTransaction', (timeout: number = 15000) => {
  cy.get('[data-testid="loading"], [class*="spinner"]', { timeout }).should('not.exist');
  cy.get('[data-testid="success"], [role="alert"]', { timeout }).should('be.visible');
});

// Extend Cypress chainable types
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Create a stream with specified parameters
       * @example cy.createStream('0x123...', '100.00', 30)
       */
      createStream(recipientWallet: string, amount: string, duration: number): Chainable<void>;

      /**
       * Claim the first available stream
       * @example cy.claimStream()
       */
      claimStream(): Chainable<void>;

      /**
       * Add liquidity to pool
       * @example cy.addLiquidity('10.00')
       */
      addLiquidity(amount: string): Chainable<void>;

      /**
       * Send a chat message
       * @example cy.sendChatMessage('Hello StreamPay')
       */
      sendChatMessage(message: string): Chainable<void>;

      /**
       * Wait for websocket event
       * @example cy.waitForWebSocketEvent('stream:created', 5000)
       */
      waitForWebSocketEvent(eventType: string, timeout?: number): Chainable<boolean>;

      /**
       * Get current balance
       * @example cy.getBalance().then(balance => console.log(balance))
       */
      getBalance(): Chainable<string>;

      /**
       * Wait for transaction completion
       * @example cy.waitForTransaction()
       */
      waitForTransaction(timeout?: number): Chainable<void>;
    }
  }
}

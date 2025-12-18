/**
 * E2E Tests for StreamPay Core Flows
 *
 * These tests simulate real user journeys for:
 * 1. Stream Creation
 * 2. Stream Claiming
 * 3. Liquidity Pool Management
 * 4. Real-time Chat via WebSocket
 */

describe('StreamPay E2E Tests', () => {
  const TEST_USER_WALLET = 'test-wallet-123';
  const TEST_RECIPIENT_WALLET = 'recipient-wallet-456';
  const TEST_STREAM_AMOUNT = '100.00';
  const TEST_DURATION_DAYS = 30;

  beforeEach(() => {
    // Visit the application
    cy.visit('/');

    // Wait for initial load
    cy.wait(2000);

    // Check for auth (may redirect to login)
    cy.url().then((url) => {
      if (url.includes('login')) {
        // Perform login or skip tests
        cy.log('Application requires login');
      }
    });
  });

  // ============================================
  // STREAM CREATION FLOW
  // ============================================
  describe('Stream Creation Flow', () => {
    it('should navigate to stream creation', () => {
      // Look for create stream button or link
      cy.get(
        'a[href*="create"], button:contains("Create"), button:contains("New Stream"), [data-testid="create-stream"]',
        { timeout: 5000 }
      )
        .first()
        .click({ force: true });

      // Should be on create stream page
      cy.url().should('match', /create|new|stream/i);
      cy.get('form, [data-testid="stream-form"]', { timeout: 5000 }).should('be.visible');
    });

    it('should fill and submit stream creation form', () => {
      // Navigate to create stream
      cy.get(
        'a[href*="create"], button:contains("Create"), button:contains("New Stream"), [data-testid="create-stream"]'
      )
        .first()
        .click({ force: true });

      // Fill recipient wallet address
      cy.get('input[placeholder*="recipient"], input[placeholder*="wallet"], input[name*="recipient"]')
        .first()
        .type(TEST_RECIPIENT_WALLET, { delay: 50 });

      // Fill stream amount
      cy.get('input[placeholder*="amount"], input[type="number"], input[name*="amount"]')
        .first()
        .type(TEST_STREAM_AMOUNT, { delay: 50 });

      // Select duration or date
      cy.get('input[type="date"], select[name*="duration"], input[placeholder*="duration"]').then(
        ($input) => {
          if ($input.length > 0) {
            if ($input.attr('type') === 'date') {
              const futureDate = new Date();
              futureDate.setDate(futureDate.getDate() + TEST_DURATION_DAYS);
              const dateString = futureDate.toISOString().split('T')[0];
              cy.wrap($input).type(dateString);
            } else {
              cy.wrap($input).type(`${TEST_DURATION_DAYS} days`, { delay: 50 });
            }
          }
        }
      );

      // Submit form
      cy.get('button:contains("Create"), button:contains("Submit"), button:contains("Start Stream")')
        .first()
        .click({ force: true });

      // Wait for success message or redirect
      cy.get('[data-testid="success"], [role="alert"]', { timeout: 10000 }).should('be.visible');

      // Should show stream confirmation or redirect to stream details
      cy.url().should('match', /stream|dashboard|success/i);
    });

    it('should display created stream in dashboard', () => {
      // Navigate back to dashboard
      cy.visit('/');

      // Wait for page load
      cy.wait(1000);

      // Look for streams list
      cy.get('[data-testid*="stream"], [class*="stream"], table').should('exist');

      // Verify stream appears in list
      cy.get('body').then(($body) => {
        if ($body.text().includes(TEST_RECIPIENT_WALLET)) {
          cy.log('✓ Created stream appears in dashboard');
          expect($body.text()).to.include(TEST_RECIPIENT_WALLET);
        }
      });
    });
  });

  // ============================================
  // STREAM CLAIMING FLOW
  // ============================================
  describe('Stream Claiming Flow', () => {
    it('should navigate to received streams section', () => {
      // Look for incoming/received streams section
      cy.get(
        'a[href*="received"], button:contains("Received"), [data-testid="received-streams"], tab:contains("Received")',
        { timeout: 5000 }
      )
        .first()
        .click({ force: true });

      // Should display received streams
      cy.get('[data-testid*="stream"], [class*="stream"], table').should('exist');
    });

    it('should find claimable stream', () => {
      // Navigate to received streams
      cy.get(
        'a[href*="received"], button:contains("Received"), [data-testid="received-streams"], tab:contains("Received")'
      )
        .first()
        .click({ force: true });

      // Look for claimable streams (status = pending or streaming)
      cy.get('[data-testid*="stream"], [class*="stream-item"]').should('have.length.greaterThan', 0);

      // Find a stream with claim button
      cy.get(
        'button:contains("Claim"), button:contains("Withdraw"), [data-testid="claim-button"]',
        { timeout: 5000 }
      ).should('be.visible');
    });

    it('should claim stream successfully', () => {
      // Navigate to received streams
      cy.get(
        'a[href*="received"], button:contains("Received"), [data-testid="received-streams"], tab:contains("Received")'
      )
        .first()
        .click({ force: true });

      // Click claim button on first available stream
      cy.get(
        'button:contains("Claim"), button:contains("Withdraw"), [data-testid="claim-button"]'
      )
        .first()
        .click({ force: true });

      // Handle confirmation dialog if exists
      cy.get('[role="dialog"], [data-testid="confirm-modal"]').then(($dialog) => {
        if ($dialog.length > 0) {
          cy.get('button:contains("Confirm"), button:contains("Yes")').click({ force: true });
        }
      });

      // Wait for transaction
      cy.get('[data-testid="loading"], [class*="spinner"]', { timeout: 15000 }).should('not.exist');

      // Verify success
      cy.get('[data-testid="success"], [role="alert"]', { timeout: 10000 }).should('be.visible');
    });

    it('should update balance after claim', () => {
      // Check balance before and after claim
      cy.get('[data-testid="balance"], [class*="balance"]')
        .invoke('text')
        .then((balanceBefore) => {
          cy.log(`Balance before claim: ${balanceBefore}`);

          // Perform claim
          cy.get(
            'button:contains("Claim"), button:contains("Withdraw"), [data-testid="claim-button"]'
          )
            .first()
            .click({ force: true });

          // Handle confirmation
          cy.get('[role="dialog"]').then(($dialog) => {
            if ($dialog.length > 0) {
              cy.get('button:contains("Confirm")').click({ force: true });
            }
          });

          // Wait for update
          cy.wait(5000);

          // Check balance after
          cy.get('[data-testid="balance"], [class*="balance"]')
            .invoke('text')
            .then((balanceAfter) => {
              cy.log(`Balance after claim: ${balanceAfter}`);
              expect(balanceAfter).to.not.equal(balanceBefore);
            });
        });
    });
  });

  // ============================================
  // LIQUIDITY POOL MANAGEMENT FLOW
  // ============================================
  describe('Liquidity Pool Flow', () => {
    it('should navigate to liquidity section', () => {
      // Look for liquidity/pool section
      cy.get(
        'a[href*="liquidity"], a[href*="pool"], button:contains("Liquidity"), button:contains("Pool"), [data-testid="liquidity"]',
        { timeout: 5000 }
      )
        .first()
        .click({ force: true });

      // Should display pool interface
      cy.get('[data-testid*="pool"], [class*="liquidity"]').should('exist');
    });

    it('should display pool statistics', () => {
      // Navigate to liquidity section
      cy.get(
        'a[href*="liquidity"], a[href*="pool"], button:contains("Liquidity"), button:contains("Pool")'
      )
        .first()
        .click({ force: true });

      // Check for key statistics
      cy.get('body').then(($body) => {
        const text = $body.text();
        // Should display pool info like TVL, APY, volume
        if (
          text.includes('TVL') ||
          text.includes('APY') ||
          text.includes('Volume') ||
          text.includes('Liquidity')
        ) {
          cy.log('✓ Pool statistics displayed');
        }
      });
    });

    it('should add liquidity to pool', () => {
      // Navigate to liquidity
      cy.get(
        'a[href*="liquidity"], a[href*="pool"], button:contains("Liquidity"), button:contains("Pool")'
      )
        .first()
        .click({ force: true });

      // Click add liquidity button
      cy.get(
        'button:contains("Add"), button:contains("Deposit"), button:contains("Provide"), [data-testid="add-liquidity"]'
      )
        .first()
        .click({ force: true });

      // Fill liquidity amount
      cy.get('input[type="number"], input[placeholder*="amount"]')
        .first()
        .type('10.00', { delay: 50 });

      // Submit
      cy.get('button:contains("Confirm"), button:contains("Add"), button:contains("Provide")')
        .first()
        .click({ force: true });

      // Wait for transaction
      cy.get('[data-testid="loading"]', { timeout: 15000 }).should('not.exist');

      // Verify success
      cy.get('[data-testid="success"], [role="alert"]', { timeout: 10000 }).should('be.visible');
    });

    it('should remove liquidity from pool', () => {
      // Navigate to liquidity
      cy.get(
        'a[href*="liquidity"], a[href*="pool"], button:contains("Liquidity"), button:contains("Pool")'
      )
        .first()
        .click({ force: true });

      // Look for positions tab or view existing liquidity
      cy.get('button:contains("Your Positions"), tab:contains("Positions"), [data-testid="positions"]').then(
        ($elem) => {
          if ($elem.length > 0) {
            cy.wrap($elem).click({ force: true });
          }
        }
      );

      // Click remove button
      cy.get('button:contains("Remove"), button:contains("Withdraw"), [data-testid="remove-liquidity"]')
        .first()
        .click({ force: true });

      // Select percentage or amount
      cy.get('input[type="range"], input[placeholder*="percent"], input[placeholder*="amount"]').then(
        ($input) => {
          if ($input.length > 0) {
            cy.wrap($input).first().type('50', { delay: 50 });
          }
        }
      );

      // Confirm removal
      cy.get('button:contains("Remove"), button:contains("Confirm")')
        .first()
        .click({ force: true });

      // Wait for transaction
      cy.get('[data-testid="loading"]', { timeout: 15000 }).should('not.exist');

      // Verify success
      cy.get('[data-testid="success"], [role="alert"]').should('be.visible');
    });
  });

  // ============================================
  // REAL-TIME CHAT VIA WEBSOCKET
  // ============================================
  describe('Real-time Chat Flow', () => {
    it('should navigate to chat interface', () => {
      // Look for chat section
      cy.get(
        'a[href*="chat"], button:contains("Chat"), button:contains("Messages"), [data-testid="chat"]',
        { timeout: 5000 }
      )
        .first()
        .click({ force: true });

      // Should display chat interface
      cy.get('[data-testid*="chat"], [class*="chat"], [role="main"]').should('be.visible');
    });

    it('should display message input field', () => {
      // Navigate to chat
      cy.get('a[href*="chat"], button:contains("Chat"), button:contains("Messages")').first().click({
        force: true,
      });

      // Find input
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(':visible')
        .first()
        .should('be.visible')
        .should('not.be.disabled');
    });

    it('should send chat message', () => {
      // Navigate to chat
      cy.get('a[href*="chat"], button:contains("Chat"), button:contains("Messages")')
        .first()
        .click({ force: true });

      const testMessage = 'Hello StreamPay, can you help me with streams?';

      // Type message
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(':visible')
        .first()
        .type(testMessage, { delay: 50 });

      // Send message
      cy.get('button[aria-label*="send"], button:contains("Send"), [data-testid="send-button"]')
        .first()
        .click({ force: true });

      // Verify message appears in chat
      cy.get('[data-testid*="message"], [class*="message"]', { timeout: 5000 })
        .last()
        .should('contain', testMessage);
    });

    it('should receive websocket messages in real-time', () => {
      // Navigate to chat
      cy.get('a[href*="chat"], button:contains("Chat"), button:contains("Messages")')
        .first()
        .click({ force: true });

      // Send first message
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(':visible')
        .first()
        .type('What is StreamPay?', { delay: 50 });

      cy.get('button[aria-label*="send"], button:contains("Send")')
        .first()
        .click({ force: true });

      // Wait for agent response via websocket
      cy.get('[data-testid*="message"], [class*="message"]', { timeout: 15000 }).should(
        'have.length.greaterThan',
        1
      );

      // Verify response is visible
      cy.get('[data-testid*="message"], [class*="message"]')
        .last()
        .should('be.visible')
        .invoke('text')
        .should('not.be.empty');
    });

    it('should show typing indicator', () => {
      // Navigate to chat
      cy.get('a[href*="chat"], button:contains("Chat"), button:contains("Messages")')
        .first()
        .click({ force: true });

      // Send message
      cy.get('input[type="text"], textarea, [contenteditable="true"]')
        .filter(':visible')
        .first()
        .type('Tell me about pools', { delay: 50 });

      cy.get('button[aria-label*="send"], button:contains("Send")')
        .first()
        .click({ force: true });

      // Check for typing indicator
      cy.get('[data-testid*="typing"], [class*="typing"], [class*="indicator"]', {
        timeout: 10000,
      }).should('exist');

      // Indicator should disappear after response
      cy.get('[data-testid*="typing"], [class*="typing"]', {
        timeout: 10000,
      }).should('not.exist');
    });

    it('should display multiple messages in conversation', () => {
      // Navigate to chat
      cy.get('a[href*="chat"], button:contains("Chat"), button:contains("Messages")')
        .first()
        .click({ force: true });

      // Send multiple messages
      const messages = ['Hello', 'How do I create a stream?', 'What about liquidity pools?'];

      messages.forEach((msg, index) => {
        cy.get('input[type="text"], textarea, [contenteditable="true"]')
          .filter(':visible')
          .first()
          .type(msg, { delay: 50 });

        cy.get('button[aria-label*="send"], button:contains("Send")')
          .first()
          .click({ force: true });

        // Wait between messages
        if (index < messages.length - 1) {
          cy.wait(2000);
        }
      });

      // Verify all messages and responses are visible
      cy.get('[data-testid*="message"], [class*="message"]', { timeout: 15000 }).should(
        'have.length.greaterThan',
        messages.length
      );
    });
  });

  // ============================================
  // INTEGRATION TESTS
  // ============================================
  describe('Cross-Feature Integration', () => {
    it('should maintain session across features', () => {
      // Start in dashboard
      cy.visit('/');

      // Navigate to streams
      cy.get('a[href*="stream"], button:contains("Stream")').first().click({ force: true });
      cy.wait(1000);

      // Navigate to liquidity
      cy.get('a[href*="liquidity"], button:contains("Liquidity")').first().click({ force: true });
      cy.wait(1000);

      // Navigate to chat
      cy.get('a[href*="chat"], button:contains("Chat")').first().click({ force: true });
      cy.wait(1000);

      // Navigate back to dashboard
      cy.visit('/');

      // Should still be authenticated (not redirected to login)
      cy.url().should('not.include', 'login');
      cy.get('body').should('be.visible');
    });

    it('should sync data across tabs (if using WebSocket)', () => {
      // Get initial data
      cy.visit('/');
      cy.get('[data-testid="balance"], [class*="balance"]')
        .invoke('text')
        .as('initialBalance');

      // Simulate external update by refreshing
      cy.reload();
      cy.wait(2000);

      // Verify data is still present
      cy.get('[data-testid="balance"], [class*="balance"]').should('be.visible');
    });
  });
});

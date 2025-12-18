/**
 * Intent Parser Tests
 * Tests natural language understanding for StreamPay commands
 */

import { IntentParser, StreamPayIntent } from '../services/intent-parser';

describe('IntentParser', () => {
  let parser: IntentParser;

  beforeEach(() => {
    parser = new IntentParser();
  });

  describe('CREATE_STREAM', () => {
    it('should parse "create stream" command', () => {
      const result = parser.parseIntent('Create a stream of 1000 USDC to 0x1234567890123456789012345678901234567890 per day');
      expect(result.intent).toBe(StreamPayIntent.CREATE_STREAM);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.parameters.amount).toBe(1000);
    });

    it('should parse streaming payment intent', () => {
      const result = parser.parseIntent('Stream 100 DAI to alice.eth monthly');
      expect(result.intent).toBe(StreamPayIntent.CREATE_STREAM);
    });
  });

  describe('CLAIM_STREAM', () => {
    it('should parse "claim stream" command', () => {
      const result = parser.parseIntent('Claim my stream #1');
      expect(result.intent).toBe(StreamPayIntent.CLAIM_STREAM);
      expect(result.parameters.streamId).toBe('1');
    });

    it('should recognize claim variants', () => {
      const variants = [
        'Withdraw from stream',
        'Collect my stream tokens',
        'claim stream #2',
      ];

      for (const msg of variants) {
        const result = parser.parseIntent(msg);
        expect(result.intent).toBe(StreamPayIntent.CLAIM_STREAM);
      }
    });
  });

  describe('SWAP_TOKENS', () => {
    it('should parse swap command', () => {
      const result = parser.parseIntent('Swap 100 USDC for ETH');
      expect(result.intent).toBe(StreamPayIntent.SWAP_TOKENS);
      expect(result.parameters.tokenIn).toBe('USDC');
      expect(result.parameters.tokenOut).toBe('ETH');
      expect(result.parameters.amount).toBe(100);
    });

    it('should recognize exchange and trade variants', () => {
      const commands = [
        'Exchange 50 DAI for MATIC',
        'Trade 100 ETH to USDC',
        'Convert 200 MATIC to DAI',
      ];

      for (const cmd of commands) {
        const result = parser.parseIntent(cmd);
        expect(result.intent).toBe(StreamPayIntent.SWAP_TOKENS);
      }
    });
  });

  describe('CHECK_BALANCE', () => {
    it('should parse balance check commands', () => {
      const commands = [
        'What is my balance?',
        'Show my net worth',
        'My portfolio value',
      ];

      for (const cmd of commands) {
        const result = parser.parseIntent(cmd);
        expect(result.intent).toBe(StreamPayIntent.CHECK_BALANCE);
      }
    });
  });

  describe('GET_PRICE', () => {
    it('should parse price request', () => {
      const result = parser.parseIntent('What is the price of ETH?');
      expect(result.intent).toBe(StreamPayIntent.GET_PRICE);
      expect(result.parameters.symbol).toBe('ETH');
    });

    it('should recognize variants', () => {
      const commands = [
        'ETH price?',
        'How much is BTC?',
        'USDC cost?',
      ];

      for (const cmd of commands) {
        const result = parser.parseIntent(cmd);
        expect(result.intent).toBe(StreamPayIntent.GET_PRICE);
      }
    });
  });

  describe('VIEW_STREAMS', () => {
    it('should parse stream list commands', () => {
      const commands = [
        'Show my streams',
        'List active streams',
        'View my streams',
        'Stream balance',
      ];

      for (const cmd of commands) {
        const result = parser.parseIntent(cmd);
        expect(result.intent).toBe(StreamPayIntent.VIEW_STREAMS);
      }
    });
  });

  describe('ADD_LIQUIDITY', () => {
    it('should parse add liquidity command', () => {
      const result = parser.parseIntent('Add 1000 USDC liquidity to pool');
      expect(result.intent).toBe(StreamPayIntent.ADD_LIQUIDITY);
      expect(result.parameters.amount).toBe(1000);
    });
  });

  describe('Confidence Scoring', () => {
    it('should have high confidence with address and amount', () => {
      const result = parser.parseIntent(
        'Create stream of 1000 USDC to 0x1234567890123456789012345678901234567890'
      );
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should have lower confidence for vague requests', () => {
      const result = parser.parseIntent('do something');
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('Parameter Extraction', () => {
    it('should extract Ethereum addresses', () => {
      const result = parser.parseIntent(
        'Send to 0x1234567890123456789012345678901234567890'
      );
      expect(result.parameters.addresses).toBeDefined();
    });

    it('should extract token names', () => {
      const result = parser.parseIntent('Swap USDC for DAI');
      expect(result.parameters.tokens).toBeDefined();
      expect(result.parameters.tokens).toContain('USDC');
    });

    it('should extract amounts', () => {
      const result = parser.parseIntent('Transfer 123.45 tokens');
      expect(result.parameters.amount).toBe(123.45);
    });
  });

  describe('Validation', () => {
    it('should validate required parameters', () => {
      const createResult = parser.parseIntent('Create stream');
      const isValid = parser.validateIntent(createResult);
      expect(isValid).toBe(false); // Missing required params
    });

    it('should validate complete commands', () => {
      const result = parser.parseIntent(
        'Create stream of 1000 USDC to 0xabcd per day'
      );
      const isValid = parser.validateIntent(result);
      expect(isValid).toBe(result.parameters.recipient !== undefined);
    });
  });

  describe('Intent Descriptions', () => {
    it('should generate user-friendly descriptions', () => {
      const result = parser.parseIntent('Swap 100 USDC for ETH');
      const desc = parser.getIntentDescription(result);
      expect(desc).toBe('Swap tokens');
    });

    it('should describe unknown intents', () => {
      const result = parser.parseIntent('xyzabc nonsense gibberish');
      const desc = parser.getIntentDescription(result);
      expect(desc).toBe('Unknown request');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages', () => {
      const result = parser.parseIntent('');
      expect(result.intent).toBe(StreamPayIntent.UNKNOWN);
      expect(result.confidence).toBe(0);
    });

    it('should handle very long messages', () => {
      const longMsg = 'Create ' + 'a '.repeat(100) + 'stream of 1000 USDC to 0xabcd';
      const result = parser.parseIntent(longMsg);
      expect(result.confidence).toBeLessThan(0.9); // Should reduce confidence
    });

    it('should be case-insensitive', () => {
      const result1 = parser.parseIntent('CREATE STREAM');
      const result2 = parser.parseIntent('create stream');
      expect(result1.intent).toBe(result2.intent);
    });
  });
});

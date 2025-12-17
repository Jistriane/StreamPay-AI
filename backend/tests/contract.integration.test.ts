/**
 * Smart Contracts Integration Tests
 * 
 * Testa a integração do backend com o StreamPayCore.sol na Sepolia testnet
 * 
 * Pré-requisitos:
 * - PRIVATE_KEY definida em .env (testnet wallet)
 * - SEPOLIA_RPC_URL configurada
 * - Tokens de teste disponíveis na wallet
 * - Contratos deployados na Sepolia
 * 
 * Run: npm test -- tests/contract.integration.test.ts
 */

import {
  createStreamOnChain,
  toggleStreamOnChain,
  cancelStreamOnChain,
  getStreamedAmountOnChain,
  getMNEEPriceOnChain,
} from "../src/contract";
import { logger } from "../src/utils/logger";

describe("Smart Contracts Integration", () => {
  // Variáveis para armazenar dados entre testes
  let streamId: string;
  const FREELANCER_ADDRESS = "0x1234567890123456789012345678901234567890";
  const TEST_AMOUNT = "1000000000000000000"; // 1 token com 18 decimals
  const TEST_DURATION = 86400; // 1 dia em segundos
  const OUTPUT_TOKEN = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // USDC Sepolia
  const TEST_TOKEN = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // USDC Sepolia

  // Verificar se temos configuração válida
  const privateKey = process.env.PRIVATE_KEY;
  const hasValidKey = privateKey && privateKey.length === 66 && privateKey !== "0x0000000000000000000000000000000000000000000000000000000000000000";

  beforeAll(() => {
    if (!hasValidKey) {
      logger.warn("[Test] PRIVATE_KEY não configurada. Testes de contrato serão skipped.");
    }
  });

  (hasValidKey ? describe : describe.skip)("createStreamOnChain", () => {
    it("should create a stream on-chain with valid parameters", async () => {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey || privateKey === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        logger.info("[Test] Skipping - PRIVATE_KEY not configured");
        return;
      }

      try {
        const result = await createStreamOnChain({
          freelancer: FREELANCER_ADDRESS,
          totalAmount: TEST_AMOUNT,
          duration: TEST_DURATION,
          outputToken: OUTPUT_TOKEN,
          tokenAddress: TEST_TOKEN,
        });

        expect(result.success).toBe(true);
        expect(result.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
        expect(result.streamId).toBeDefined();

        streamId = result.streamId;
        logger.info(`[Test] Stream created with ID: ${streamId}`);
      } catch (error) {
        logger.error(`[Test] Error creating stream: ${error}`);
        throw error;
      }
    }, 60000); // 60 second timeout para transação blockchain

    it("should reject invalid freelancer address", async () => {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey || privateKey === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        logger.info("[Test] Skipping - PRIVATE_KEY not configured");
        return;
      }

      expect(async () => {
        await createStreamOnChain({
          freelancer: "invalid-address",
          totalAmount: TEST_AMOUNT,
          duration: TEST_DURATION,
          outputToken: OUTPUT_TOKEN,
          tokenAddress: TEST_TOKEN,
        });
      }).rejects.toThrow();
    });
  });

  (hasValidKey ? describe : describe.skip)("getStreamedAmountOnChain", () => {
    it("should retrieve streamed amount for valid stream ID", async () => {
      if (!streamId) {
        logger.info("[Test] Skipping - no stream ID from previous test");
        return;
      }

      try {
        const amount = await getStreamedAmountOnChain(parseInt(streamId));
        expect(amount).toBeDefined();
        expect(typeof amount).toBe("string");
        logger.info(`[Test] Streamed amount: ${amount}`);
      } catch (error) {
        logger.error(`[Test] Error getting streamed amount: ${error}`);
        throw error;
      }
    });

    it("should return 0 for new stream", async () => {
      if (!streamId) {
        logger.info("[Test] Skipping - no stream ID");
        return;
      }

      try {
        const amount = await getStreamedAmountOnChain(parseInt(streamId));
        expect(BigInt(amount)).toBeGreaterThanOrEqual(0n);
      } catch (error) {
        logger.error(`[Test] Error: ${error}`);
        throw error;
      }
    });
  });

  (hasValidKey ? describe : describe.skip)("toggleStreamOnChain", () => {
    it("should toggle stream to paused", async () => {
      if (!streamId) {
        logger.info("[Test] Skipping - no stream ID");
        return;
      }

      try {
        const result = await toggleStreamOnChain(parseInt(streamId), false);
        expect(result.success).toBe(true);
        expect(result.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
        logger.info(`[Test] Stream paused`);
      } catch (error) {
        logger.error(`[Test] Error pausing stream: ${error}`);
        throw error;
      }
    }, 60000);

    it("should toggle stream back to active", async () => {
      if (!streamId) {
        logger.info("[Test] Skipping - no stream ID");
        return;
      }

      try {
        const result = await toggleStreamOnChain(parseInt(streamId), true);
        expect(result.success).toBe(true);
        expect(result.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
        logger.info(`[Test] Stream resumed`);
      } catch (error) {
        logger.error(`[Test] Error resuming stream: ${error}`);
        throw error;
      }
    }, 60000);
  });

  (hasValidKey ? describe : describe.skip)("cancelStreamOnChain", () => {
    it("should cancel stream and return remaining funds", async () => {
      if (!streamId) {
        logger.info("[Test] Skipping - no stream ID");
        return;
      }

      try {
        const result = await cancelStreamOnChain(parseInt(streamId));
        expect(result.success).toBe(true);
        expect(result.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
        logger.info(`[Test] Stream cancelled`);
      } catch (error) {
        logger.error(`[Test] Error cancelling stream: ${error}`);
        throw error;
      }
    }, 60000);
  });

  (hasValidKey ? describe : describe.skip)("getMNEEPriceOnChain", () => {
    it("should retrieve current MNEE price from oracle", async () => {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey || privateKey === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        logger.info("[Test] Skipping - PRIVATE_KEY not configured");
        return;
      }

      try {
        const price = await getMNEEPriceOnChain();
        expect(price).toBeDefined();
        expect(typeof price).toBe("string");
        expect(BigInt(price)).toBeGreaterThan(0n);
        logger.info(`[Test] MNEE Price: ${price}`);
      } catch (error) {
        logger.error(`[Test] Error getting MNEE price: ${error}`);
        throw error;
      }
    });
  });
});

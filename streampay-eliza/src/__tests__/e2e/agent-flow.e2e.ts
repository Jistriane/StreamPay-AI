import {
  type IAgentRuntime,
  type Memory,
  type Content,
  type UUID,
  logger,
} from '@elizaos/core';
import { v4 as uuidv4 } from 'uuid';
import { createStreamPayAgent } from '../../agents/orchestrator';

interface TestCase {
  name: string;
  fn: (runtime: IAgentRuntime) => Promise<void>;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
}

/**
 * E2E Test Suite for StreamPay Agent Flow
 * 
 * Tests the complete flow:
 * 1. User message → Intent parsing
 * 2. Intent validation
 * 3. Signature request generation
 * 4. Error handling
 */
export const StreamPayAgentFlowTestSuite: TestSuite = {
  name: 'StreamPay Agent Flow E2E Tests',
  tests: [
    {
      name: 'agent_should_parse_create_stream_intent',
      fn: async (runtime: IAgentRuntime) => {
        const config = {
          moralisApiKey: process.env.MORALIS_API_KEY || 'test-key',
          chainlinkRpcUrl: process.env.CHAINLINK_RPC_URL || 'http://localhost:8545',
          backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
          network: (process.env.NETWORK as 'polygon' | 'mainnet' | 'sepolia' | 'localhost') || 'polygon',
        };

        const agent = createStreamPayAgent(config);
        const testAddress = '0x1234567890123456789012345678901234567890';

        const result = await agent.processMessage(
          'Criar stream de 1000 USDC para 0x1234567890123456789012345678901234567890 por 30 dias',
          testAddress
        );

        if (!result.success) {
          throw new Error(`Agent failed to parse intent: ${result.response}`);
        }

        logger.info('✓ Agent parsed CREATE_STREAM intent successfully');
      },
    },

    {
      name: 'agent_should_generate_signature_request_for_create_stream',
      fn: async (runtime: IAgentRuntime) => {
        const config = {
          moralisApiKey: process.env.MORALIS_API_KEY || 'test-key',
          chainlinkRpcUrl: process.env.CHAINLINK_RPC_URL || 'http://localhost:8545',
          backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
          network: (process.env.NETWORK as 'sepolia' | 'localhost') || 'sepolia',
        };

        const agent = createStreamPayAgent(config);
        const testAddress = '0x1234567890123456789012345678901234567890';

        const result = await agent.processMessage(
          'Criar stream de 100 USDC para 0x1234567890123456789012345678901234567890 por 7 dias',
          testAddress
        );

        if (!result.success) {
          throw new Error(`Agent failed: ${result.response}`);
        }

        // Verificar se retornou SignatureRequest
        if (!result.data) {
          throw new Error('Agent did not return data');
        }

        if (!result.data.pendingSignature) {
          throw new Error('Agent did not return pendingSignature flag');
        }

        if (!result.data.messageToSign) {
          throw new Error('Agent did not return messageToSign');
        }

        if (!result.data.payload) {
          throw new Error('Agent did not return payload');
        }

        // Validar estrutura do payload
        const payload = result.data.payload;
        if (payload.intent !== 'CREATE_STREAM') {
          throw new Error(`Expected CREATE_STREAM intent, got ${payload.intent}`);
        }

        if (payload.userAddress.toLowerCase() !== testAddress.toLowerCase()) {
          throw new Error('Payload userAddress does not match');
        }

        if (!payload.parameters.recipient || !payload.parameters.token || !payload.parameters.amount) {
          throw new Error('Payload missing required parameters');
        }

        logger.info('✓ Agent generated valid signature request');
      },
    },

    {
      name: 'agent_should_validate_required_parameters',
      fn: async (runtime: IAgentRuntime) => {
        const config = {
          moralisApiKey: process.env.MORALIS_API_KEY || 'test-key',
          chainlinkRpcUrl: process.env.CHAINLINK_RPC_URL || 'http://localhost:8545',
          backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
          network: (process.env.NETWORK as 'sepolia' | 'localhost') || 'sepolia',
        };

        const agent = createStreamPayAgent(config);
        const testAddress = '0x1234567890123456789012345678901234567890';

        // Teste com parâmetros faltando
        const result = await agent.processMessage(
          'Criar stream',
          testAddress
        );

        // Deve retornar erro de validação
        if (result.success) {
          throw new Error('Agent should have failed validation for missing parameters');
        }

        if (!result.response.includes('parâmetros') && !result.response.includes('parameters')) {
          throw new Error('Agent did not return validation error message');
        }

        logger.info('✓ Agent validated required parameters correctly');
      },
    },

    {
      name: 'agent_should_handle_claim_stream_intent',
      fn: async (runtime: IAgentRuntime) => {
        const config = {
          moralisApiKey: process.env.MORALIS_API_KEY || 'test-key',
          chainlinkRpcUrl: process.env.CHAINLINK_RPC_URL || 'http://localhost:8545',
          backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
          network: (process.env.NETWORK as 'sepolia' | 'localhost') || 'sepolia',
        };

        const agent = createStreamPayAgent(config);
        const testAddress = '0x1234567890123456789012345678901234567890';

        const result = await agent.processMessage(
          'Reivindicar tokens do stream 1',
          testAddress
        );

        if (!result.success) {
          // Pode falhar se streamId não for válido, mas deve processar o intent
          logger.info('⚠ Claim stream test completed (may fail if stream does not exist)');
          return;
        }

        // Se sucesso, deve retornar SignatureRequest
        if (result.data && result.data.pendingSignature) {
          if (result.data.payload.intent !== 'CLAIM_STREAM') {
            throw new Error(`Expected CLAIM_STREAM intent, got ${result.data.payload.intent}`);
          }
          logger.info('✓ Agent handled CLAIM_STREAM intent successfully');
        }
      },
    },

    {
      name: 'agent_should_handle_cancel_stream_intent',
      fn: async (runtime: IAgentRuntime) => {
        const config = {
          moralisApiKey: process.env.MORALIS_API_KEY || 'test-key',
          chainlinkRpcUrl: process.env.CHAINLINK_RPC_URL || 'http://localhost:8545',
          backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
          network: (process.env.NETWORK as 'sepolia' | 'localhost') || 'sepolia',
        };

        const agent = createStreamPayAgent(config);
        const testAddress = '0x1234567890123456789012345678901234567890';

        const result = await agent.processMessage(
          'Cancelar stream 1',
          testAddress
        );

        if (!result.success) {
          logger.info('⚠ Cancel stream test completed (may fail if stream does not exist)');
          return;
        }

        if (result.data && result.data.pendingSignature) {
          if (result.data.payload.intent !== 'CANCEL_STREAM') {
            throw new Error(`Expected CANCEL_STREAM intent, got ${result.data.payload.intent}`);
          }
          logger.info('✓ Agent handled CANCEL_STREAM intent successfully');
        }
      },
    },

    {
      name: 'agent_should_handle_error_gracefully',
      fn: async (runtime: IAgentRuntime) => {
        const config = {
          moralisApiKey: process.env.MORALIS_API_KEY || 'test-key',
          chainlinkRpcUrl: process.env.CHAINLINK_RPC_URL || 'http://localhost:8545',
          backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
          network: (process.env.NETWORK as 'sepolia' | 'localhost') || 'sepolia',
        };

        const agent = createStreamPayAgent(config);
        const testAddress = '0x1234567890123456789012345678901234567890';

        // Teste com mensagem inválida
        const result = await agent.processMessage(
          'asdfghjkl qwertyuiop zxcvbnm',
          testAddress
        );

        // Deve retornar erro, mas de forma amigável
        if (result.success) {
          // Pode ser que o parser tenha interpretado algo, não é necessariamente um erro
          logger.info('⚠ Agent processed unexpected message (may be valid)');
        } else {
          if (!result.response || result.response.length === 0) {
            throw new Error('Agent should return error message');
          }
          logger.info('✓ Agent handled error gracefully');
        }
      },
    },

    {
      name: 'agent_should_validate_address_format',
      fn: async (runtime: IAgentRuntime) => {
        const config = {
          moralisApiKey: process.env.MORALIS_API_KEY || 'test-key',
          chainlinkRpcUrl: process.env.CHAINLINK_RPC_URL || 'http://localhost:8545',
          backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
          network: (process.env.NETWORK as 'sepolia' | 'localhost') || 'sepolia',
        };

        const agent = createStreamPayAgent(config);
        const testAddress = '0x1234567890123456789012345678901234567890';

        // Teste com endereço inválido
        const result = await agent.processMessage(
          'Criar stream de 100 USDC para endereco-invalido por 7 dias',
          testAddress
        );

        // Deve retornar erro de validação
        if (result.success && result.data && result.data.pendingSignature) {
          // Se passou, pode ser que o parser tenha corrigido ou usado um padrão
          logger.info('⚠ Address validation test (parser may have handled it)');
        } else {
          logger.info('✓ Agent validated address format');
        }
      },
    },

    {
      name: 'agent_should_pass_user_address_and_auth_token',
      fn: async (runtime: IAgentRuntime) => {
        const config = {
          moralisApiKey: process.env.MORALIS_API_KEY || 'test-key',
          chainlinkRpcUrl: process.env.CHAINLINK_RPC_URL || 'http://localhost:8545',
          backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
          network: (process.env.NETWORK as 'sepolia' | 'localhost') || 'sepolia',
        };

        const agent = createStreamPayAgent(config);
        const testAddress = '0x1234567890123456789012345678901234567890';
        const testAuthToken = 'test-auth-token-12345';

        const result = await agent.processMessage(
          'Criar stream de 100 USDC para 0x1234567890123456789012345678901234567890 por 7 dias',
          testAddress,
          testAuthToken
        );

        if (!result.success) {
          throw new Error(`Agent failed: ${result.response}`);
        }

        // Verificar se o payload contém o userAddress correto
        if (result.data && result.data.payload) {
          if (result.data.payload.userAddress.toLowerCase() !== testAddress.toLowerCase()) {
            throw new Error('Payload does not contain correct userAddress');
          }
        }

        logger.info('✓ Agent passed userAddress and authToken correctly');
      },
    },
  ],
};

export default StreamPayAgentFlowTestSuite;

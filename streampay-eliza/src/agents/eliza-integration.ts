/**
 * ElizaOS Integration - StreamPay Plugin
 * Exposes StreamPay agent functionality to ElizaOS framework
 */

import { Action, IAgentRuntime, HandlerCallback, State } from '@elizaos/core';
import { createStreamPayAgent, StreamPayAgent } from './orchestrator';

/**
 * StreamPay Message Action for ElizaOS
 */
export const streamPayMessageAction: Action = {
  name: 'STREAMPAY_MESSAGE',
  description: 'Process StreamPay commands (create streams, swap tokens, check balances, etc.)',
  
  similes: [
    'CRYPTO_COMMAND',
    'WEB3_COMMAND',
    'DEFI_COMMAND',
    'STREAM_COMMAND',
    'LIQUIDITY_COMMAND',
  ],

  validate: async (runtime: IAgentRuntime, message: any) => {
    // Check if message contains StreamPay-related keywords
    const keywords = [
      'stream',
      'liquidity',
      'pool',
      'swap',
      'balance',
      'price',
      'token',
      'claim',
      'deposit',
    ];

    const messageText = message.content?.text || '';
    const hasKeyword = keywords.some((kw) => messageText.toLowerCase().includes(kw));

    return hasKeyword;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: any,
    state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    try {
      // Get configuration from runtime environment
      const config = {
        moralisApiKey: runtime.getSetting('MORALIS_API_KEY') || '',
        chainlinkRpcUrl: runtime.getSetting('CHAINLINK_RPC_URL') || '',
        backendUrl: runtime.getSetting('BACKEND_URL') || 'http://localhost:3001',
        userAddress: state?.userAddress || '',
        authToken: state?.authToken,
      };

      // Create agent instance
      const agent = createStreamPayAgent(config);

      // Get user message
      const userMessage = message.content?.text || '';
      const userAddress = message.userId || state?.userAddress || '';

      // Process message
      const result = await agent.processMessage(userMessage, userAddress, state?.authToken);

      // Send response
      if (callback) {
        callback({
          text: result.response,
          ...(result.data && { data: result.data }),
        });
      }

      return result.success;
    } catch (error) {
      console.error('[StreamPay ElizaOS] Error:', error);

      if (callback) {
        callback({
          text: 'I encountered an error processing your StreamPay request. Please try again.',
        });
      }

      return false;
    }
  },

  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Create a stream of 1000 USDC to 0x1234567890123456789012345678901234567890 per day for 30 days',
        },
      },
      {
        user: 'assistant',
        content: {
          text: 'Stream created successfully! Your payment stream is now active.',
        },
      },
    ],
    [
      {
        user: 'user',
        content: {
          text: 'What is my wallet balance?',
        },
      },
      {
        user: 'assistant',
        content: {
          text: 'Your wallet net worth is $5,234.50. You have 5 tokens in your portfolio.',
        },
      },
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Swap 100 USDC for ETH',
        },
      },
      {
        user: 'assistant',
        content: {
          text: 'Swap quote: 100 USDC → ~0.05 ETH. Ready to execute?',
        },
      },
    ],
  ],
};

/**
 * StreamPay Commands List Action
 */
export const streamPayCommandsAction: Action = {
  name: 'STREAMPAY_HELP',
  description: 'Show available StreamPay commands and features',

  similes: ['HELP', 'COMMANDS', 'WHAT_CAN_YOU_DO'],

  validate: async (runtime: IAgentRuntime, message: any) => {
    const text = message.content?.text || '';
    return /help|commands|what can you|features/i.test(text) && /stream|pool|defi/i.test(text);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: any,
    state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    try {
      const config = {
        moralisApiKey: runtime.getSetting('MORALIS_API_KEY') || '',
        chainlinkRpcUrl: runtime.getSetting('CHAINLINK_RPC_URL') || '',
        backendUrl: runtime.getSetting('BACKEND_URL') || 'http://localhost:3001',
      };

      const agent = createStreamPayAgent(config);
      const commands = agent.getAvailableCommands();

      const commandText = commands
        .map((cmd) => {
          return `• **${cmd.intent}**: ${cmd.description}\n  Examples: ${cmd.examples.join(', ')}`;
        })
        .join('\n\n');

      if (callback) {
        callback({
          text: `Here are the StreamPay commands I can help with:\n\n${commandText}\n\nJust ask me anything and I'll help!`,
        });
      }

      return true;
    } catch (error) {
      console.error('[StreamPay Help] Error:', error);

      if (callback) {
        callback({
          text: 'I encountered an error retrieving commands. Please try again.',
        });
      }

      return false;
    }
  },

  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'What can you help me with?',
        },
      },
      {
        user: 'assistant',
        content: {
          text: 'I can help with StreamPay operations like creating streams, swapping tokens, and managing liquidity. Type "help" for a list of commands.',
        },
      },
    ],
  ],
};

/**
 * Create ElizaOS plugin for StreamPay
 */
export const createStreamPayPlugin = () => {
  return {
    name: 'streampay-plugin',
    description: 'StreamPay DeFi agent for payment streams and liquidity management',
    version: '1.0.0',

    actions: [streamPayMessageAction, streamPayCommandsAction],

    providers: [],

    evaluators: [],

    services: [],
  };
};

/**
 * Export as ElizaOS module
 */
export default createStreamPayPlugin();

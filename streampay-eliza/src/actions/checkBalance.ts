import { Action, IAgentRuntime, Memory, State, HandlerCallback, elizaLogger } from '@elizaos/core';
import { MoralisService } from '../services/moralis';
import { createActionHandler } from '../services/action-handler';

export const checkBalanceAction: Action = {
    name: 'CHECK_BALANCE',
    similes: ['CHECK_WALLET', 'VIEW_BALANCE', 'MY_NET_WORTH', 'WALLET_STATUS', 'BALANCE'],
    description: 'Check the token balances and total net worth of the user connected wallet.',
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = (message.content?.text || '').toLowerCase();
        const keywords = ['balance', 'saldo', 'carteira', 'wallet', 'net worth', 'patrimônio', 'quanto tenho'];
        return keywords.some(kw => text.includes(kw));
    },
    handler: async (runtime: IAgentRuntime, message: Memory, state: State, _options: any, callback: HandlerCallback) => {
        elizaLogger.info('[StreamPay] Executing CHECK_BALANCE');
        
        const moralisApiKey = runtime.getSetting("MORALIS_API_KEY") || process.env.MORALIS_API_KEY;
        const backendUrl = runtime.getSetting("BACKEND_URL") || process.env.BACKEND_URL || 'http://localhost:3000';
        
        // Initialize services
        const moralisService = new MoralisService(moralisApiKey || '');
        
        // Extract user address from state (populated by providers preferably, or metadata)
        // Fallback for demo/testing
        const userAddress = (state as any).userAddress || '0x0000000000000000000000000000000000000000';

        const actionHandler = createActionHandler({
            backendUrl,
            userAddress,
            moralisService,
            chainlinkService: {} as any, // Not needed for this action
        } as any);


        const result = await (actionHandler as any).checkBalance(userAddress);

        await callback({
            text: result.message,
            content: {
                ...result.data
            }
        });

        return;
    },
    examples: [
        [
            {
                name: "{{user1}}",
                content: { text: "Qual meu saldo?" }
            },
            {
                name: "{{agent}}",
                content: { text: "O patrimônio líquido da sua carteira é $1,250.00", action: "CHECK_BALANCE" }
            }
        ],
        [
            {
                name: "{{user1}}",
                content: { text: "Check my wallet balance" }
            },
            {
                name: "{{agent}}",
                content: { text: "Your wallet net worth is $1,250.00", action: "CHECK_BALANCE" }
            }
        ]
    ]
};

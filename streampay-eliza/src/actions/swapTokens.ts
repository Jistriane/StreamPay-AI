import { Action, IAgentRuntime, Memory, State, HandlerCallback, elizaLogger } from '@elizaos/core';
import { createActionHandler } from '../services/action-handler';

export const swapTokensAction: Action = {
    name: 'SWAP_TOKENS',
    similes: ['EXCHANGE_TOKENS', 'TRADE_TOKENS', 'TROCAR_TOKENS', 'SWAP'],
    description: 'Swap exact amount of input tokens for output tokens.',
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = (message.content?.text || '').toLowerCase();
        const keywords = ['swap', 'trocar', 'exchange', 'convert', 'converter', 'trade'];
        return keywords.some(kw => text.includes(kw));
    },
    handler: async (runtime: IAgentRuntime, message: Memory, state: State, _options: any, callback: HandlerCallback) => {
        elizaLogger.info('[StreamPay] Executing SWAP_TOKENS');

        const context = `The user wants to swap tokens. Extract the following parameters:
        - tokenIn: Source token symbol (e.g. USDC, ETH)
        - tokenOut: Target token symbol (e.g. BTC, LINK)
        - amount: Amount to swap (Number)

        User message: "${message.content.text}"
        Return ONLY a JSON object. Example: {"tokenIn": "USDC", "tokenOut": "ETH", "amount": 100}`;

        let response = "{}";
        try {
             response = await (runtime as any).generateText({
                context,
                modelClass: "small",
            });
        } catch (e) {
            elizaLogger.error("Failed to generate text", e);
        }

        let params: any = {};
        try {
            params = JSON.parse(response);
        } catch (e) {
            elizaLogger.error("Failed to parse JSON from LLM", e);
        }

        if (!params.tokenIn || !params.tokenOut || !params.amount) {
            await callback({ text: "Preciso de mais informações. Indique o token de origem, destino e valor (ex: 'Swap 100 USDC por ETH')." });
            return;
        }

        const backendUrl = runtime.getSetting("BACKEND_URL") || process.env.BACKEND_URL || 'http://localhost:3000';
        const userAddress = (state as any).userAddress || '0x0';
        
        const actionHandler = createActionHandler({
            backendUrl,
            userAddress,
            moralisService: {} as any,
            chainlinkService: {} as any, // Not mocked here but required
        } as any);

        const result = await (actionHandler as any).swapTokens({
            tokenIn: params.tokenIn,
            tokenOut: params.tokenOut,
            amount: Number(params.amount)
        });

        await callback({
            text: result.message,
            content: { ...result.data }
        });

        return;
    },
    examples: [
        [
            {
                name: "{{user1}}",
                content: { text: "Swap 100 USDC for ETH" }
            },
            {
                name: "{{agent}}",
                content: { text: "Cotação: 100 USDC = 0.05 ETH. Assine na carteira.", action: "SWAP_TOKENS" }
            }
        ]
    ]
};

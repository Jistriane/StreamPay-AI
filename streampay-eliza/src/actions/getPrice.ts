import { Action, IAgentRuntime, Memory, State, HandlerCallback, elizaLogger } from '@elizaos/core';
import { createActionHandler } from '../services/action-handler';

export const getPriceAction: Action = {
    name: 'GET_PRICE',
    similes: ['PRICE_CHECK', 'TOKEN_PRICE', 'COTAÇÃO', 'PREÇO'],
    description: 'Get the current price of a cryptocurrency token.',
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = (message.content?.text || '').toLowerCase();
        const keywords = ['price', 'preço', 'cotação', 'quanto custa', 'valor do', 'how much is'];
        return keywords.some(kw => text.includes(kw));
    },
    handler: async (runtime: IAgentRuntime, message: Memory, state: State, _options: any, callback: HandlerCallback) => {
        elizaLogger.info('[StreamPay] Executing GET_PRICE');

        const context = `The user wants to check a token price. Extract the token symbol (e.g. ETH, BTC, USDC).
        User message: "${message.content.text}"
        Return ONLY a JSON object with "symbol" field. Example: {"symbol": "ETH"}`;

        let response = "{}";
        try {
            // Using runtime.generateText directly. Casting to any if necessary until types are verified.
            // Function signature detected: generateText(input: string, options?: GenerateTextOptions)
            response = await (runtime as any).generateText({
                context,
                modelClass: "small", // Using string 'small' instead of enum
            });
            // Note: If generateText returns JSON string directly or inside an object
            // Usually returns string.
            if (typeof response !== 'string') response = JSON.stringify(response); 
        } catch (e) {
            elizaLogger.error("Failed to generate text using runtime", e);
        }

        let params = { symbol: null };
        try {
            params = JSON.parse(response);
        } catch (e) {
            elizaLogger.warn("Failed to parse JSON from LLM, trying regex fallback", e);
        }

        if (!params.symbol && message.content.text) {
             const symbolMatch = message.content.text.match(/\b([A-Z]{2,})\b/i);
             if (symbolMatch) params.symbol = symbolMatch[1].toUpperCase() as any;
        }

        if (!params.symbol) {
            await callback({ text: "De qual token você quer saber o preço?" });
            return;
        }

        const backendUrl = runtime.getSetting("BACKEND_URL") || process.env.BACKEND_URL || 'http://localhost:3000';
        
        const actionHandler = createActionHandler({
            backendUrl,
            userAddress: '0x0',
            moralisService: {} as any,
            chainlinkService: { getPrice: async () => ({ price: 0 }) } as any, // dynamic initialization handled inside
        } as any);

        const result = await (actionHandler as any).getTokenPrice(params.symbol);

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
                content: { text: "Qual o preço do ETH?" }
            },
            {
                name: "{{agent}}",
                content: { text: "O preço do ETH agora é $3,450.00", action: "GET_PRICE" }
            }
        ],
        [
            {
                name: "{{user1}}",
                content: { text: "Check BTC price" }
            },
            {
                name: "{{agent}}",
                content: { text: "BTC price is $65,000.00", action: "GET_PRICE" }
            }
        ]
    ]
};

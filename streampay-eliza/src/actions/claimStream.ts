import { Action, IAgentRuntime, Memory, State, HandlerCallback, elizaLogger } from '@elizaos/core';
import { createActionHandler } from '../services/action-handler';

export const claimStreamAction: Action = {
    name: 'CLAIM_STREAM',
    similes: ['WITHDRAW_STREAM', 'RECEIVE_PAYMENT', 'SAQUE_STREAM', 'REIVINDICAR_PAGAMENTO'],
    description: 'Claim available tokens from a payment stream.',
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = (message.content?.text || '').toLowerCase();
        const keywords = ['claim', 'reivindicar', 'collect', 'coletar', 'withdraw stream', 'sacar stream'];
        return keywords.some(kw => text.includes(kw));
    },
    handler: async (runtime: IAgentRuntime, message: Memory, state: State, _options: any, callback: HandlerCallback) => {
        elizaLogger.info('[StreamPay] Executing CLAIM_STREAM');

        const context = `The user wants to claim a stream. Extract the stream ID.
        User message: "${message.content.text}"
        Return ONLY a JSON object with "streamId". Example: {"streamId": "123"}`;

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

        if (!params.streamId && message.content.text) {
            const match = message.content.text.match(/\bstream\s?(\d+|0x[a-f0-9]+)\b/i) || message.content.text.match(/\b(\d+)\b/);
            if (match) params.streamId = match[1];
        }

        if (!params.streamId) {
            await callback({ text: "Qual o ID do stream que você deseja reivindicar?" });
            return;
        }

        const backendUrl = runtime.getSetting("BACKEND_URL") || process.env.BACKEND_URL || 'http://localhost:3000';
        const userAddress = (state as any).userAddress || '0x0';
        
        const actionHandler = createActionHandler({
            backendUrl,
            userAddress,
            moralisService: {} as any,
            chainlinkService: {} as any,
        } as any);

        const result = await (actionHandler as any).claimStream(params.streamId);

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
                content: { text: "Claim stream 10" }
            },
            {
                name: "{{agent}}",
                content: { text: "Saque iniciado para o stream 10. Assine na carteira.", action: "CLAIM_STREAM" }
            }
        ]
    ]
};

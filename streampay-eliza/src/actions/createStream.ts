import { Action, IAgentRuntime, Memory, State, HandlerCallback, elizaLogger } from '@elizaos/core';
import { createActionHandler } from '../services/action-handler';

export const createStreamAction: Action = {
    name: 'CREATE_STREAM',
    similes: ['SEND_PAYMENT', 'MAKE_STREAM', 'PAY_STREAM', 'START_STREAM', 'ENVIAR_PAGAMENTO', 'CRIAR_STREAM'],
    description: 'Create a new payment stream to a recipient address.',
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = (message.content?.text || '').toLowerCase();
        const keywords = ['create stream', 'criar stream', 'new stream', 'novo stream', 'send payment', 'enviar pagamento', 'stream of', 'stream de'];
        return keywords.some(kw => text.includes(kw));
    },
    handler: async (runtime: IAgentRuntime, message: Memory, state: State, _options: any, callback: HandlerCallback) => {
        elizaLogger.info('[StreamPay] Executing CREATE_STREAM');

        const context = `The user wants to create a payment stream. Extract the following parameters:
        - recipient: Ethereum address (0x...)
        - amount: Number
        - token: Token symbol (e.g. USDC, DAI)
        - duration: Duration value (e.g. 30, 1)
        - durationUnit: Duration unit (e.g. days, months, seconds, minutes)

        User message: "${message.content.text}"
        Return ONLY a JSON object. Example: {"recipient": "0x123...", "amount": 100, "token": "USDC", "duration": 30, "durationUnit": "days"}`;

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

        if (!params.recipient || !params.amount || !params.token || !params.duration) {
            await callback({ text: "Preciso de mais informações. Por favor, especifique o destinatário, valor, token e duração." });
            return;
        }

        const backendUrl = runtime.getSetting("BACKEND_URL") || process.env.BACKEND_URL || 'http://localhost:3000';
        const userAddress = (state as any).userAddress || '0x0000000000000000000000000000000000000000';
        
        const actionHandler = createActionHandler({
            backendUrl,
            userAddress,
            moralisService: {} as any,
            chainlinkService: {} as any,
        } as any);

        const result = await (actionHandler as any).createStream({
            recipient: params.recipient,
            amount: params.amount,
            token: params.token,
            duration: params.duration,
            durationUnit: params.durationUnit || 'seconds'
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
                content: { text: "Create a stream of 100 USDC to 0x123... for 30 days" }
            },
            {
                name: "{{agent}}",
                content: { text: "Pronto para criar o stream. Confirme na sua carteira.", action: "CREATE_STREAM" }
            }
        ]
    ]
};

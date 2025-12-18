import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Gera conteúdo usando o modelo Gemini Pro
 * @param prompt - O texto de entrada para o modelo
 * @returns A resposta gerada pelo modelo
 */
export async function generateContent(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Erro ao gerar conteúdo com Gemini:", error.message);
    throw new Error(`Falha na geração de conteúdo: ${error.message}`);
  }
}

/**
 * Gera conteúdo com streaming (resposta em tempo real)
 * @param prompt - O texto de entrada para o modelo
 * @param onChunk - Callback chamado para cada pedaço de texto recebido
 */
export async function generateContentStream(
  prompt: string,
  onChunk: (text: string) => void
): Promise<void> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      onChunk(chunkText);
    }
  } catch (error: any) {
    console.error("Erro ao gerar stream com Gemini:", error.message);
    throw new Error(`Falha no streaming: ${error.message}`);
  }
}

/**
 * Inicia um chat com histórico de mensagens
 * @param history - Histórico de mensagens anteriores
 * @returns Instância do chat
 */
export function startChat(history: Array<{ role: string; parts: string }> = []) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  return model.startChat({
    history: history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    })),
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });
}

/**
 * Analisa transações e streams usando Gemini para insights
 * @param streamData - Dados do stream para análise
 * @returns Insights e recomendações geradas pelo modelo
 */
export async function analyzeStreamData(streamData: any): Promise<string> {
  const prompt = `
Analise os seguintes dados de streaming de pagamento e forneça insights:

Dados do Stream:
- Sender: ${streamData.sender}
- Recipient: ${streamData.recipient}
- Amount: ${streamData.amount}
- Token: ${streamData.token}
- Duration: ${streamData.duration} segundos
- Status: ${streamData.status}

Forneça:
1. Análise de risco
2. Padrões identificados
3. Recomendações de segurança
4. Sugestões de otimização
`;

  return await generateContent(prompt);
}

/**
 * Gera resumos de compliance e KYC usando Gemini
 * @param kycData - Dados KYC do usuário
 * @returns Resumo e análise de compliance
 */
export async function generateComplianceReport(kycData: any): Promise<string> {
  const prompt = `
Gere um relatório de compliance baseado nos seguintes dados KYC:

Usuário: ${kycData.wallet}
Status KYC: ${kycData.status}
Documentos: ${kycData.documents?.join(", ") || "Nenhum"}
Histórico de transações: ${kycData.transactionCount || 0}

Forneça:
1. Avaliação de risco de compliance
2. Requisitos pendentes
3. Recomendações regulatórias
4. Próximas ações necessárias
`;

  return await generateContent(prompt);
}

/**
 * Assistente virtual para suporte ao usuário
 * @param userMessage - Mensagem do usuário
 * @param context - Contexto adicional (opcional)
 * @returns Resposta do assistente
 */
export async function chatAssistant(
  userMessage: string,
  context?: string
): Promise<string> {
  const systemContext = `
Você é o STREAMPAY AI, um assistente virtual especializado em pagamentos em streaming via blockchain.
Você ajuda usuários a:
- Criar e gerenciar streams de pagamento
- Entender transações blockchain
- Resolver problemas de compliance
- Monitorar carteiras e contratos

${context ? `Contexto adicional: ${context}` : ""}
`;

  const prompt = `${systemContext}\n\nUsuário: ${userMessage}\n\nAssistente:`;
  return await generateContent(prompt);
}

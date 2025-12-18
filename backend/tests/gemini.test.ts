import { chatAssistant, analyzeStreamData, generateComplianceReport, generateContent } from "../src/gemini";

describe("Gemini AI Integration", () => {
  // Testes básicos que não dependem de API key
  it("deve exportar todas as funções necessárias", () => {
    expect(typeof chatAssistant).toBe("function");
    expect(typeof analyzeStreamData).toBe("function");
    expect(typeof generateComplianceReport).toBe("function");
    expect(typeof generateContent).toBe("function");
  });

  // Testes reais apenas se a API key estiver configurada e válida
  // Nota: Algumas chaves de exemplo podem existir no ambiente, mas não são válidas
  const apiKey = process.env.GEMINI_API_KEY || "";
  const isPlaceholder = apiKey.includes("your-") || 
                        apiKey.includes("example") || 
                        apiKey === "" ||
                        apiKey.startsWith("AIzaSyDqAFKDclQLsCYm9u8H"); // Chave de exemplo conhecida
  const hasValidApiKey = !isPlaceholder && apiKey.length > 20;

  (hasValidApiKey ? describe : describe.skip)("Com API Key configurada", () => {
    it("deve gerar conteúdo básico", async () => {
      const response = await generateContent("Diga 'Olá, StreamPay!' em português");
      expect(response).toBeDefined();
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(0);
    }, 10000);

    it("deve responder como assistente virtual", async () => {
      const response = await chatAssistant(
        "Como criar um stream de pagamento?",
        "Usuário novo na plataforma"
      );
      expect(response).toBeDefined();
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(0);
    }, 10000);

    it("deve analisar dados de stream", async () => {
      const streamData = {
        sender: "0x1234567890123456789012345678901234567890",
        recipient: "0x0987654321098765432109876543210987654321",
        amount: 1000,
        token: "USDC",
        duration: 3600,
        status: "active"
      };
      const analysis = await analyzeStreamData(streamData);
      expect(analysis).toBeDefined();
      expect(typeof analysis).toBe("string");
    }, 10000);

    it("deve gerar relatório de compliance", async () => {
      const kycData = {
        wallet: "0x1234567890123456789012345678901234567890",
        status: "approved",
        documents: ["passport", "proof_of_address"],
        transactionCount: 45
      };
      const report = await generateComplianceReport(kycData);
      expect(report).toBeDefined();
      expect(typeof report).toBe("string");
    }, 10000);
  });
});


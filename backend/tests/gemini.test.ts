import { chatAssistant, analyzeStreamData, generateComplianceReport, generateContent } from "../src/gemini";

// Teste básico do Gemini
async function testGeminiBasic() {
  console.log("🧪 Teste 1: Geração de conteúdo básico\n");
  try {
    const response = await generateContent("Diga 'Olá, StreamPay!' em português");
    console.log("✅ Resposta:", response);
    console.log("\n");
  } catch (error: any) {
    console.error("❌ Erro:", error.message);
  }
}

// Teste do assistente virtual
async function testChatAssistant() {
  console.log("🧪 Teste 2: Assistente Virtual\n");
  try {
    const response = await chatAssistant(
      "Como criar um stream de pagamento?",
      "Usuário novo na plataforma"
    );
    console.log("✅ Resposta do Assistente:", response);
    console.log("\n");
  } catch (error: any) {
    console.error("❌ Erro:", error.message);
  }
}

// Teste de análise de stream
async function testStreamAnalysis() {
  console.log("🧪 Teste 3: Análise de Stream\n");
  try {
    const streamData = {
      sender: "0x1234567890123456789012345678901234567890",
      recipient: "0x0987654321098765432109876543210987654321",
      amount: 1000,
      token: "USDC",
      duration: 3600,
      status: "active"
    };
    const analysis = await analyzeStreamData(streamData);
    console.log("✅ Análise:", analysis);
    console.log("\n");
  } catch (error: any) {
    console.error("❌ Erro:", error.message);
  }
}

// Teste de relatório de compliance
async function testComplianceReport() {
  console.log("🧪 Teste 4: Relatório de Compliance\n");
  try {
    const kycData = {
      wallet: "0x1234567890123456789012345678901234567890",
      status: "approved",
      documents: ["passport", "proof_of_address"],
      transactionCount: 45
    };
    const report = await generateComplianceReport(kycData);
    console.log("✅ Relatório:", report);
    console.log("\n");
  } catch (error: any) {
    console.error("❌ Erro:", error.message);
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log("🚀 Iniciando testes da integração Gemini AI\n");
  console.log("=".repeat(60));
  console.log("\n");

  await testGeminiBasic();
  await testChatAssistant();
  await testStreamAnalysis();
  await testComplianceReport();

  console.log("=".repeat(60));
  console.log("\n✨ Testes concluídos!\n");
}

// Verificar API key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERRO: GEMINI_API_KEY não configurada no .env");
  console.log("Configure a chave antes de executar os testes.");
  process.exit(1);
}

// Executar
runAllTests().catch(console.error);

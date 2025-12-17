import cors from "cors";
import 'dotenv/config';
import express from "express";
import http from "http";
import { createStream, getStreamsBySender, migrate } from "./db";
import { Pool } from "pg";
import axios from "axios";
import { chatAssistant, analyzeStreamData, generateComplianceReport } from "./gemini";
import authRouter from "./routes/auth";
import { webhookRouter } from "./webhooks";
import { wsRouter, WebSocketManager } from "./websocket";
import { Logger } from "./utils/logger";
import { initializeSentry, sentryRequestHandler, sentryErrorHandler, closeSentry } from "./monitoring/sentry";

// Initialize Sentry first
initializeSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: true,
});

const app = express();
const httpServer = http.createServer(app);

// Sentry request handler must be first
app.use(sentryRequestHandler());

app.use(express.json());

// Configure CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3003'
  ],
  credentials: true
}));
const logger = Logger.getInstance();
migrate();
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

// Initialize WebSocket
const wsManager = WebSocketManager.getInstance();
wsManager.initialize(httpServer);

async function authMiddleware(req: any, res: any, next: any) {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ error: "Não autenticado" });
  const [wallet, password] = authorization.split(":");
  try {
    const result = await pool.query("SELECT * FROM users WHERE wallet = $1 AND password = $2", [wallet, password]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Credenciais inválidas" });
    req.user = result.rows[0];
    next();
  } catch (err: any) {
    return res.status(500).json({ error: "Erro na autenticação", details: err.message });
  }
}

// Endpoint de verificação KYC/AML (mock/produção)
app.post("/api/kyc", authMiddleware, async (req: any, res: any) => {
  const { wallet, type, userData } = req.body;
  try {
    return res.status(501).json({ error: "Integração KYC real não configurada. Configure provider externo." });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro na verificação KYC", details: err.message });
  }
});

// Endpoint para claim de stream on-chain (removido - usar API de streams em routes/)


// Simulação de integração Moralis e Chainlink
app.get("/api/token-price", (req: any, res: any) => {
  const { token } = req.query;
  const prices = {
    USDC: 1.00,
    USDT: 1.00,
    ETH: 2000.00
  };
  const price = prices[token as keyof typeof prices] ?? null;
  res.json({ token, price });
});

app.get("/api/pool-address", (req: any, res: any) => {
  const { token0, token1 } = req.query;
  const pools = {
    "USDC-ETH": "0xPoolUSDCETH",
    "USDT-ETH": "0xPoolUSDTETH"
  };
  const key = `${token0}-${token1}`;
  const poolAddress = pools[key as keyof typeof pools] ?? null;
  res.json({ poolAddress });
});

// Endpoint de login (mock)
app.post("/api/login", async (req: any, res: any) => {
  const { wallet, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE wallet = $1 AND password = $2", [wallet, password]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Credenciais inválidas" });
    const user = result.rows[0];
    res.json({ message: "Login bem-sucedido", user: { id: user.id, type: user.type, wallet: user.wallet, email: user.email } });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro no login", details: err.message });
  }
});

// Endpoint do Assistente Gemini AI
app.post("/api/gemini/chat", authMiddleware, async (req: any, res: any) => {
  const { message, context } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória" });
  }
  try {
    const response = await chatAssistant(message, context);
    res.json({ success: true, response });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro ao processar chat", details: err.message });
  }
});

// Endpoint para análise de stream com Gemini
app.post("/api/gemini/analyze-stream", authMiddleware, async (req: any, res: any) => {
  const { streamData } = req.body;
  if (!streamData) {
    return res.status(400).json({ error: "Dados do stream são obrigatórios" });
  }
  try {
    const analysis = await analyzeStreamData(streamData);
    res.json({ success: true, analysis });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro ao analisar stream", details: err.message });
  }
});

// Endpoint para gerar relatório de compliance com Gemini
app.post("/api/gemini/compliance-report", authMiddleware, async (req: any, res: any) => {
  const { kycData } = req.body;
  if (!kycData) {
    return res.status(400).json({ error: "Dados KYC são obrigatórios" });
  }
  try {
    const report = await generateComplianceReport(kycData);
    res.json({ success: true, report });
  } catch (err: any) {
    return res.status(500).json({ error: "Erro ao gerar relatório", details: err.message });
  }
});

// Healthcheck
app.get("/health", (req: any, res: any) => res.send("OK"));

// Mount webhook routes
app.use("/api/auth", authRouter);

// Webhook router
app.use("/api", webhookRouter);

// Mount WebSocket routes
app.use("/api", wsRouter);

// Sentry error handler must be after routes
app.use(sentryErrorHandler());

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  logger.info(`Backend StreamPay rodando na porta ${PORT}`, { port: PORT });
  logger.info("WebSocket e Webhook systems initialized", {
    webhookUrl: process.env.WEBHOOK_URL,
    wsPort: process.env.WEBSOCKET_PORT || 3002,
    sentryEnabled: !!process.env.SENTRY_DSN,
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  wsManager.shutdown();
  await closeSentry();
  httpServer.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully...");
  wsManager.shutdown();
  await closeSentry();
  httpServer.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

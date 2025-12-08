import express from "express";
import { createStreamOnChain, claimStreamOnChain } from "./contract";
import { createStream, getStreamsBySender, migrate } from "./db";
import { Pool } from "pg";
import axios from "axios";

const app = express();
app.use(express.json());
migrate();
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

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

// Endpoint para claim de stream on-chain
app.post("/api/claim-stream", authMiddleware, async (req: any, res: any) => {
  const { streamId } = req.body;
  const contractAddress = process.env.STREAMPAY_CORE_ADDRESS || "0xYourContractAddress";
  let txHash = null;
  try {
    txHash = await claimStreamOnChain(contractAddress, streamId);
  } catch (err: any) {
    return res.status(500).json({ error: "Erro ao claimar stream on-chain", details: err.message });
  }
  res.json({ message: "Claim realizado com sucesso", txHash });
});

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

// Healthcheck
app.get("/health", (req: any, res: any) => res.send("OK"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend StreamPay rodando na porta ${PORT}`));

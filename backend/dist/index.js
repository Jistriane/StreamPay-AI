"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contract_1 = require("./contract");
const db_1 = require("./db");
const pg_1 = require("pg");
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, db_1.migrate)();
const pool = new pg_1.Pool({ connectionString: process.env.POSTGRES_URL });
async function authMiddleware(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization)
        return res.status(401).json({ error: "Não autenticado" });
    const [wallet, password] = authorization.split(":");
    try {
        const result = await pool.query("SELECT * FROM users WHERE wallet = $1 AND password = $2", [wallet, password]);
        if (result.rows.length === 0)
            return res.status(401).json({ error: "Credenciais inválidas" });
        req.user = result.rows[0];
        next();
    }
    catch (err) {
        return res.status(500).json({ error: "Erro na autenticação", details: err.message });
    }
}
// Endpoint de verificação KYC/AML (mock/produção)
app.post("/api/kyc", authMiddleware, async (req, res) => {
    const { wallet, type, userData } = req.body;
    try {
        return res.status(501).json({ error: "Integração KYC real não configurada. Configure provider externo." });
    }
    catch (err) {
        return res.status(500).json({ error: "Erro na verificação KYC", details: err.message });
    }
});
// Endpoint para claim de stream on-chain
app.post("/api/claim-stream", authMiddleware, async (req, res) => {
    const { streamId } = req.body;
    const contractAddress = process.env.STREAMPAY_CORE_ADDRESS || "0xYourContractAddress";
    let txHash = null;
    try {
        txHash = await (0, contract_1.claimStreamOnChain)(contractAddress, streamId);
    }
    catch (err) {
        return res.status(500).json({ error: "Erro ao claimar stream on-chain", details: err.message });
    }
    res.json({ message: "Claim realizado com sucesso", txHash });
});
// Simulação de integração Moralis e Chainlink
app.get("/api/token-price", (req, res) => {
    const { token } = req.query;
    const prices = {
        USDC: 1.00,
        USDT: 1.00,
        ETH: 2000.00
    };
    const price = prices[token] ?? null;
    res.json({ token, price });
});
app.get("/api/pool-address", (req, res) => {
    const { token0, token1 } = req.query;
    const pools = {
        "USDC-ETH": "0xPoolUSDCETH",
        "USDT-ETH": "0xPoolUSDTETH"
    };
    const key = `${token0}-${token1}`;
    const poolAddress = pools[key] ?? null;
    res.json({ poolAddress });
});
// Endpoint de login (mock)
app.post("/api/login", async (req, res) => {
    const { wallet, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE wallet = $1 AND password = $2", [wallet, password]);
        if (result.rows.length === 0)
            return res.status(401).json({ error: "Credenciais inválidas" });
        const user = result.rows[0];
        res.json({ message: "Login bem-sucedido", user: { id: user.id, type: user.type, wallet: user.wallet, email: user.email } });
    }
    catch (err) {
        return res.status(500).json({ error: "Erro no login", details: err.message });
    }
});
// Healthcheck
app.get("/health", (req, res) => res.send("OK"));
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend StreamPay rodando na porta ${PORT}`));

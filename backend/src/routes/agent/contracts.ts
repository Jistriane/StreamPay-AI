import express, { Router, Response } from "express";
import { z } from "zod";
import { Interface, parseUnits, getAddress } from "ethers";
import { authenticateJWT } from "../../middleware/auth";
import { asyncHandler, APIError } from "../../middleware/errorHandler";
import { getNetworkConfig } from "../../config/contracts";
import { authenticateAgentSignature, type AgentAuthRequest } from "../../middleware/agentAuth";

const router: Router = express.Router();

const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Endereço Ethereum inválido (0x + 40 hex)");

type Payload = NonNullable<AgentAuthRequest["agentAuth"]>["payload"];

const ERC20_ABI = ["function approve(address spender, uint256 amount) external returns (bool)"];

const STREAM_PAY_CORE_ABI = [
  "function createStream(address recipient, address token, uint256 deposit, uint256 ratePerSecond, uint256 duration) external returns (uint256)",
  "function claim(uint256 streamId) external",
  "function cancelStream(uint256 streamId) external",
];

const LIQUIDITY_POOL_ABI = [
  "function addLiquidity(uint256 poolId, uint256 amount0, uint256 amount1) external",
  "function removeLiquidity(uint256 poolId, uint256 shares) external",
];

const SWAP_ROUTER_ABI = [
  "function swapExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint256 minAmountOut) external returns (uint256)",
];

function resolveTokenAddress(tokenOrSymbol: string, networkCfg: any): string {
  if (typeof tokenOrSymbol === "string" && tokenOrSymbol.startsWith("0x")) {
    return getAddress(tokenOrSymbol); // Normalizar checksum
  }
  const key = String(tokenOrSymbol || "").toUpperCase();
  const addr = networkCfg[key];
  if (typeof addr === "string" && addr.startsWith("0x")) {
    return getAddress(addr); // Normalizar checksum
  }
  throw new APIError(400, `Token inválido ou não suportado: ${tokenOrSymbol}`, "INVALID_TOKEN");
}

function tokenDecimals(tokenSymbolOrAddress: string): number {
  const key = tokenSymbolOrAddress.toUpperCase();
  // Ajuste mínimo: USDC na Sepolia é 6 decimais.
  if (key === "USDC") return 6;
  if (key === "MNEE") return 18;
  return 18;
}

function buildTxRequest(to: string, data: string, value: string = "0x0") {
  return { to, data, value };
}

/**
 * POST /api/agent/execute-contract
 *
 * Não envia transação no backend. Retorna txRequests para o FRONTEND enviar via MetaMask.
 * Requer:
 * - JWT (Bearer) para autenticação da sessão
 * - signature + payload (mensagem canônica) para autorização explícita da ação
 */
router.post(
  "/execute-contract",
  authenticateJWT,
  authenticateAgentSignature,
  asyncHandler(async (req: AgentAuthRequest, res: Response) => {
    if (!req.user || !req.agentAuth) {
      throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
    }

    const payload: Payload = req.agentAuth.payload;

    const networkCfg = getNetworkConfig(payload.network);

    const intent = payload.intent.toUpperCase();
    const p = payload.parameters || {};

    // Resposta: lista de transações que o frontend deve enviar na ordem
    const txRequests: Array<{
      label: string;
      tx: { to: string; data: string; value: string };
    }> = [];

    if (intent === "CREATE_STREAM") {
      const recipient = addressSchema.parse(String(p.recipient || ""));
      const tokenAddr = resolveTokenAddress(String(p.token || ""), networkCfg);

      const durationSeconds = Number(p.durationSeconds || 0);
      if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        throw new APIError(400, "durationSeconds inválido", "INVALID_DURATION");
      }

      const amount = p.amount;
      if (amount == null || Number(amount) <= 0) {
        throw new APIError(400, "amount inválido", "INVALID_AMOUNT");
      }

      const decimals = p.tokenDecimals != null ? Number(p.tokenDecimals) : tokenDecimals(String(p.token || ""));
      const depositRaw = p.amountRaw ? BigInt(String(p.amountRaw)) : parseUnits(String(amount), decimals);
      const ratePerSecond = p.ratePerSecondRaw
        ? BigInt(String(p.ratePerSecondRaw))
        : depositRaw / BigInt(durationSeconds);

      if (ratePerSecond <= 0n) {
        throw new APIError(400, "ratePerSecond inválido", "INVALID_RATE");
      }

      const streamCore = getAddress(String(networkCfg.StreamPayCore));
      const recipientChecksummed = getAddress(recipient);
      const erc20Iface = new Interface(ERC20_ABI);
      const coreIface = new Interface(STREAM_PAY_CORE_ABI);

      // 1) approve(token, StreamPayCore, deposit)
      txRequests.push({
        label: "Aprovar token para StreamPayCore",
        tx: buildTxRequest(
          tokenAddr,
          erc20Iface.encodeFunctionData("approve", [streamCore, depositRaw])
        ),
      });

      // 2) createStream(recipient, token, deposit, ratePerSecond, duration)
      txRequests.push({
        label: "Criar stream (on-chain)",
        tx: buildTxRequest(
          streamCore,
          coreIface.encodeFunctionData("createStream", [
            recipientChecksummed,
            tokenAddr,
            depositRaw,
            ratePerSecond,
            BigInt(durationSeconds),
          ])
        ),
      });
    } else if (intent === "CLAIM_STREAM") {
      const streamId = BigInt(String(p.streamId || "0"));
      if (streamId < 0n) {
        throw new APIError(400, "streamId inválido", "INVALID_STREAM_ID");
      }
      const coreIface = new Interface(STREAM_PAY_CORE_ABI);
      txRequests.push({
        label: "Claim tokens do stream",
        tx: buildTxRequest(String(networkCfg.StreamPayCore), coreIface.encodeFunctionData("claim", [streamId])),
      });
    } else if (intent === "CANCEL_STREAM") {
      const streamId = BigInt(String(p.streamId || "0"));
      if (streamId < 0n) {
        throw new APIError(400, "streamId inválido", "INVALID_STREAM_ID");
      }
      const coreIface = new Interface(STREAM_PAY_CORE_ABI);
      txRequests.push({
        label: "Cancelar stream",
        tx: buildTxRequest(
          String(networkCfg.StreamPayCore),
          coreIface.encodeFunctionData("cancelStream", [streamId])
        ),
      });
    } else if (intent === "PAUSE_STREAM") {
      // O contrato atual não possui pause por stream. Mantemos como não suportado on-chain.
      throw new APIError(
        400,
        "PAUSE_STREAM não suportado on-chain neste contrato (use cancel/withdrawExpiredStream).",
        "NOT_SUPPORTED"
      );
    } else if (intent === "SWAP_TOKENS") {
      const tokenIn = resolveTokenAddress(String(p.tokenIn || ""), networkCfg);
      const tokenOut = resolveTokenAddress(String(p.tokenOut || ""), networkCfg);
      const fee = p.fee != null ? Number(p.fee) : 3000;
      const amount = p.amount;
      if (amount == null || Number(amount) <= 0) {
        throw new APIError(400, "amount inválido", "INVALID_AMOUNT");
      }
      const decimalsIn = p.tokenInDecimals != null ? Number(p.tokenInDecimals) : 18;
      const amountInRaw = p.amountInRaw ? BigInt(String(p.amountInRaw)) : parseUnits(String(amount), decimalsIn);
      const minAmountOutRaw = p.minAmountOutRaw ? BigInt(String(p.minAmountOutRaw)) : 0n;

      const swapRouter = String(networkCfg.SwapRouter);
      const erc20Iface = new Interface(ERC20_ABI);
      const swapIface = new Interface(SWAP_ROUTER_ABI);

      txRequests.push({
        label: "Aprovar token de entrada para SwapRouter",
        tx: buildTxRequest(tokenIn, erc20Iface.encodeFunctionData("approve", [swapRouter, amountInRaw])),
      });
      txRequests.push({
        label: "Executar swap (single hop)",
        tx: buildTxRequest(
          swapRouter,
          swapIface.encodeFunctionData("swapExactInputSingle", [
            tokenIn,
            tokenOut,
            fee,
            amountInRaw,
            minAmountOutRaw,
          ])
        ),
      });
    } else if (intent === "ADD_LIQUIDITY") {
      const poolId = p.poolId != null ? BigInt(String(p.poolId)) : null;
      const amount0 = p.amount0 != null ? BigInt(String(p.amount0)) : null;
      const amount1 = p.amount1 != null ? BigInt(String(p.amount1)) : null;

      if (poolId == null || amount0 == null || amount1 == null) {
        throw new APIError(
          400,
          "ADD_LIQUIDITY requer poolId, amount0 e amount1 (em unidades raw).",
          "MISSING_PARAMS"
        );
      }

      const liqIface = new Interface(LIQUIDITY_POOL_ABI);
      txRequests.push({
        label: "Adicionar liquidez",
        tx: buildTxRequest(
          String(networkCfg.LiquidityPool),
          liqIface.encodeFunctionData("addLiquidity", [poolId, amount0, amount1])
        ),
      });
    } else if (intent === "REMOVE_LIQUIDITY") {
      const poolId = p.poolId != null ? BigInt(String(p.poolId)) : null;
      const shares = p.shares != null ? BigInt(String(p.shares)) : null;
      if (poolId == null || shares == null) {
        throw new APIError(
          400,
          "REMOVE_LIQUIDITY requer poolId e shares (em unidades raw).",
          "MISSING_PARAMS"
        );
      }
      const liqIface = new Interface(LIQUIDITY_POOL_ABI);
      txRequests.push({
        label: "Remover liquidez",
        tx: buildTxRequest(
          String(networkCfg.LiquidityPool),
          liqIface.encodeFunctionData("removeLiquidity", [poolId, shares])
        ),
      });
    } else {
      throw new APIError(400, `Intent não suportada: ${payload.intent}`, "UNSUPPORTED_INTENT");
    }

    res.json({
      success: true,
      txRequests,
    });
  })
);

export default router;


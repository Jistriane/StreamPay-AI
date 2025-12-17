// Integração backend com smart contract StreamPayCore via ethers.js
import { ethers } from "ethers";
import { getNetworkConfig } from "./config/contracts";
import { logger } from "./utils/logger";

const networkConfig = getNetworkConfig(process.env.NETWORK as any);
const rpcUrl = networkConfig.rpcUrl;
const provider = new ethers.JsonRpcProvider(rpcUrl);

// Função para obter wallet de forma segura (lazy initialization)
function getWallet(): ethers.Wallet {
  let privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length !== 66 || !privateKey.startsWith("0x")) {
    logger.warn("[StreamPay] PRIVATE_KEY não definida ou inválida. Contratos on-chain não serão executados.");
    throw new Error("PRIVATE_KEY inválida ou não configurada");
  }
  return new ethers.Wallet(privateKey, provider);
}

// ABI do StreamPayCore
const StreamPayCoreABI = [
  "function createStream(address freelancer, uint256 totalAmount, uint256 duration, address outputToken) external returns (uint256)",
  "function getStreamedAmount(uint256 streamId) external view returns (uint256)",
  "function toggleStream(uint256 streamId, bool active) external",
  "function cancelStream(uint256 streamId) external",
  "function executeAISwap(uint256 streamId, uint256 mneeAmount, uint256 minOutputAmount, uint256 volatilityPercent) external",
  "function getMNEEPrice() external view returns (uint256)",
  "event StreamCreated(uint256 indexed streamId, address indexed company, address indexed freelancer, uint256 amountPerSecond, uint256 totalAmount, address outputToken, uint256 duration)",
  "event StreamUpdated(uint256 indexed streamId, bool active, uint256 timestamp)",
  "event PaymentStreamed(uint256 indexed streamId, address indexed freelancer, uint256 mneeAmount, uint256 outputAmount, address outputToken, uint256 timestamp)",
  "event HedgeExecuted(uint256 indexed streamId, uint256 mneeAmount, uint256 outputAmount, uint256 volatilityPercent, uint256 timestamp)"
];

// ERC20 ABI (minimal)
const ERC20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

export function getStreamPayContract(contractAddress?: string) {
  const address = contractAddress || networkConfig.StreamPayCore;
  const wallet = getWallet();
  return new ethers.Contract(address, StreamPayCoreABI, wallet);
}

export function getERC20Contract(tokenAddress: string) {
  const wallet = getWallet();
  return new ethers.Contract(tokenAddress, ERC20ABI, wallet);
}

/**
 * Create a stream on-chain
 * @param params { freelancer, totalAmount, duration, outputToken, tokenAddress }
 * @returns transaction hash and stream ID
 */
export async function createStreamOnChain(params: {
  freelancer: string;
  totalAmount: string;
  duration: number;
  outputToken: string;
  tokenAddress: string;
}) {
  try {
    logger.info(`[StreamPayCore] Creating stream for ${params.freelancer}...`);
    
    const contract = getStreamPayContract();
    
    // Step 1: Approve token transfer
    logger.info(`[ERC20] Approving ${params.totalAmount} tokens...`);
    const tokenContract = getERC20Contract(params.tokenAddress);
    const approveTx = await tokenContract.approve(networkConfig.StreamPayCore, params.totalAmount);
    await approveTx.wait();
    logger.info(`[ERC20] Approval confirmed: ${approveTx.hash}`);
    
    // Step 2: Create stream on contract
    logger.info(`[StreamPayCore] Calling createStream()...`);
    const createTx = await contract.createStream(
      params.freelancer,
      ethers.parseUnits(params.totalAmount, 18),
      params.duration,
      params.outputToken
    );
    
    const receipt = await createTx.wait();
    logger.info(`[StreamPayCore] Transaction confirmed: ${createTx.hash}`);
    
    // Extract stream ID from event logs
    const iface = new ethers.Interface(StreamPayCoreABI);
    let streamId = null;
    
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed?.name === "StreamCreated") {
            streamId = parsed.args[0];
            break;
          }
        } catch (e) {
          // Log parsing failed, try next
        }
      }
    }
    
    return {
      txHash: createTx.hash,
      streamId: streamId?.toString() || "unknown",
      success: true,
    };
  } catch (error) {
    logger.error(`[StreamPayCore] Error creating stream: ${error}`);
    throw error;
  }
}

/**
 * Get streamed amount for a stream
 */
export async function getStreamedAmountOnChain(streamId: number) {
  try {
    const contract = getStreamPayContract();
    const amount = await contract.getStreamedAmount(streamId);
    return amount.toString();
  } catch (error) {
    logger.error(`[StreamPayCore] Error getting streamed amount: ${error}`);
    throw error;
  }
}

/**
 * Pause/Resume a stream
 */
export async function toggleStreamOnChain(streamId: number, active: boolean) {
  try {
    logger.info(`[StreamPayCore] Toggling stream ${streamId} to ${active ? "active" : "paused"}...`);
    const contract = getStreamPayContract();
    const tx = await contract.toggleStream(streamId, active);
    await tx.wait();
    logger.info(`[StreamPayCore] Stream toggled: ${tx.hash}`);
    return { txHash: tx.hash, success: true };
  } catch (error) {
    logger.error(`[StreamPayCore] Error toggling stream: ${error}`);
    throw error;
  }
}

/**
 * Cancel a stream and return remaining funds
 */
export async function cancelStreamOnChain(streamId: number) {
  try {
    logger.info(`[StreamPayCore] Cancelling stream ${streamId}...`);
    const contract = getStreamPayContract();
    const tx = await contract.cancelStream(streamId);
    await tx.wait();
    logger.info(`[StreamPayCore] Stream cancelled: ${tx.hash}`);
    return { txHash: tx.hash, success: true };
  } catch (error) {
    logger.error(`[StreamPayCore] Error cancelling stream: ${error}`);
    throw error;
  }
}

/**
 * Execute AI swap (hedge)
 */
export async function executeAISwapOnChain(params: {
  streamId: number;
  mneeAmount: string;
  minOutputAmount: string;
  volatilityPercent: number;
}) {
  try {
    logger.info(`[StreamPayCore] Executing AI swap for stream ${params.streamId}...`);
    const contract = getStreamPayContract();
    const tx = await contract.executeAISwap(
      params.streamId,
      ethers.parseUnits(params.mneeAmount, 18),
      ethers.parseUnits(params.minOutputAmount, 18),
      params.volatilityPercent
    );
    await tx.wait();
    logger.info(`[StreamPayCore] Swap executed: ${tx.hash}`);
    return { txHash: tx.hash, success: true };
  } catch (error) {
    logger.error(`[StreamPayCore] Error executing swap: ${error}`);
    throw error;
  }
}

/**
 * Get current MNEE price from oracle
 */
export async function getMNEEPriceOnChain() {
  try {
    const contract = getStreamPayContract();
    const price = await contract.getMNEEPrice();
    return price.toString();
  } catch (error) {
    logger.error(`[StreamPayCore] Error getting MNEE price: ${error}`);
    throw error;
  }
}

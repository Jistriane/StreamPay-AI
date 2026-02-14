/**
 * ContractService
 *
 * Responsible for preparing and (optionally) executing on-chain operations.
 *
 * IMPORTANT:
 * - In the StreamPay architecture, the user authorizes actions by signing a structured message.
 * - The backend validates the signature and acts as an executor/relayer.
 * - This service therefore focuses on building a signature request payload and a canonical messageToSign.
 */
import { HttpClient } from './http-client';
import type { StreamPayIntent } from './intent-parser';
import { randomUUID } from 'crypto';
import { z } from 'zod';

export type NetworkName = 'sepolia' | 'localhost' | 'ethereum' | 'mainnet' | 'polygon';

export interface SignaturePayload<TParams extends Record<string, any> = Record<string, any>> {
  /**
   * Versioned payload to prevent replay and allow future schema evolution.
   */
  version: '1';
  requestId: string;
  intent: StreamPayIntent | string;
  userAddress: string;
  network: NetworkName;
  chainId: number;
  parameters: TParams;
  issuedAt: number;
  expiresAt: number;
}

export interface SignatureRequest<TParams extends Record<string, any> = Record<string, any>> {
  pendingSignature: true;
  messageToSign: string;
  payload: SignaturePayload<TParams>;
}

export interface ExecutionResult<T = any> {
  success: boolean;
  txHash?: string;
  data?: T;
  error?: string;
}

export interface ContractServiceConfig {
  backendUrl: string;
  /**
   * User address (wallet) that will sign the authorization message.
   */
  userAddress: string;
  /**
   * Network where the contracts live.
   */
  network?: NetworkName;
  /**
   * Optional JWT auth token for backend calls.
   */
  authToken?: string;
}

const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Endereço Ethereum inválido (esperado 0x + 40 hex)');

function getChainId(network: string): number {
  const n = network.toLowerCase();
  if (n === 'ethereum' || n === 'mainnet') return 1;
  if (n === 'sepolia') return 11155111;
  if (n === 'polygon') return 137;
  return 31337;
}

function canonicalMessage(payload: SignaturePayload): string {
  // Keep a stable prefix + canonical JSON (sorted keys is not guaranteed; keep structure stable).
  // This is good enough given we verify signature server-side against the same string.
  return `StreamPay Authorization\n\n${JSON.stringify(payload)}`;
}

export class ContractService {
  private httpClient: HttpClient;
  private config: Required<Pick<ContractServiceConfig, 'backendUrl' | 'userAddress'>> &
    Pick<ContractServiceConfig, 'authToken'> & { network: NetworkName };

  constructor(config: ContractServiceConfig) {
    this.config = {
      backendUrl: config.backendUrl,
      userAddress: config.userAddress,
      authToken: config.authToken,
      network: config.network || (process.env.NETWORK as NetworkName) || 'ethereum',
    };

    this.httpClient = new HttpClient({
      baseURL: this.config.backendUrl,
      timeout: 30000,
      headers: this.config.authToken ? { Authorization: `Bearer ${this.config.authToken}` } : undefined,
    });
  }

  /**
   * Prepare a signature request (user must sign messageToSign).
   */
  private prepare<TParams extends Record<string, any>>(
    intent: StreamPayIntent | string,
    params: TParams,
    ttlMs = 5 * 60_000
  ): SignatureRequest<TParams> {
    addressSchema.parse(this.config.userAddress);

    const now = Date.now();
    const payload: SignaturePayload<TParams> = {
      version: '1',
      requestId: randomUUID(),
      intent,
      userAddress: this.config.userAddress,
      network: this.config.network,
      chainId: getChainId(this.config.network),
      parameters: params,
      issuedAt: now,
      expiresAt: now + ttlMs,
    };

    return {
      pendingSignature: true,
      payload,
      messageToSign: canonicalMessage(payload),
    };
  }

  /**
   * Optional helper for direct execution (mainly used by tests or agent backends).
   * In the main product flow, the FRONTEND calls the backend endpoint after the user signs.
   */
  async execute(signature: string, payload: SignaturePayload): Promise<ExecutionResult> {
    try {
      const response = await this.httpClient.post<ExecutionResult>('/api/agent/execute-contract', {
        signature,
        payload,
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ===== High-level intent helpers (return SignatureRequest) =====

  createStream(params: { recipient: string; token: string; amount: number; durationSeconds: number }) {
    addressSchema.parse(params.recipient);
    return this.prepare('CREATE_STREAM', params);
  }

  claimStream(params: { streamId: string }) {
    return this.prepare('CLAIM_STREAM', params);
  }

  pauseStream(params: { streamId: string }) {
    return this.prepare('PAUSE_STREAM', params);
  }

  cancelStream(params: { streamId: string }) {
    return this.prepare('CANCEL_STREAM', params);
  }

  swapTokens(params: { tokenIn: string; tokenOut: string; amount: number; slippageBps?: number }) {
    return this.prepare('SWAP_TOKENS', params);
  }

  addLiquidity(params: { poolId?: string; token: string; amount: number }) {
    return this.prepare('ADD_LIQUIDITY', params);
  }

  removeLiquidity(params: { poolId: string; amount?: number }) {
    return this.prepare('REMOVE_LIQUIDITY', params);
  }
}

export const createContractService = (config: ContractServiceConfig) => new ContractService(config);

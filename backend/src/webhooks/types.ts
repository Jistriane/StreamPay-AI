/**
 * Types para o sistema de webhooks
 */

export enum WebhookEventType {
  STREAM_CREATED = 'stream.created',
  STREAM_CLAIMED = 'stream.claimed',
  STREAM_PAUSED = 'stream.paused',
  STREAM_CANCELED = 'stream.canceled',
  STREAM_COMPLETED = 'stream.completed',
  POOL_CREATED = 'pool.created',
  LIQUIDITY_ADDED = 'pool.liquidity.added',
  LIQUIDITY_REMOVED = 'pool.liquidity.removed',
  POOL_SWAPPED = 'pool.swap.executed',
  TRANSACTION_FAILED = 'transaction.failed'
}

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: number;
  data: Record<string, unknown>;
  signature: string;
  nonce: string;
}

export interface StreamCreatedEvent extends Record<string, unknown> {
  streamId: string;
  creator: string;
  recipient: string;
  token: string;
  amount: string;
  duration: number;
  transactionHash: string;
  blockNumber: number;
}

export interface StreamClaimedEvent extends Record<string, unknown> {
  streamId: string;
  claimer: string;
  amountClaimed: string;
  transactionHash: string;
  blockNumber: number;
}

export interface PoolCreatedEvent extends Record<string, unknown> {
  poolId: string;
  creator: string;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  transactionHash: string;
  blockNumber: number;
}

export interface LiquidityAddedEvent extends Record<string, unknown> {
  poolId: string;
  provider: string;
  amountA: string;
  amountB: string;
  lpTokensMinted: string;
  transactionHash: string;
  blockNumber: number;
}

export interface WebhookLog {
  id: string;
  eventType: WebhookEventType;
  payload: WebhookPayload;
  status: 'success' | 'failed' | 'pending';
  retryCount: number;
  lastRetry: Date | null;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export interface WebhookConfig {
  enabled: boolean;
  url: string;
  secret: string;
  events: WebhookEventType[];
  maxRetries: number;
  retryDelay: number; // em ms
}

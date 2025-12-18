/**
 * WebSocket Types and Interfaces
 * Real-time event streaming for StreamPay
 */

export enum WebSocketEventType {
  // Connection events
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  AUTH = "auth",
  AUTHENTICATED = "authenticated",
  AUTH_ERROR = "auth_error",

  // Stream events
  STREAM_CREATED = "stream:created",
  STREAM_CLAIMED = "stream:claimed",
  STREAM_PAUSED = "stream:paused",
  STREAM_CANCELED = "stream:canceled",
  STREAM_COMPLETED = "stream:completed",
  STREAM_UPDATED = "stream:updated",

  // Pool events
  POOL_CREATED = "pool:created",
  LIQUIDITY_ADDED = "pool:liquidity_added",
  LIQUIDITY_REMOVED = "pool:liquidity_removed",
  SWAP_EXECUTED = "pool:swap_executed",
  POOL_UPDATED = "pool:updated",

  // Chat events
  CHAT_MESSAGE = "chat:message",
  TYPING_INDICATOR = "chat:typing",
  USER_ONLINE = "chat:user_online",
  USER_OFFLINE = "chat:user_offline",

  // Notification events
  NOTIFICATION = "notification:new",
  ALERT = "alert:critical",

  // Price updates
  PRICE_UPDATE = "price:update",
  GAS_PRICE_UPDATE = "gas:price_update",

  // System events
  HEARTBEAT = "heartbeat",
  HEARTBEAT_ACK = "heartbeat_ack",
}

export interface WebSocketAuthPayload {
  token: string; // JWT token
  wallet: string; // User wallet address
}

export interface AuthenticatedUser {
  id: string;
  wallet: string;
  email: string;
  type: "individual" | "business" | "trader";
}

export interface WebSocketMessage<T = any> {
  event: WebSocketEventType | string;
  timestamp: number;
  data: T;
  requestId?: string; // For request-response pattern
}

export interface StreamEventData {
  streamId: string;
  sender: string;
  receiver: string;
  tokenAddress: string;
  amount: string;
  rate: string;
  status: "active" | "paused" | "completed" | "canceled";
  claimedAmount: string;
  txHash?: string;
}

export interface PoolEventData {
  poolId: string;
  token0: string;
  token1: string;
  fee: number;
  totalLiquidity: string;
  tvl: string;
  status: "active" | "paused" | "closed";
  txHash?: string;
}

export interface ChatMessageData {
  messageId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  roomId: string; // stream:123 or pool:456
  timestamp: number;
}

export interface TypingIndicatorData {
  userId: string;
  userName: string;
  roomId: string;
  isTyping: boolean;
}

export interface UserPresenceData {
  userId: string;
  userName: string;
  wallet: string;
  status: "online" | "offline" | "away";
  lastSeen: number;
}

export interface NotificationData {
  id: string;
  type:
    | "stream"
    | "pool"
    | "transaction"
    | "system"
    | "alert"
    | "info";
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  read: boolean;
  timestamp: number;
}

export interface PriceUpdateData {
  token: string;
  price: string;
  change24h: string; // Percentage
  timestamp: number;
  source: "chainlink" | "moralis" | "uniswap";
}

export interface GasPriceUpdateData {
  network: string;
  standard: string; // gwei
  fast: string;
  fastest: string;
  timestamp: number;
}

export interface HeartbeatPayload {
  timestamp: number;
  clientId: string;
}

export interface HeartbeatAckPayload {
  timestamp: number;
  serverId: string;
  latency: number; // ms
}

export interface RoomSubscription {
  roomId: string;
  userId: string;
  subscribedAt: number;
  filters?: {
    eventTypes?: string[];
    wallet?: string;
  };
}

export interface WebSocketSession {
  clientId: string;
  userId: string;
  wallet: string;
  connectedAt: number;
  lastHeartbeat: number;
  rooms: Map<string, RoomSubscription>;
  isAuthenticated: boolean;
}

export interface ConnectionMetrics {
  activeConnections: number;
  totalConnections: number;
  messagesSent: number;
  messagesReceived: number;
  avgLatency: number;
  errorCount: number;
}

export type ReconnectConfig = {
  maxRetries: number;
  initialDelay: number; // ms
  maxDelay: number; // ms
  backoffMultiplier: number;
};

export type WebSocketConfig = {
  port: number;
  heartbeatInterval: number; // ms
  heartbeatTimeout: number; // ms
  maxRoomSize: number;
  maxRoomsPerClient: number;
  reconnectConfig: ReconnectConfig;
  enableMetrics: boolean;
};

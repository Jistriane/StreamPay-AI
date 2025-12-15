/**
 * WebSocket Event Integrations
 * Trigger WebSocket events from business logic
 */

import { WebSocketManager } from "./manager";
import { WebSocketEventType, StreamEventData, PoolEventData } from "./types";
import { Logger } from "../utils/logger";

const logger = Logger.getInstance();
const wsManager = WebSocketManager.getInstance();

/**
 * Emit stream created event
 */
export const emitStreamCreated = (streamData: StreamEventData): void => {
  try {
    const roomId = `stream:${streamData.streamId}`;
    wsManager.broadcastToRoom(roomId, WebSocketEventType.STREAM_CREATED, {
      ...streamData,
      timestamp: Date.now(),
    });

    logger.info("Stream created event emitted", {
      streamId: streamData.streamId,
      roomId,
    });
  } catch (error: any) {
    logger.error("Error emitting stream created event", {
      error: error.message,
    });
  }
};

/**
 * Emit stream claimed event
 */
export const emitStreamClaimed = (streamData: StreamEventData): void => {
  try {
    const roomId = `stream:${streamData.streamId}`;
    wsManager.broadcastToRoom(roomId, WebSocketEventType.STREAM_CLAIMED, {
      ...streamData,
      timestamp: Date.now(),
    });

    // Also notify specific users
    wsManager.broadcastToUser(streamData.sender, WebSocketEventType.STREAM_CLAIMED, {
      streamId: streamData.streamId,
      claimedAmount: streamData.claimedAmount,
      timestamp: Date.now(),
    });

    logger.info("Stream claimed event emitted", {
      streamId: streamData.streamId,
      claimedAmount: streamData.claimedAmount,
    });
  } catch (error: any) {
    logger.error("Error emitting stream claimed event", {
      error: error.message,
    });
  }
};

/**
 * Emit stream paused event
 */
export const emitStreamPaused = (streamData: StreamEventData): void => {
  try {
    const roomId = `stream:${streamData.streamId}`;
    wsManager.broadcastToRoom(roomId, WebSocketEventType.STREAM_PAUSED, {
      ...streamData,
      timestamp: Date.now(),
    });

    logger.info("Stream paused event emitted", { streamId: streamData.streamId });
  } catch (error: any) {
    logger.error("Error emitting stream paused event", {
      error: error.message,
    });
  }
};

/**
 * Emit stream canceled event
 */
export const emitStreamCanceled = (streamData: StreamEventData): void => {
  try {
    const roomId = `stream:${streamData.streamId}`;
    wsManager.broadcastToRoom(roomId, WebSocketEventType.STREAM_CANCELED, {
      ...streamData,
      timestamp: Date.now(),
    });

    logger.info("Stream canceled event emitted", {
      streamId: streamData.streamId,
    });
  } catch (error: any) {
    logger.error("Error emitting stream canceled event", {
      error: error.message,
    });
  }
};

/**
 * Emit stream completed event
 */
export const emitStreamCompleted = (streamData: StreamEventData): void => {
  try {
    const roomId = `stream:${streamData.streamId}`;
    wsManager.broadcastToRoom(roomId, WebSocketEventType.STREAM_COMPLETED, {
      ...streamData,
      timestamp: Date.now(),
    });

    logger.info("Stream completed event emitted", {
      streamId: streamData.streamId,
    });
  } catch (error: any) {
    logger.error("Error emitting stream completed event", {
      error: error.message,
    });
  }
};

/**
 * Emit stream updated event (generic update)
 */
export const emitStreamUpdated = (streamData: StreamEventData): void => {
  try {
    const roomId = `stream:${streamData.streamId}`;
    wsManager.broadcastToRoom(roomId, WebSocketEventType.STREAM_UPDATED, {
      ...streamData,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    logger.error("Error emitting stream updated event", {
      error: error.message,
    });
  }
};

/**
 * Emit pool created event
 */
export const emitPoolCreated = (poolData: PoolEventData): void => {
  try {
    const roomId = `pool:${poolData.poolId}`;
    wsManager.broadcastToRoom(roomId, WebSocketEventType.POOL_CREATED, {
      ...poolData,
      timestamp: Date.now(),
    });

    // Also broadcast to all connected clients
    wsManager.broadcastToAll(WebSocketEventType.POOL_CREATED, {
      ...poolData,
      timestamp: Date.now(),
    });

    logger.info("Pool created event emitted", { poolId: poolData.poolId });
  } catch (error: any) {
    logger.error("Error emitting pool created event", {
      error: error.message,
    });
  }
};

/**
 * Emit liquidity added event
 */
export const emitLiquidityAdded = (poolData: PoolEventData): void => {
  try {
    const roomId = `pool:${poolData.poolId}`;
    wsManager.broadcastToRoom(roomId, WebSocketEventType.LIQUIDITY_ADDED, {
      ...poolData,
      timestamp: Date.now(),
    });

    logger.info("Liquidity added event emitted", {
      poolId: poolData.poolId,
      liquidityAdded: poolData.totalLiquidity,
    });
  } catch (error: any) {
    logger.error("Error emitting liquidity added event", {
      error: error.message,
    });
  }
};

/**
 * Emit liquidity removed event
 */
export const emitLiquidityRemoved = (poolData: PoolEventData): void => {
  try {
    const roomId = `pool:${poolData.poolId}`;
    wsManager.broadcastToRoom(roomId, WebSocketEventType.LIQUIDITY_REMOVED, {
      ...poolData,
      timestamp: Date.now(),
    });

    logger.info("Liquidity removed event emitted", {
      poolId: poolData.poolId,
    });
  } catch (error: any) {
    logger.error("Error emitting liquidity removed event", {
      error: error.message,
    });
  }
};

/**
 * Emit swap executed event
 */
export const emitSwapExecuted = (poolData: PoolEventData): void => {
  try {
    const roomId = `pool:${poolData.poolId}`;
    wsManager.broadcastToRoom(roomId, WebSocketEventType.POOL_SWAPPED, {
      ...poolData,
      timestamp: Date.now(),
    });

    logger.info("Swap executed event emitted", { poolId: poolData.poolId });
  } catch (error: any) {
    logger.error("Error emitting swap executed event", {
      error: error.message,
    });
  }
};

/**
 * Emit notification to user
 */
export const emitNotification = (
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    icon?: string;
    actionUrl?: string;
  }
): void => {
  try {
    wsManager.broadcastToUser(userId, WebSocketEventType.NOTIFICATION, {
      ...notification,
      timestamp: Date.now(),
    });

    logger.info("Notification emitted", { userId, type: notification.type });
  } catch (error: any) {
    logger.error("Error emitting notification", {
      error: error.message,
    });
  }
};

/**
 * Emit alert to all users
 */
export const emitAlert = (alert: {
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  actionUrl?: string;
}): void => {
  try {
    wsManager.broadcastToAll(WebSocketEventType.ALERT, {
      ...alert,
      timestamp: Date.now(),
    });

    logger.info("Alert emitted", { severity: alert.severity });
  } catch (error: any) {
    logger.error("Error emitting alert", {
      error: error.message,
    });
  }
};

/**
 * Emit price update
 */
export const emitPriceUpdate = (
  token: string,
  price: string,
  change24h: string
): void => {
  try {
    wsManager.broadcastToAll(WebSocketEventType.PRICE_UPDATE, {
      token,
      price,
      change24h,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    logger.error("Error emitting price update", {
      error: error.message,
    });
  }
};

/**
 * Emit gas price update
 */
export const emitGasPriceUpdate = (gasData: {
  network: string;
  standard: string;
  fast: string;
  fastest: string;
}): void => {
  try {
    wsManager.broadcastToAll(WebSocketEventType.GAS_PRICE_UPDATE, {
      ...gasData,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    logger.error("Error emitting gas price update", {
      error: error.message,
    });
  }
};

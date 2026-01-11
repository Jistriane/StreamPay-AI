/**
 * WebSocket Manager
 * Handles connections, rooms, and message broadcasting
 */

import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Logger } from "../utils/logger";
import {
  WebSocketEventType,
  WebSocketMessage,
  WebSocketSession,
  RoomSubscription,
  AuthenticatedUser,
  ConnectionMetrics,
  WebSocketConfig,
} from "./types";

const logger = Logger.getInstance();

export class WebSocketManager {
  private static instance: WebSocketManager;
  private io: Server | null = null;
  private sessions: Map<string, WebSocketSession> = new Map();
  private rooms: Map<string, Set<string>> = new Map(); // roomId -> clientIds
  private metrics: ConnectionMetrics = {
    activeConnections: 0,
    totalConnections: 0,
    messagesSent: 0,
    messagesReceived: 0,
    avgLatency: 0,
    errorCount: 0,
  };

  private config: WebSocketConfig = {
    port: parseInt(process.env.WEBSOCKET_PORT || "3002"),
    heartbeatInterval: 30000, // 30 seconds
    heartbeatTimeout: 60000, // 60 seconds
    maxRoomSize: 1000,
    maxRoomsPerClient: 50,
    reconnectConfig: {
      maxRetries: 5,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
    },
    enableMetrics: process.env.WEBSOCKET_METRICS === "true",
  };

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: any): void {
    if (this.io) {
      logger.warn("WebSocket server already initialized");
      return;
    }

    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      pingInterval: this.config.heartbeatInterval,
      pingTimeout: this.config.heartbeatTimeout,
    });

    this.setupEventHandlers();
    logger.info("WebSocket server initialized", { port: this.config.port });
  }

  /**
   * Setup socket.io event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket: Socket) => {
      this.onClientConnect(socket);

      socket.on("auth", (payload) => this.onAuthenticate(socket, payload));
      socket.on("subscribe", (payload) => this.onSubscribeRoom(socket, payload));
      socket.on("unsubscribe", (payload) => this.onUnsubscribeRoom(socket, payload));
      socket.on("message", (payload) => this.onMessage(socket, payload));
      socket.on("disconnect", () => this.onClientDisconnect(socket));
      socket.on("error", (error) => this.onError(socket, error));
    });

    // Heartbeat mechanism
    setInterval(() => this.checkHeartbeats(), this.config.heartbeatInterval);
  }

  /**
   * Handle client connection
   */
  private onClientConnect(socket: Socket): void {
    const clientId = socket.id;
    const session: WebSocketSession = {
      clientId,
      userId: "",
      wallet: "",
      connectedAt: Date.now(),
      lastHeartbeat: Date.now(),
      rooms: new Map(),
      isAuthenticated: false,
    };

    this.sessions.set(clientId, session);
    this.metrics.activeConnections++;
    this.metrics.totalConnections++;

    logger.info("WebSocket client connected", {
      clientId,
      activeConnections: this.metrics.activeConnections,
    });

    socket.emit("connect_success", {
      clientId,
      requiresAuth: true,
    });
  }

  /**
   * Handle authentication
   */
  private onAuthenticate(socket: Socket, payload: any): void {
    const { token, wallet } = payload;
    const session = this.sessions.get(socket.id);

    if (!session) {
      socket.emit("auth_error", { message: "Session not found" });
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secret-key"
      ) as AuthenticatedUser;

      if (decoded.wallet !== wallet) {
        throw new Error("Wallet mismatch");
      }

      session.userId = decoded.id;
      session.wallet = decoded.wallet;
      session.isAuthenticated = true;

      logger.info("WebSocket client authenticated", {
        clientId: socket.id,
        userId: decoded.id,
        wallet: decoded.wallet,
      });

      socket.emit("authenticated", {
        userId: decoded.id,
        wallet: decoded.wallet,
      });
    } catch (error: any) {
      session.isAuthenticated = false;
      logger.warn("WebSocket authentication failed", {
        clientId: socket.id,
        error: error.message,
      });
      socket.emit("auth_error", { message: error.message });
    }
  }

  /**
   * Subscribe to room
   */
  private onSubscribeRoom(socket: Socket, payload: any): void {
    const { roomId } = payload;
    const session = this.sessions.get(socket.id);

    if (!session || !session.isAuthenticated) {
      socket.emit("error", { message: "Not authenticated" });
      return;
    }

    if (session.rooms.size >= this.config.maxRoomsPerClient) {
      socket.emit("error", {
        message: `Max rooms (${this.config.maxRoomsPerClient}) reached`,
      });
      return;
    }

    // Add to socket.io room
    socket.join(roomId);

    // Track subscription
    const subscription: RoomSubscription = {
      roomId,
      userId: session.userId,
      subscribedAt: Date.now(),
    };
    session.rooms.set(roomId, subscription);

    // Update room tracking
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(socket.id);

    logger.info("Client subscribed to room", {
      clientId: socket.id,
      roomId,
      userId: session.userId,
    });

    socket.emit("subscribed", { roomId });
  }

  /**
   * Unsubscribe from room
   */
  private onUnsubscribeRoom(socket: Socket, payload: any): void {
    const { roomId } = payload;
    const session = this.sessions.get(socket.id);

    if (!session) return;

    socket.leave(roomId);
    session.rooms.delete(roomId);

    const roomSet = this.rooms.get(roomId);
    if (roomSet) {
      roomSet.delete(socket.id);
      if (roomSet.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    logger.info("Client unsubscribed from room", { roomId, clientId: socket.id });
    socket.emit("unsubscribed", { roomId });
  }

  /**
   * Handle incoming message (for bidirectional communication)
   */
  private onMessage(socket: Socket, payload: WebSocketMessage): void {
    const session = this.sessions.get(socket.id);

    if (!session || !session.isAuthenticated) {
      socket.emit("error", { message: "Not authenticated" });
      return;
    }

    this.metrics.messagesReceived++;
    logger.debug("WebSocket message received", {
      clientId: socket.id,
      event: payload.event,
    });

    // Implement custom business logic for specific events
    switch (payload.event) {
      case WebSocketEventType.CHAT_MESSAGE:
        this.handleChatMessage(socket, payload);
        break;
      case WebSocketEventType.TYPING_INDICATOR:
        this.handleTypingIndicator(socket, payload);
        break;
      default:
        logger.warn("Unknown event type", { event: payload.event });
    }
  }

  /**
   * Handle chat messages
   */
  private handleChatMessage(socket: Socket, payload: WebSocketMessage): void {
    const session = this.sessions.get(socket.id);
    if (!session) return;

    const { roomId } = payload.data;

    // Verify user is in room
    if (!session.rooms.has(roomId)) {
      socket.emit("error", { message: `Not subscribed to ${roomId}` });
      return;
    }

    const messageData = {
      ...payload.data,
      userId: session.userId,
      timestamp: Date.now(),
    };

    // Broadcast to room
    this.io?.to(roomId).emit(WebSocketEventType.CHAT_MESSAGE, messageData);
    this.metrics.messagesSent++;
  }

  /**
   * Handle typing indicators
   */
  private handleTypingIndicator(socket: Socket, payload: WebSocketMessage): void {
    const session = this.sessions.get(socket.id);
    if (!session) return;

    const { roomId } = payload.data;

    // Verify user is in room
    if (!session.rooms.has(roomId)) return;

    const indicatorData = {
      ...payload.data,
      userId: session.userId,
      timestamp: Date.now(),
    };

    // Broadcast to room (exclude sender)
    socket.to(roomId).emit(WebSocketEventType.TYPING_INDICATOR, indicatorData);
  }

  /**
   * Broadcast event to room
   */
  broadcastToRoom<T>(roomId: string, event: string, data: T): void {
    if (!this.io) return;

    const message: WebSocketMessage<T> = {
      event,
      timestamp: Date.now(),
      data,
    };

    this.io.to(roomId).emit(event, message);
    this.metrics.messagesSent++;

    logger.debug("Broadcast to room", {
      roomId,
      event,
      clientCount: this.rooms.get(roomId)?.size || 0,
    });
  }

  /**
   * Broadcast event to specific user
   */
  broadcastToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;

    const clientId = Array.from(this.sessions.entries()).find(
      ([_, session]) => session.userId === userId
    )?.[0];

    if (!clientId) return;

    const message: WebSocketMessage = {
      event,
      timestamp: Date.now(),
      data,
    };

    this.io.to(clientId).emit(event, message);
    this.metrics.messagesSent++;
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcastToAll(event: string, data: any): void {
    if (!this.io) return;

    const message: WebSocketMessage = {
      event,
      timestamp: Date.now(),
      data,
    };

    this.io.emit(event, message);
    this.metrics.messagesSent++;
  }

  /**
   * Check heartbeat status and remove stale connections
   */
  private checkHeartbeats(): void {
    const now = Date.now();
    const timeout = this.config.heartbeatTimeout;

    for (const [clientId, session] of this.sessions.entries()) {
      if (now - session.lastHeartbeat > timeout) {
        logger.warn("Heartbeat timeout", { clientId });
        this.io?.to(clientId).disconnectSockets(true);
      }
    }
  }

  /**
   * Handle disconnect
   */
  private onClientDisconnect(socket: Socket): void {
    const session = this.sessions.get(socket.id);

    if (session) {
      // Remove from all rooms
      for (const [roomId] of session.rooms) {
        const roomSet = this.rooms.get(roomId);
        if (roomSet) {
          roomSet.delete(socket.id);
          if (roomSet.size === 0) {
            this.rooms.delete(roomId);
          }
        }
      }
    }

    this.sessions.delete(socket.id);
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);

    logger.info("WebSocket client disconnected", {
      clientId: socket.id,
      activeConnections: this.metrics.activeConnections,
    });
  }

  /**
   * Handle errors
   */
  private onError(socket: Socket, error: any): void {
    this.metrics.errorCount++;
    logger.error("WebSocket error", {
      clientId: socket.id,
      error: error.message,
    });
  }

  /**
   * Get connection metrics
   */
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get active sessions count
   */
  getActiveConnections(): number {
    return this.metrics.activeConnections;
  }

  /**
   * Get room info
   */
  getRoomInfo(roomId: string): {
    roomId: string;
    clientCount: number;
    clients: string[];
  } {
    const clientIds = Array.from(this.rooms.get(roomId) || []);
    return {
      roomId,
      clientCount: clientIds.length,
      clients: clientIds,
    };
  }

  /**
   * Graceful shutdown
   */
  shutdown(): void {
    logger.info("WebSocket shutdown initiated", {
      activeConnections: this.metrics.activeConnections,
    });

    if (this.io) {
      this.io.emit("server_shutdown", {
        message: "Server is shutting down",
        timestamp: Date.now(),
      });

      setTimeout(() => {
        this.io?.close();
        logger.info("WebSocket server closed");
      }, 5000);
    }
  }
}

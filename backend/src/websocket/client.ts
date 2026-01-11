/**
 * WebSocket Client
 * Frontend client for real-time communication with backend
 */

import { io, Socket } from "socket.io-client";
import { WebSocketEventType, WebSocketMessage } from "./types";

export interface WebSocketClientConfig {
  url: string;
  token: string;
  wallet: string;
  reconnect?: boolean;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  reconnectionAttempts?: number;
}

export class WebSocketClient {
  private socket: Socket | null = null;
  private config: WebSocketClientConfig;
  private isAuthenticated: boolean = false;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts: number = 0;

  constructor(config: WebSocketClientConfig) {
    this.config = {
      reconnect: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: 5,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.url, {
          reconnection: this.config.reconnect,
          reconnectionDelay: this.config.reconnectionDelay,
          reconnectionDelayMax: this.config.reconnectionDelayMax,
          reconnectionAttempts: this.config.reconnectionAttempts,
          transports: ["websocket", "polling"],
        });

        this.socket.on("connect", () => {
          console.log("[WebSocket] Connected:", this.socket!.id);
          this.authenticate();
        });

        this.socket.on("authenticated", (data) => {
          console.log("[WebSocket] Authenticated:", data);
          this.isAuthenticated = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on("auth_error", (data) => {
          console.error("[WebSocket] Auth error:", data);
          this.isAuthenticated = false;
          reject(new Error(data.message));
        });

        this.socket.on("disconnect", () => {
          console.warn("[WebSocket] Disconnected");
          this.isAuthenticated = false;
        });

        this.socket.on("error", (error) => {
          console.error("[WebSocket] Error:", error);
          reject(error);
        });

        // Setup event listeners
        this.setupEventListeners();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Authenticate with server
   */
  private authenticate(): void {
    if (!this.socket) return;

    this.socket.emit("auth", {
      token: this.config.token,
      wallet: this.config.wallet,
    });
  }

  /**
   * Setup all event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Setup custom event listener forwarding
    this.socket.onAny((event: string, data: any) => {
      this.emit(event, data);
    });
  }

  /**
   * Subscribe to room
   */
  subscribe(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isAuthenticated) {
        reject(new Error("Not authenticated"));
        return;
      }

      this.socket.emit("subscribe", { roomId }, () => {
        console.log(`[WebSocket] Subscribed to ${roomId}`);
        resolve();
      });

      this.socket.once("subscribed", (data) => {
        if (data.roomId === roomId) {
          resolve();
        }
      });

      this.socket.once("error", (error) => {
        reject(error);
      });
    });
  }

  /**
   * Unsubscribe from room
   */
  unsubscribe(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Not connected"));
        return;
      }

      this.socket.emit("unsubscribe", { roomId }, () => {
        console.log(`[WebSocket] Unsubscribed from ${roomId}`);
        resolve();
      });

      this.socket.once("unsubscribed", (data) => {
        if (data.roomId === roomId) {
          resolve();
        }
      });

      this.socket.once("error", (error) => {
        reject(error);
      });
    });
  }

  /**
   * Send message to room
   */
  sendMessage(roomId: string, content: string): void {
    if (!this.socket || !this.isAuthenticated) {
      console.error("Not authenticated");
      return;
    }

    this.socket.emit("message", {
      event: WebSocketEventType.CHAT_MESSAGE,
      data: {
        roomId,
        content,
      },
    });
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(roomId: string, isTyping: boolean): void {
    if (!this.socket || !this.isAuthenticated) return;

    this.socket.emit("message", {
      event: WebSocketEventType.TYPING_INDICATOR,
      data: {
        roomId,
        isTyping,
      },
    });
  }

  /**
   * Listen to event
   */
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Listen to event once
   */
  once(event: string, callback: (data: any) => void): void {
    const unsubscribe = this.on(event, (data) => {
      callback(data);
      unsubscribe();
    });
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isAuthenticated = false;
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get authentication status
   */
  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | null {
    return this.socket?.id ?? null;
  }
}

/**
 * Create WebSocket client instance
 */
export function createWebSocketClient(config: WebSocketClientConfig): WebSocketClient {
  return new WebSocketClient(config);
}

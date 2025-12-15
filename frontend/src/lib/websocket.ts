/**
 * WebSocket Manager com reconnect automático
 * Garante conexão estável com ElizaOS Agent
 */

export interface WebSocketMessage {
  type: 'message' | 'update' | 'event' | 'error';
  data: any;
  timestamp?: number;
}

export interface WebSocketConfig {
  url: string;
  maxRetries?: number;
  retryDelay?: number;
  heartbeatInterval?: number;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private retryCount = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Set<(msg: WebSocketMessage) => void> = new Set();
  private errorHandlers: Set<(error: Error) => void> = new Set();
  private openHandlers: Set<() => void> = new Set();
  private closeHandlers: Set<() => void> = new Set();

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      maxRetries: config.maxRetries ?? 5,
      retryDelay: config.retryDelay ?? 3000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('✓ WebSocket conectado:', this.config.url);
          this.retryCount = 0;
          this.startHeartbeat();
          this.openHandlers.forEach((handler) => handler());
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.messageHandlers.forEach((handler) => handler(message));
          } catch (error) {
            console.error('Erro ao parsear mensagem WebSocket:', error);
          }
        };

        this.ws.onerror = (error) => {
          const wsError = new Error('Erro na conexão WebSocket');
          this.errorHandlers.forEach((handler) => handler(wsError));
          reject(wsError);
        };

        this.ws.onclose = () => {
          console.log('✗ WebSocket desconectado');
          this.stopHeartbeat();
          this.closeHandlers.forEach((handler) => handler());
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  send(data: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket não está conectado');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem WebSocket:', error);
      return false;
    }
  }

  onMessage(handler: (msg: WebSocketMessage) => void): () => void {
    this.messageHandlers.add(handler);
    // Retorna função para remover handler
    return () => this.messageHandlers.delete(handler);
  }

  onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  onOpen(handler: () => void): () => void {
    this.openHandlers.add(handler);
    return () => this.openHandlers.delete(handler);
  }

  onClose(handler: () => void): () => void {
    this.closeHandlers.add(handler);
    return () => this.closeHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private attemptReconnect(): void {
    if (this.retryCount >= this.config.maxRetries) {
      const error = new Error(
        `Falha ao conectar após ${this.config.maxRetries} tentativas`
      );
      this.errorHandlers.forEach((handler) => handler(error));
      return;
    }

    this.retryCount++;
    const delay = this.config.retryDelay * this.retryCount;
    console.log(`Tentando reconectar em ${delay}ms (${this.retryCount}/${this.config.maxRetries})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconexão falhou:', error);
      });
    }, delay);
  }
}

/**
 * Factory para criar WebSocket Manager global
 */
let globalWsManager: WebSocketManager | null = null;

export function createWebSocketManager(url: string): WebSocketManager {
  if (globalWsManager) {
    globalWsManager.disconnect();
  }

  globalWsManager = new WebSocketManager({
    url,
    maxRetries: 5,
    retryDelay: 3000,
    heartbeatInterval: 30000,
  });

  return globalWsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return globalWsManager;
}

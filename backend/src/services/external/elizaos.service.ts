import axios from 'axios';
import { logger } from '../../utils/logger';

interface ElizaMessage {
  text: string;
  userId: string;
  userName: string;
}

interface ElizaResponse {
  text: string;
  action?: string;
}

export class ElizaOSService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.ELIZAOS_BASE_URL || 'http://localhost:3001';
    this.apiKey = process.env.ELIZAOS_API_KEY || 'dev-key';
  }

  async sendMessage(message: ElizaMessage): Promise<ElizaResponse> {
    try {
      logger.info('[ElizaOS] Enviando mensagem:', message);

      const response = await axios.post<ElizaResponse>(
        `${this.baseUrl}/api/message`,
        {
          text: message.text,
          userId: message.userId,
          userName: message.userName,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeout: 30000,
        }
      );

      logger.info('[ElizaOS] Resposta recebida:', response.data);
      return response.data;
    } catch (error) {
      logger.error('[ElizaOS] Erro ao enviar mensagem:', error);
      throw new Error(
        `Falha ao consultar ElizaOS: ${error instanceof Error ? error.message : 'erro desconhecido'}`
      );
    }
  }

  async getStatus(): Promise<{ status: string; version?: string }> {
    try {
      const response = await axios.get<any>(`${this.baseUrl}/api/status`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: 10000,
      });

      return response.data || { status: 'unknown' };
    } catch (error) {
      logger.error('[ElizaOS] Erro ao obter status:', error);
      throw new Error(
        `Falha ao consultar status do ElizaOS: ${error instanceof Error ? error.message : 'erro desconhecido'}`
      );
    }
  }

  async analyzeStream(streamData: any): Promise<string> {
    try {
      const analysis = `Análise do stream: ID=${streamData.id}, Status=${streamData.active ? 'ativo' : 'inativo'}, Valor=${streamData.rate}/s`;
      logger.info('[ElizaOS] Análise gerada:', analysis);
      return analysis;
    } catch (error) {
      logger.error('[ElizaOS] Erro ao analisar stream:', error);
      throw new Error('Falha ao analisar stream');
    }
  }
}

export const elizaosService = new ElizaOSService();

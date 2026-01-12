import { logger } from '../../utils/logger';
import path from 'path';

interface ElizaMessage {
  text: string;
  userId: string;
  userName: string;
}

interface ElizaResponse {
  text: string;
  data?: any;
  action?: string;
}

export class ElizaOSService {
  // Usando 'any' para evitar problemas de tipo entre CJS e ESM
  private agent: any = null;

  constructor() {
    // Agent será inicializado lazy quando necessário
  }

  private async getAgent(userAddress?: string, authToken?: string) {
    if (!this.agent) {
      const config = {
        moralisApiKey: process.env.MORALIS_API_KEY || '',
        chainlinkRpcUrl: process.env.CHAINLINK_RPC_URL || process.env.INFURA_URL || '',
        backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
        userAddress: userAddress,
        authToken: authToken,
        network: (process.env.NETWORK as 'ethereum' | 'sepolia' | 'localhost' | 'mainnet') || 'sepolia',
      };

      // Usando o artefato de build CommonJS para evitar problemas de ESM/CJS
      // O path aponta para o JS compilado no dist
      // Carrega o bundle ESM/CJS do agente via import dinâmico para evitar conflitos de módulo
      const agentPath = path.join(__dirname, '../../../../streampay-eliza/dist/index.js');
      const { createStreamPayAgent } = await import(agentPath);
      
      this.agent = createStreamPayAgent(config);
      logger.info('[ElizaOS] StreamPayAgent inicializado via CommonJS Build');
    }
    return this.agent;
  }

  async sendMessage(message: ElizaMessage, userAddress?: string, authToken?: string): Promise<ElizaResponse> {
    try {
      logger.info('[ElizaOS] Processando mensagem:', { text: message.text, userId: message.userId });

      // Extrair userAddress do userId se for um endereço Ethereum
      const address = userAddress || (message.userId.startsWith('0x') ? message.userId : undefined);

      if (!address) {
        logger.warn('[ElizaOS] userAddress não fornecido, usando userId como fallback');
      }

      const agent = await this.getAgent(address, authToken);
      const result = await agent.processMessage(message.text, address || message.userId, authToken);

      logger.info('[ElizaOS] Resposta do agente:', {
        success: result.success,
        hasData: !!result.data,
      });

      // Formatar resposta no formato esperado pelo frontend
      return {
        text: result.response,
        data: result.data, // Já inclui pendingSignature quando necessário
        action: result.success ? 'processed' : 'error',
      };
    } catch (error) {
      logger.error('[ElizaOS] Erro ao processar mensagem:', error);
      const errorMessage = error instanceof Error ? error.message : 'erro desconhecido';
      
      // Log detalhado para debugging
      logger.error('[ElizaOS] Error details:', {
        message: message.text,
        userId: message.userId,
        userAddress,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Mensagens de erro mais específicas
      if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        return {
          text: 'Erro de conexão com os serviços. Verifique se todos os serviços estão disponíveis e tente novamente.',
          action: 'error',
        };
      }

      if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        return {
          text: 'Erro de validação. Por favor, verifique os parâmetros fornecidos e tente novamente.',
          action: 'error',
        };
      }

      return {
        text: `Desculpe, encontrei um erro ao processar sua solicitação: ${errorMessage}. Por favor, tente novamente.`,
        action: 'error',
      };
    }
  }

  async getStatus(): Promise<{ status: string; version?: string; healthy?: boolean }> {
    try {
      const agent = await this.getAgent();
      const health = await agent.getHealth();

      return {
        status: health.healthy ? 'ok' : 'degraded',
        version: '1.0.0',
        healthy: health.healthy,
      };
    } catch (error) {
      logger.error('[ElizaOS] Erro ao obter status:', error);
      return {
        status: 'error',
        version: '1.0.0',
        healthy: false,
      };
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

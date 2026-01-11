import axios from 'axios';
import { logger } from '../../utils/logger';

interface EtherscanTxResponse {
  status: '0' | '1';
  result: any;
  message: string;
}

interface GasPrice {
  SafeGasPrice: string;
  StandardGasPrice: string;
  FastGasPrice: string;
}

export class EtherscanService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.ETHERSCAN_BASE_URL || 'https://api.etherscan.io/api';
    this.apiKey = process.env.ETHERSCAN_API_KEY || '';
  }

  async getTransactionStatus(txHash: string): Promise<{ status: string; blockNumber?: string; from?: string }> {
    try {
      if (!this.apiKey) {
        logger.warn('[Etherscan] API key não configurada, retornando status fictício');
        return { status: 'success', blockNumber: '4000000' };
      }

      const response = await axios.get<EtherscanTxResponse>(this.baseUrl, {
        params: {
          module: 'transaction',
          action: 'gettxreceiptstatus',
          txhash: txHash,
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status === '1') {
        return {
          status: 'success',
          blockNumber: response.data.result?.blockNumber,
          from: response.data.result?.from,
        };
      } else {
        return { status: 'pending' };
      }
    } catch (error) {
      logger.error('[Etherscan] Erro ao verificar status de tx:', error);
      throw new Error(`Falha ao consultar Etherscan: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    }
  }

  async getGasPrice(): Promise<GasPrice> {
    try {
      if (!this.apiKey) {
        logger.warn('[Etherscan] API key não configurada, retornando gas price fictício');
        return { SafeGasPrice: '20', StandardGasPrice: '25', FastGasPrice: '30' };
      }

      const response = await axios.get<any>(this.baseUrl, {
        params: {
          module: 'gastracker',
          action: 'gasoracle',
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status === '1' && response.data.result) {
        return response.data.result;
      }
      throw new Error('Resposta inválida do Etherscan');
    } catch (error) {
      logger.error('[Etherscan] Erro ao obter gas price:', error);
      throw new Error(`Falha ao consultar gas price: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    }
  }

  async getAddressTransactions(address: string, limit: number = 10): Promise<any[]> {
    try {
      if (!this.apiKey) {
        logger.warn('[Etherscan] API key não configurada, retornando transações fictícias');
        return [];
      }

      const response = await axios.get<EtherscanTxResponse>(this.baseUrl, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: limit,
          sort: 'desc',
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status === '1' && Array.isArray(response.data.result)) {
        return response.data.result.slice(0, limit);
      }
      return [];
    } catch (error) {
      logger.error('[Etherscan] Erro ao obter transações:', error);
      return [];
    }
  }
}

export const etherscanService = new EtherscanService();

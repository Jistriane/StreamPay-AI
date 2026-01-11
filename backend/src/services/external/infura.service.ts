import axios from 'axios';
import { logger } from '../../utils/logger';

interface InfuraGasResponse {
  jsonrpc: string;
  result: {
    suggestBaseFee: string;
    gasPricePercentile: string[];
    priorityFeePercentile: string[];
  };
}

export class InfuraService {
  private rpcUrl: string;
  private projectId: string;

  constructor() {
    this.rpcUrl = process.env.INFURA_GAS_API_URL || 'https://mainnet.infura.io/v3/';
    this.projectId = process.env.INFURA_API_KEY || '';
  }

  async getGasEstimate(): Promise<{
    baseFee: string;
    priorityFee: string;
    maxGasPrice: string;
  }> {
    try {
      if (!this.projectId) {
        logger.warn('[Infura] API key não configurada, retornando gas estimate fictício');
        return {
          baseFee: '20000000000',
          priorityFee: '2000000000',
          maxGasPrice: '30000000000',
        };
      }

      const url = `${this.rpcUrl}${this.projectId}`;
      const response = await axios.post<InfuraGasResponse>(
        url,
        {
          jsonrpc: '2.0',
          method: 'eth_feeHistory',
          params: ['4', 'latest', [25, 50, 75]],
          id: 1,
        },
        { timeout: 10000 }
      );

      const result = response.data.result;
      return {
        baseFee: result.suggestBaseFee,
        priorityFee: result.priorityFeePercentile[1], // median
        maxGasPrice: (BigInt(result.suggestBaseFee) + BigInt(result.priorityFeePercentile[2])).toString(),
      };
    } catch (error) {
      logger.error('[Infura] Erro ao obter gas estimate:', error);
      throw new Error(
        `Falha ao consultar Infura: ${error instanceof Error ? error.message : 'erro desconhecido'}`
      );
    }
  }

  async getBlockNumber(): Promise<number> {
    try {
      if (!this.projectId) {
        logger.warn('[Infura] API key não configurada, retornando block number fictício');
        return 4000000;
      }

      const url = `${this.rpcUrl}${this.projectId}`;
      const response = await axios.post<any>(
        url,
        {
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        },
        { timeout: 10000 }
      );

      return parseInt(response.data.result, 16);
    } catch (error) {
      logger.error('[Infura] Erro ao obter block number:', error);
      return 0;
    }
  }

  async getTransactionCount(address: string): Promise<number> {
    try {
      if (!this.projectId) {
        logger.warn('[Infura] API key não configurada, retornando tx count fictício');
        return 0;
      }

      const url = `${this.rpcUrl}${this.projectId}`;
      const response = await axios.post<any>(
        url,
        {
          jsonrpc: '2.0',
          method: 'eth_getTransactionCount',
          params: [address, 'latest'],
          id: 1,
        },
        { timeout: 10000 }
      );

      return parseInt(response.data.result, 16);
    } catch (error) {
      logger.error('[Infura] Erro ao obter transaction count:', error);
      return 0;
    }
  }
}

export const infuraService = new InfuraService();

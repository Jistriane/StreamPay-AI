import axios from 'axios';
import { logger } from '../../utils/logger';

interface MoralisStream {
  id: string;
  receiver: string;
  token_address: string;
  balance_usd: string;
  updated_at: string;
}

interface MoralisNFT {
  token_address: string;
  token_id: string;
  name: string;
  symbol: string;
  owner_of: string;
}

export class MoralisService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.MORALIS_BASE_URL || 'https://deep-index.moralis.io/api/v2';
    this.apiKey = process.env.MORALIS_API_KEY || '';
  }

  async getStreams(address: string): Promise<MoralisStream[]> {
    try {
      if (!this.apiKey) {
        logger.warn('[Moralis] API key não configurada, retornando streams fictícios');
        return [];
      }

      const response = await axios.get<any>(`${this.baseUrl}/${address}/erc20/streams`, {
        headers: { 'X-API-Key': this.apiKey },
        params: { chain: 'eth' },
        timeout: 10000,
      });

      return response.data?.result || [];
    } catch (error) {
      logger.error('[Moralis] Erro ao obter streams:', error);
      return [];
    }
  }

  async getNFTs(address: string, chain: string = 'eth'): Promise<MoralisNFT[]> {
    try {
      if (!this.apiKey) {
        logger.warn('[Moralis] API key não configurada, retornando NFTs fictícios');
        return [];
      }

      const response = await axios.get<any>(`${this.baseUrl}/${address}/nft`, {
        headers: { 'X-API-Key': this.apiKey },
        params: { chain, limit: 100 },
        timeout: 10000,
      });

      return response.data?.result || [];
    } catch (error) {
      logger.error('[Moralis] Erro ao obter NFTs:', error);
      return [];
    }
  }

  async getTokenBalance(address: string, tokenAddress: string): Promise<string> {
    try {
      if (!this.apiKey) {
        logger.warn('[Moralis] API key não configurada, retornando saldo fictício');
        return '0';
      }

      const response = await axios.get<any>(`${this.baseUrl}/${address}/erc20/${tokenAddress}/balance`, {
        headers: { 'X-API-Key': this.apiKey },
        params: { chain: 'eth' },
        timeout: 10000,
      });

      return response.data?.balance || '0';
    } catch (error) {
      logger.error('[Moralis] Erro ao obter saldo de token:', error);
      return '0';
    }
  }

  async getNativeBalance(address: string): Promise<string> {
    try {
      if (!this.apiKey) {
        logger.warn('[Moralis] API key não configurada, retornando saldo nativo fictício');
        return '0';
      }

      const response = await axios.get<any>(`${this.baseUrl}/${address}/balance`, {
        headers: { 'X-API-Key': this.apiKey },
        params: { chain: 'eth' },
        timeout: 10000,
      });

      return response.data?.balance || '0';
    } catch (error) {
      logger.error('[Moralis] Erro ao obter saldo nativo:', error);
      return '0';
    }
  }
}

export const moralisService = new MoralisService();

/**
 * Moralis API Integration Service
 * Handles Web3 data queries (token balances, pools, transactions)
 */

import { HttpClient } from './http-client';

interface MoralisConfig {
  apiKey: string;
  chainId?: number;
  baseURL?: string;
}

interface TokenBalance {
  token_address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  usd_value: number;
}

interface PoolData {
  pool_address: string;
  token0: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  token1: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  fee: number;
  liquidity: string;
  sqrtPrice: string;
  tick: number;
}

interface SwapData {
  hash: string;
  from: string;
  to: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  blockNumber: number;
  timestamp: number;
}

export class MoralisService {
  private httpClient: HttpClient;
  private apiKey: string;
  private chainId: number;

  constructor(config: MoralisConfig) {
    this.apiKey = config.apiKey;
    this.chainId = config.chainId || 1; // Ethereum by default

    this.httpClient = new HttpClient({
      baseURL: config.baseURL || 'https://deep-index.moralis.io/api/v2.2',
      timeout: 30000,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      retry: { maxRetries: 3, delayMs: 1000, backoffMultiplier: 2 },
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    });
  }

  /**
   * Get token balances for a wallet address
   */
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      const response = await this.httpClient.get<{
        result: TokenBalance[];
      }>(
        `/${address.toLowerCase()}/erc20?chain=0x${this.chainId.toString(16)}&exclude_spam=true`
      );

      return response.result || [];
    } catch (error) {
      console.error('[Moralis] Error fetching token balances:', error);
      throw new Error(`Failed to fetch token balances for ${address}`);
    }
  }

  /**
   * Get native token (MATIC) balance for a wallet
   */
  async getNativeBalance(address: string): Promise<string> {
    try {
      const response = await this.httpClient.get<{
        balance: string;
      }>(`/${address.toLowerCase()}/balance?chain=0x${this.chainId.toString(16)}`);

      return response.balance || '0';
    } catch (error) {
      console.error('[Moralis] Error fetching native balance:', error);
      throw new Error(`Failed to fetch native balance for ${address}`);
    }
  }

  /**
   * Get total USD value of wallet
   */
  async getWalletNetWorth(address: string): Promise<number> {
    try {
      const balances = await this.getTokenBalances(address);
      const nativeBalance = await this.getNativeBalance(address);

      // Calculate total USD value
      let total = 0;

      for (const balance of balances) {
        total += balance.usd_value || 0;
      }

      // Add native token value (simplified - would need price feed in production)
      const nativeValueUsd = (Number(nativeBalance) / 1e18) * 1; // Placeholder multiplier
      total += nativeValueUsd;

      return total;
    } catch (error) {
      console.error('[Moralis] Error calculating net worth:', error);
      return 0;
    }
  }

  /**
   * Get token price
   */
  async getTokenPrice(tokenAddress: string): Promise<number> {
    try {
      const response = await this.httpClient.get<{
        usdPrice: number;
      }>(`/erc20/${tokenAddress}/price?chain=0x${this.chainId.toString(16)}`);

      return response.usdPrice || 0;
    } catch (error) {
      console.error('[Moralis] Error fetching token price:', error);
      return 0;
    }
  }

  /**
   * Get token pair address
   */
  async getPairAddress(token0: string, token1: string): Promise<string> {
    try {
      const response = await this.httpClient.get<{
        pairAddress: string;
      }>(
        `/erc20/getPair?chain=0x${this.chainId.toString(16)}&token0_address=${token0}&token1_address=${token1}`
      );

      return response.pairAddress;
    } catch (error) {
      console.error('[Moralis] Error fetching pair address:', error);
      return '';
    }
  }

  /**
   * Get DEX trades for token pair
   */
  async getDexTrades(
    token0: string,
    token1: string,
    limit = 50
  ): Promise<SwapData[]> {
    try {
      const response = await this.httpClient.get<{
        result: Array<{
          transaction_hash: string;
          from_address: string;
          to_address: string;
          token0_symbol: string;
          token1_symbol: string;
          token0_decimals: number;
          token1_decimals: number;
          amount0: string;
          amount1: string;
          block_number: number;
          block_timestamp: string;
        }>;
      }>(
        `/dex/${token0}/${token1}/trades?chain=0x${this.chainId.toString(16)}&limit=${limit}`
      );

      return (response.result || []).map((trade) => ({
        hash: trade.transaction_hash,
        from: trade.from_address,
        to: trade.to_address,
        tokenIn: token0,
        tokenOut: token1,
        amountIn: trade.amount0,
        amountOut: trade.amount1,
        blockNumber: trade.block_number,
        timestamp: new Date(trade.block_timestamp).getTime(),
      }));
    } catch (error) {
      console.error('[Moralis] Error fetching DEX trades:', error);
      return [];
    }
  }

  /**
   * Get token holders count
   */
  async getTokenHolders(tokenAddress: string): Promise<number> {
    try {
      const response = await this.httpClient.get<{
        total: number;
      }>(`/erc20/${tokenAddress}/owners?chain=0x${this.chainId.toString(16)}&limit=1`);

      return response.total || 0;
    } catch (error) {
      console.error('[Moralis] Error fetching token holders:', error);
      return 0;
    }
  }

  /**
   * Get liquidity pool reserves
   */
  async getPoolReserves(poolAddress: string): Promise<PoolData | null> {
    try {
      const response = await this.httpClient.get<{
        result: PoolData;
      }>(`/erc20/${poolAddress}?chain=0x${this.chainId.toString(16)}`);

      return response.result || null;
    } catch (error) {
      console.error('[Moralis] Error fetching pool reserves:', error);
      return null;
    }
  }

  /**
   * Check if address is contract
   */
  async isContractAddress(address: string): Promise<boolean> {
    try {
      const response = await this.httpClient.get<{
        isContract: boolean;
      }>(`/erc20/${address}?chain=0x${this.chainId.toString(16)}`);

      return response.isContract || false;
    } catch (error) {
      console.error('[Moralis] Error checking contract status:', error);
      return false;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<any | null> {
    try {
      const response = await this.httpClient.get<any>(
        `/${txHash}?chain=0x${this.chainId.toString(16)}`
      );

      return response || null;
    } catch (error) {
      console.error('[Moralis] Error fetching transaction:', error);
      return null;
    }
  }

  /**
   * Health check
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.getTokenPrice('0xdAC17F958D2ee523a2206206994597C13D831ec7'); // USDT on Ethereum
      return true;
    } catch (error) {
      console.error('[Moralis] Health check failed:', error);
      return false;
    }
  }
}

/**
 * Create Moralis service singleton
 */
export const createMoralisService = (apiKey: string): MoralisService => {
  return new MoralisService({ apiKey, chainId: 1 });
};

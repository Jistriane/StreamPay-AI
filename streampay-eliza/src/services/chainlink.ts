/**
 * Chainlink Oracle Integration Service
 * Handles price feeds and price aggregation
 */

import { HttpClient } from './http-client';

interface ChainlinkConfig {
  rpcUrl: string;
  chainId?: number;
  baseURL?: string;
}

interface PriceFeed {
  address: string;
  symbol: string;
  decimals: number;
}

interface PriceData {
  symbol: string;
  price: number;
  decimals: number;
  timestamp: number;
  confidence: number; // 0-100, percentage confidence in the price
}

/**
 * Chainlink Oracle Service for price feeds
 */
export class ChainlinkService {
  private httpClient: HttpClient;
  private rpcUrl: string;
  private chainId: number;
  private priceCache: Map<string, { price: PriceData; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 minute

  private feeds: Map<string, PriceFeed> = new Map([
    [
      'ETH/USD',
      {
        address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        symbol: 'ETH/USD',
        decimals: 8,
      },
    ],
    [
      'BTC/USD',
      {
        address: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
        symbol: 'BTC/USD',
        decimals: 8,
      },
    ],
    [
      'MATIC/USD',
      {
        address: '0x7bAC85a8a13A4BcD8abb3eB7d6b4d632c5a57676',
        symbol: 'MATIC/USD',
        decimals: 8,
      },
    ],
    [
      'USDC/USD',
      {
        address: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
        symbol: 'USDC/USD',
        decimals: 8,
      },
    ],
    [
      'DAI/USD',
      {
        address: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
        symbol: 'DAI/USD',
        decimals: 8,
      },
    ],
  ]);

  constructor(config: ChainlinkConfig) {
    this.rpcUrl = config.rpcUrl;
    this.chainId = config.chainId || 1; // Ethereum

    this.httpClient = new HttpClient({
      baseURL: config.baseURL || 'https://api.chain.link/v1',
      timeout: 30000,
      retry: { maxRetries: 3, delayMs: 1000, backoffMultiplier: 2 },
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    });
  }

  /**
   * Get price from Chainlink feed using cache
   */
  async getPrice(symbol: string): Promise<PriceData | null> {
    try {
      // Check cache first
      const cached = this.priceCache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.price;
      }

      const feed = this.feeds.get(symbol);
      if (!feed) {
        console.warn(`[Chainlink] Price feed not found for ${symbol}`);
        return null;
      }

      const priceData = await this.fetchPriceFromFeed(feed);

      // Cache result
      if (priceData) {
        this.priceCache.set(symbol, {
          price: priceData,
          timestamp: Date.now(),
        });
      }

      return priceData;
    } catch (error) {
      console.error(`[Chainlink] Error fetching price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Fetch price from specific Chainlink feed
   */
  private async fetchPriceFromFeed(feed: PriceFeed): Promise<PriceData> {
    // ABI for latestRoundData() function
    const aggregatorABI = [
      'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
    ];

    try {
      // In production, use ethers.js or web3.js to call the contract
      // For now, we'll use a simplified approach with REST API

      const response = await this.httpClient.get<{
        data: {
          id: string;
          type: string;
          attributes: {
            value: string;
            timestamp: string;
          };
        };
      }>(`/feeds/${feed.address}`);

      const priceValue = Number(response.data.attributes.value) / Math.pow(10, feed.decimals);

      return {
        symbol: feed.symbol,
        price: priceValue,
        decimals: feed.decimals,
        timestamp: new Date(response.data.attributes.timestamp).getTime(),
        confidence: 95, // Chainlink has high confidence
      };
    } catch (error) {
      console.error(`[Chainlink] Error fetching from feed ${feed.address}:`, error);

      // Return fallback with lower confidence
      return {
        symbol: feed.symbol,
        price: 0,
        decimals: feed.decimals,
        timestamp: Date.now(),
        confidence: 0,
      };
    }
  }

  /**
   * Get multiple prices at once
   */
  async getPrices(symbols: string[]): Promise<PriceData[]> {
    const promises = symbols.map((symbol) => this.getPrice(symbol));
    const results = await Promise.all(promises);
    return results.filter((price) => price !== null) as PriceData[];
  }

  /**
   * Check price deviation from expected value
   */
  async checkPriceDeviation(
    symbol: string,
    expectedPrice: number,
    maxDeviation: number = 0.1 // 10%
  ): Promise<{ isValid: boolean; deviation: number; currentPrice: number }> {
    const priceData = await this.getPrice(symbol);

    if (!priceData) {
      return {
        isValid: false,
        deviation: 100,
        currentPrice: 0,
      };
    }

    const deviation = Math.abs(priceData.price - expectedPrice) / expectedPrice;
    const isValid = deviation <= maxDeviation;

    return {
      isValid,
      deviation: deviation * 100, // As percentage
      currentPrice: priceData.price,
    };
  }

  /**
   * Calculate minimum output with price deviation check
   */
  async calculateMinOutput(
    inputAmount: number,
    inputSymbol: string,
    outputSymbol: string,
    slippage: number = 0.005 // 0.5%
  ): Promise<number> {
    const prices = await this.getPrices([inputSymbol, outputSymbol]);

    if (prices.length < 2) {
      throw new Error('Could not fetch required prices');
    }

    const inputPrice = prices.find((p) => p.symbol === inputSymbol)?.price || 0;
    const outputPrice = prices.find((p) => p.symbol === outputSymbol)?.price || 0;

    if (inputPrice === 0 || outputPrice === 0) {
      throw new Error('Invalid prices received from oracle');
    }

    // Calculate expected output
    const expectedOutput = (inputAmount * inputPrice) / outputPrice;

    // Apply slippage
    const minOutput = expectedOutput * (1 - slippage);

    return minOutput;
  }

  /**
   * Get historical price trend
   */
  async getPriceTrend(symbol: string, days: number = 7): Promise<PriceData[]> {
    const trend: PriceData[] = [];

    try {
      const response = await this.httpClient.get<{
        data: Array<{
          attributes: {
            value: string;
            timestamp: string;
          };
        }>;
      }>(`/feeds/${symbol}/historical?days=${days}`);

      for (const item of response.data) {
        const feed = this.feeds.get(symbol);
        if (feed) {
          trend.push({
            symbol,
            price: Number(item.attributes.value) / Math.pow(10, feed.decimals),
            decimals: feed.decimals,
            timestamp: new Date(item.attributes.timestamp).getTime(),
            confidence: 95,
          });
        }
      }

      return trend;
    } catch (error) {
      console.error(`[Chainlink] Error fetching price trend for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Validate price within expected range
   */
  async validatePrice(
    symbol: string,
    minExpected: number,
    maxExpected: number
  ): Promise<boolean> {
    const priceData = await this.getPrice(symbol);

    if (!priceData) {
      return false;
    }

    return priceData.price >= minExpected && priceData.price <= maxExpected;
  }

  /**
   * Health check
   */
  async isHealthy(): Promise<boolean> {
    try {
      const ethPrice = await this.getPrice('ETH/USD');
      return ethPrice !== null && ethPrice.price > 0;
    } catch (error) {
      console.error('[Chainlink] Health check failed:', error);
      return false;
    }
  }

  /**
   * Register new price feed
   */
  registerFeed(symbol: string, address: string, decimals: number = 8): void {
    this.feeds.set(symbol, { address, symbol, decimals });
  }

  /**
   * Get all registered feeds
   */
  getFeeds(): Map<string, PriceFeed> {
    return this.feeds;
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    this.priceCache.clear();
  }
}

/**
 * Create Chainlink service singleton
 */
export const createChainlinkService = (rpcUrl: string): ChainlinkService => {
  return new ChainlinkService({ rpcUrl, chainId: 1 });
};

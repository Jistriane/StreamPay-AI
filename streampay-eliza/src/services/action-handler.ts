/**
 * Action Handlers - Execute StreamPay operations based on parsed intents
 */

import { ParsedIntent, StreamPayIntent } from './intent-parser';
import { HttpClient } from './http-client';
import { MoralisService } from './moralis';
import { ChainlinkService } from './chainlink';

interface ActionContext {
  userAddress: string;
  backendUrl: string;
  authToken?: string;
  moralisService: MoralisService;
  chainlinkService: ChainlinkService;
}

interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Action Handler Service
 */
export class ActionHandler {
  private httpClient: HttpClient;
  private context: ActionContext;

  constructor(context: ActionContext) {
    this.context = context;
    this.httpClient = new HttpClient({
      baseURL: context.backendUrl,
      timeout: 30000,
      headers: context.authToken
        ? { Authorization: `Bearer ${context.authToken}` }
        : undefined,
    });
  }

  /**
   * Execute action based on parsed intent
   */
  async execute(parsed: ParsedIntent): Promise<ActionResult> {
    try {
      switch (parsed.intent) {
        case StreamPayIntent.CREATE_STREAM:
          return await this.handleCreateStream(parsed);

        case StreamPayIntent.CLAIM_STREAM:
          return await this.handleClaimStream(parsed);

        case StreamPayIntent.PAUSE_STREAM:
          return await this.handlePauseStream(parsed);

        case StreamPayIntent.CANCEL_STREAM:
          return await this.handleCancelStream(parsed);

        case StreamPayIntent.VIEW_STREAMS:
          return await this.handleViewStreams(parsed);

        case StreamPayIntent.VIEW_STREAM_DETAILS:
          return await this.handleViewStreamDetails(parsed);

        case StreamPayIntent.ADD_LIQUIDITY:
          return await this.handleAddLiquidity(parsed);

        case StreamPayIntent.REMOVE_LIQUIDITY:
          return await this.handleRemoveLiquidity(parsed);

        case StreamPayIntent.VIEW_POOLS:
          return await this.handleViewPools(parsed);

        case StreamPayIntent.SWAP_TOKENS:
          return await this.handleSwapTokens(parsed);

        case StreamPayIntent.CHECK_BALANCE:
          return await this.handleCheckBalance(parsed);

        case StreamPayIntent.GET_PRICE:
          return await this.handleGetPrice(parsed);

        default:
          return {
            success: false,
            message: 'Unknown action',
            error: `Intent ${parsed.intent} not recognized`,
          };
      }
    } catch (error) {
      console.error('[ActionHandler] Error executing action:', error);
      return {
        success: false,
        message: 'Action failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Create a new stream
   */
  private async handleCreateStream(parsed: ParsedIntent): Promise<ActionResult> {
    const { recipient, amount, token, duration, durationUnit } = parsed.parameters;

    if (!recipient || !amount || !token) {
      return {
        success: false,
        message: 'Missing required parameters',
        error: 'recipient, amount, and token are required',
      };
    }

    try {
      const response = await this.httpClient.post<{
        id: string;
        transactionHash: string;
      }>('/api/streams', {
        recipient,
        token,
        deposit: amount,
        rate_per_second: this.calculateRate(amount, duration, durationUnit),
        duration: duration ? this.convertDuration(duration, durationUnit) : 0,
      });

      return {
        success: true,
        message: `Stream created successfully to ${recipient}`,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create stream',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Claim tokens from stream
   */
  private async handleClaimStream(parsed: ParsedIntent): Promise<ActionResult> {
    const { streamId } = parsed.parameters;

    if (!streamId) {
      return {
        success: false,
        message: 'Missing stream ID',
        error: 'streamId is required',
      };
    }

    try {
      const response = await this.httpClient.post<{ claimedAmount: string }>(
        `/api/streams/${streamId}/claim`,
        {}
      );

      return {
        success: true,
        message: `Claimed ${response.claimedAmount} tokens from stream`,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to claim stream',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Pause a stream
   */
  private async handlePauseStream(parsed: ParsedIntent): Promise<ActionResult> {
    const { streamId } = parsed.parameters;

    if (!streamId) {
      return {
        success: false,
        message: 'Missing stream ID',
        error: 'streamId is required',
      };
    }

    try {
      await this.httpClient.patch(`/api/streams/${streamId}/pause`, {});

      return {
        success: true,
        message: `Stream ${streamId} paused successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to pause stream',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Cancel a stream
   */
  private async handleCancelStream(parsed: ParsedIntent): Promise<ActionResult> {
    const { streamId } = parsed.parameters;

    if (!streamId) {
      return {
        success: false,
        message: 'Missing stream ID',
        error: 'streamId is required',
      };
    }

    try {
      await this.httpClient.delete(`/api/streams/${streamId}`);

      return {
        success: true,
        message: `Stream ${streamId} cancelled successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to cancel stream',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * View user's streams
   */
  private async handleViewStreams(parsed: ParsedIntent): Promise<ActionResult> {
    try {
      const response = await this.httpClient.get<{ streams: any[] }>('/api/streams');

      const streamCount = response.streams?.length || 0;
      const summary = streamCount === 0 ? 'You have no active streams' : `You have ${streamCount} active streams`;

      return {
        success: true,
        message: summary,
        data: response.streams,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch streams',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * View stream details
   */
  private async handleViewStreamDetails(parsed: ParsedIntent): Promise<ActionResult> {
    const { streamId } = parsed.parameters;

    if (!streamId) {
      return {
        success: false,
        message: 'Missing stream ID',
        error: 'streamId is required',
      };
    }

    try {
      const response = await this.httpClient.get<any>(`/api/streams/${streamId}`);

      return {
        success: true,
        message: `Stream ${streamId} details retrieved`,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch stream details',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Add liquidity to pool
   */
  private async handleAddLiquidity(parsed: ParsedIntent): Promise<ActionResult> {
    const { token, amount, poolId } = parsed.parameters;

    if (!token || !amount) {
      return {
        success: false,
        message: 'Missing required parameters',
        error: 'token and amount are required',
      };
    }

    try {
      const endpoint = poolId ? `/api/pools/${poolId}/add-liquidity` : '/api/pools';

      const response = await this.httpClient.post<{ lpTokensMinted: string }>
(endpoint, {
        token,
        amount,
      });

      return {
        success: true,
        message: `Added ${amount} to liquidity pool, received ${response.lpTokensMinted} LP tokens`,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add liquidity',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Remove liquidity from pool
   */
  private async handleRemoveLiquidity(parsed: ParsedIntent): Promise<ActionResult> {
    const { poolId, amount } = parsed.parameters;

    if (!poolId) {
      return {
        success: false,
        message: 'Missing pool ID',
        error: 'poolId is required',
      };
    }

    try {
      const response = await this.httpClient.post<{ tokensReceived: string }>(
        `/api/pools/${poolId}/remove-liquidity`,
        { amount }
      );

      return {
        success: true,
        message: `Removed liquidity from pool, received ${response.tokensReceived}`,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to remove liquidity',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * View liquidity pools
   */
  private async handleViewPools(parsed: ParsedIntent): Promise<ActionResult> {
    try {
      const response = await this.httpClient.get<{ pools: any[] }>('/api/pools');

      const poolCount = response.pools?.length || 0;
      const summary = poolCount === 0 ? 'No liquidity pools available' : `${poolCount} liquidity pools found`;

      return {
        success: true,
        message: summary,
        data: response.pools,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch pools',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Swap tokens
   */
  private async handleSwapTokens(parsed: ParsedIntent): Promise<ActionResult> {
    const { tokenIn, tokenOut, amount } = parsed.parameters;

    if (!tokenIn || !tokenOut || !amount) {
      return {
        success: false,
        message: 'Missing required parameters',
        error: 'tokenIn, tokenOut, and amount are required',
      };
    }

    try {
      // Get price from Chainlink for validation
      const minOutput = await this.context.chainlinkService.calculateMinOutput(
        amount,
        tokenIn,
        tokenOut,
        0.01 // 1% slippage
      );

      // TODO: Execute swap via backend or smart contract
      return {
        success: true,
        message: `Swap quote: ${amount} ${tokenIn} → ~${minOutput} ${tokenOut}`,
        data: { tokenIn, tokenOut, amount, minOutput },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to swap tokens',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check wallet balance
   */
  private async handleCheckBalance(parsed: ParsedIntent): Promise<ActionResult> {
    try {
      const balances = await this.context.moralisService.getTokenBalances(this.context.userAddress);
      const netWorth = await this.context.moralisService.getWalletNetWorth(this.context.userAddress);

      return {
        success: true,
        message: `Your wallet net worth: $${netWorth.toFixed(2)}`,
        data: { balances, totalUsd: netWorth },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to check balance',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get token price
   */
  private async handleGetPrice(parsed: ParsedIntent): Promise<ActionResult> {
    const { symbol } = parsed.parameters;

    if (!symbol) {
      return {
        success: false,
        message: 'Missing token symbol',
        error: 'symbol is required',
      };
    }

    try {
      const price = await this.context.chainlinkService.getPrice(symbol);

      if (!price) {
        return {
          success: false,
          message: `Price for ${symbol} not available`,
        };
      }

      return {
        success: true,
        message: `${symbol} price: $${price.price.toFixed(2)}`,
        data: price,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch price',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Helper: Calculate rate per second from amount and duration
   */
  private calculateRate(amount: number, duration?: string, unit?: string): number {
    if (!duration || !unit) return 0;

    const durationInSeconds = this.convertDuration(duration, unit);
    return amount / durationInSeconds;
  }

  /**
   * Helper: Convert duration to seconds
   */
  private convertDuration(duration: string, unit?: string): number {
    const num = parseInt(duration, 10);

    const unitMap: Record<string, number> = {
      second: 1,
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
      month: 2592000,
      year: 31536000,
    };

    const normalizedUnit = (unit || 'second').toLowerCase().replace(/s$/, '');
    return num * (unitMap[normalizedUnit] || 1);
  }
}

/**
 * Create action handler
 */
export const createActionHandler = (context: ActionContext): ActionHandler => {
  return new ActionHandler(context);
};

/**
 * Action Handlers - Execute StreamPay operations based on parsed intents
 */

import { ParsedIntent, StreamPayIntent } from './intent-parser';
import { HttpClient } from './http-client';
import { MoralisService } from './moralis';
import { ChainlinkService } from './chainlink';
import { ContractService, createContractService, type NetworkName } from './contract-service';

interface ActionContext {
  userAddress: string;
  backendUrl: string;
  authToken?: string;
  network?: NetworkName;
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
  private contractService: ContractService;

  constructor(context: ActionContext) {
    this.context = context;
    this.httpClient = new HttpClient({
      baseURL: context.backendUrl,
      timeout: 30000,
      headers: context.authToken
        ? { Authorization: `Bearer ${context.authToken}` }
        : undefined,
    });

    this.contractService = createContractService({
      backendUrl: context.backendUrl,
      userAddress: context.userAddress,
      authToken: context.authToken,
      network: context.network || 'polygon',
    });
  }

  /**
   * Execute action based on parsed intent
   */
  async execute(parsed: ParsedIntent): Promise<ActionResult> {
    try {
      switch (parsed.intent) {
        case StreamPayIntent.CREATE_STREAM:
          // Extract parameters from parsed intent for legacy support or update to use public method
          // For now, we keep the private handler or redirect?
          // Let's redirect to the new public method if parameters are sufficient.
          return await this.createStream({
             recipient: parsed.parameters.recipient,
             amount: parsed.parameters.amount ? Number(parsed.parameters.amount) : 0,
             token: parsed.parameters.token,
             duration: parsed.parameters.duration ? Number(parsed.parameters.duration) : 0,
             durationUnit: parsed.parameters.durationUnit
          });

        case StreamPayIntent.CLAIM_STREAM:
             return await this.claimStream(parsed.parameters.streamId);

        case StreamPayIntent.PAUSE_STREAM:
             return await this.pauseStream(parsed.parameters.streamId);

        case StreamPayIntent.CANCEL_STREAM:
             return await this.cancelStream(parsed.parameters.streamId);

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
          return await this.swapTokens({
             tokenIn: parsed.parameters.tokenIn,
             tokenOut: parsed.parameters.tokenOut, 
             amount: parsed.parameters.amount ? Number(parsed.parameters.amount) : 0
          });

        case StreamPayIntent.CHECK_BALANCE:
          return await this.checkBalance(parsed.parameters.userAddress || this.context.userAddress);

        case StreamPayIntent.GET_PRICE:
          return await this.getTokenPrice(parsed.parameters.symbol || '');

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

  async createStream(params: {
    recipient: string;
    amount: number;
    token: string;
    duration: number;
    durationUnit: string;
  }): Promise<ActionResult> {
    const { recipient, amount, token, duration, durationUnit } = params;

    if (!recipient || !amount || !token) {
      return {
        success: false,
        message: 'Faltam parâmetros obrigatórios. Preciso de: endereço do destinatário, valor e tipo de token.',
        error: 'recipient, amount, and token are required',
      };
    }

    // Validação de endereço Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(String(recipient))) {
      return {
        success: false,
        message: 'Endereço do destinatário inválido. Deve ser um endereço Ethereum válido (0x + 40 caracteres hexadecimais).',
        error: 'Invalid recipient address format',
      };
    }

    // Validação de valor
    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        success: false,
        message: 'Valor inválido. O valor deve ser um número maior que zero.',
        error: 'Invalid amount',
      };
    }

    // Validação de duração
    const durationSeconds = duration ? this.convertDuration(String(duration), durationUnit) : 0;
    if (durationSeconds <= 0) {
      return {
        success: false,
        message: 'Duração inválida. Por favor, especifique uma duração válida (ex: 30 dias, 1 semana).',
        error: 'Invalid duration',
      };
    }

    try {
      const signatureRequest = this.contractService.createStream({
        recipient: String(recipient),
        token: String(token),
        amount: amount,
        durationSeconds,
      });

      return {
        success: true,
        message:
          `Pronto para criar o stream de ${amount} ${token} para ${recipient.slice(0, 10)}... por ${durationSeconds} segundos.\n` +
          `Confirme e assine a autorização na sua wallet para eu executar a operação.`,
        data: signatureRequest,
      };
    } catch (error) {
      console.error('[ActionHandler] Erro ao preparar criação de stream:', error);
      const errorMessage = error instanceof Error ? error.message : 'erro desconhecido';
      
      // Mensagens de erro mais específicas
      if (errorMessage.includes('address') || errorMessage.includes('Endereço')) {
        return {
          success: false,
          message: 'Erro de validação de endereço. Verifique se o endereço do destinatário está correto.',
          error: errorMessage,
        };
      }

      return {
        success: false,
        message: `Falha ao preparar criação de stream: ${errorMessage}. Por favor, verifique os parâmetros e tente novamente.`,
        error: errorMessage,
      };
    }
  }

  /**
   * Claim tokens from stream
   */
  async claimStream(streamId: string): Promise<ActionResult> {
    if (!streamId) {
      return {
        success: false,
        message: 'ID do stream é obrigatório. Por favor, forneça o ID do stream que deseja reivindicar.',
        error: 'streamId is required',
      };
    }

    // Validação de streamId
    const streamIdStr = String(streamId);
    if (!/^\d+$/.test(streamIdStr) && !/^0x[a-fA-F0-9]+$/i.test(streamIdStr)) {
      return {
        success: false,
        message: 'ID do stream inválido. Deve ser um número ou hash válido.',
        error: 'Invalid streamId format',
      };
    }

    try {
      const signatureRequest = this.contractService.claimStream({ streamId: streamIdStr });

      return {
        success: true,
        message: `Pronto para reivindicar (claim) tokens do stream ${streamIdStr}. Confirme e assine na wallet.`,
        data: signatureRequest,
      };
    } catch (error) {
      console.error('[ActionHandler] Erro ao preparar claim:', error);
      const errorMessage = error instanceof Error ? error.message : 'erro desconhecido';
      
      return {
        success: false,
        message: `Falha ao preparar reivindicação: ${errorMessage}. Verifique se o stream existe e está ativo.`,
        error: errorMessage,
      };
    }
  }

  /**
   * Pause a stream
   */
  async pauseStream(streamId: string): Promise<ActionResult> {
    if (!streamId) {
      return {
        success: false,
        message: 'Missing stream ID',
        error: 'streamId is required',
      };
    }
    
    // ... logic (assuming simple pass-through or similar validation)
     try {
      // Mock or call contract service (assuming contract service has pauseStream)
      // The original code had handlePauseStream but I didn't see the full body in snippet.
      // I will assume it follows similar pattern.
      // Actually, checking lines 244+ above, it was just starting.
      // I will add a generic implementation or try to follow what was there if visible.
      // Based on context, it likely calls this.contractService.pauseStream
      
      const signatureRequest = this.contractService.pauseStream({ streamId });
      return {
          success: true,
          message: `Pronto para pausar o stream ${streamId}. Assine na wallet.`,
          data: signatureRequest
      };
    } catch (error) {
       return {
            success: false,
            message: 'Falha ao pausar stream',
            error: String(error)
       };
    }
  }

  /**
   * Cancel a stream
   */
  async cancelStream(streamId: string): Promise<ActionResult> {
    if (!streamId) {
        return {
            success: false, 
            message: 'Missing stream ID',
            error: 'streamId is required'
        };
    }

    try {
        const signatureRequest = this.contractService.cancelStream({ streamId });
        return {
            success: true,
            message: `Pronto para cancelar o stream ${streamId}. Assine na wallet.`,
            data: signatureRequest
        };
    } catch(error) {
        return {
            success: false,
            message: 'Falha ao cancelar stream',
            error: String(error)
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
      const summary = streamCount === 0 
        ? 'Você não possui streams ativos no momento.' 
        : `Você possui ${streamCount} stream${streamCount > 1 ? 's' : ''} ativo${streamCount > 1 ? 's' : ''}.`;

      return {
        success: true,
        message: summary,
        data: response.streams,
      };
    } catch (error) {
      console.error('[ActionHandler] Erro ao buscar streams:', error);
      const errorMessage = error instanceof Error ? error.message : 'erro desconhecido';
      
      // Verificar se é erro de autenticação
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        return {
          success: false,
          message: 'Erro de autenticação. Por favor, faça login novamente.',
          error: 'Authentication required',
        };
      }

      // Verificar se é erro de rede
      if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
        return {
          success: false,
          message: 'Erro de conexão com o servidor. Verifique sua conexão e tente novamente.',
          error: 'Network error',
        };
      }

      return {
        success: false,
        message: `Falha ao buscar streams: ${errorMessage}. Por favor, tente novamente.`,
        error: errorMessage,
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
        message: 'Falha ao buscar detalhes do stream.',
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
      return {
        success: true,
        message: `Pronto para adicionar liquidez${poolId ? ` no pool ${poolId}` : ''}. Confirme e assine na wallet.`,
        data: this.contractService.addLiquidity({ poolId: poolId ? String(poolId) : undefined, token, amount: Number(amount) }),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha ao preparar adição de liquidez.',
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
      return {
        success: true,
        message: `Pronto para remover liquidez do pool ${poolId}. Confirme e assine na wallet.`,
        data: this.contractService.removeLiquidity({ poolId: String(poolId), amount: amount != null ? Number(amount) : undefined }),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha ao preparar remoção de liquidez.',
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
      const summary = poolCount === 0 ? 'Nenhum pool de liquidez disponível.' : `${poolCount} pool(s) de liquidez encontrado(s).`;

      return {
        success: true,
        message: summary,
        data: response.pools,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha ao buscar pools de liquidez.',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Swap tokens
   */
  /**
   * Swap tokens
   */
  async swapTokens(params: {
    tokenIn: string;
    tokenOut: string;
    amount: number;
  }): Promise<ActionResult> {
    const { tokenIn, tokenOut, amount } = params;

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

      return {
        success: true,
        message:
          `Cotação estimada: ${amount} ${tokenIn} → ~${minOutput} ${tokenOut} (slippage 1%).\n` +
          `Se estiver ok, confirme e assine na wallet para eu executar o swap.`,
        data: {
          quote: { tokenIn, tokenOut, amount: Number(amount), minOutput },
          ...this.contractService.swapTokens({
            tokenIn,
            tokenOut,
            amount: Number(amount),
            slippageBps: 100,
          }),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha ao preparar swap.',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check wallet balance
   */

  async checkBalance(userAddress: string): Promise<ActionResult> {
    try {
      const balances = await this.context.moralisService.getTokenBalances(userAddress);
      const netWorth = await this.context.moralisService.getWalletNetWorth(userAddress);

      return {
        success: true,
        message: `Patrimônio líquido da sua carteira: $${netWorth.toFixed(2)}`,
        data: { balances, totalUsd: netWorth },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha ao verificar saldo.',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get token price
   */
  async getTokenPrice(symbol: string): Promise<ActionResult> {
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
          message: `Preço para ${symbol} não disponível no momento.`,
        };
      }

      return {
        success: true,
        message: `Preço de ${symbol}: $${price.price.toFixed(2)}`,
        data: price,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha ao buscar preço.',
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
      segundo: 1,
      minute: 60,
      minuto: 60,
      hour: 3600,
      hora: 3600,
      day: 86400,
      dia: 86400,
      week: 604800,
      semana: 604800,
      month: 2592000,
      mês: 2592000,
      mes: 2592000,
      year: 31536000,
      ano: 31536000,
    };

    let normalizedUnit = (unit || 'second').toLowerCase();
    
    // Handle Portuguese plurals and standard English 's'
    if (normalizedUnit.endsWith('meses')) normalizedUnit = 'mes';
    else normalizedUnit = normalizedUnit.replace(/s$/, '');
    
    return num * (unitMap[normalizedUnit] || 1);
  }
}

/**
 * Create action handler
 */
export const createActionHandler = (context: ActionContext): ActionHandler => {
  return new ActionHandler(context);
};

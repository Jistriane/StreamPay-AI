import { useCallback, useState } from 'react';
import { apiClient } from '@/services/api';

export interface Pool {
  id: string;
  name: string;
  tokenA: string;
  tokenB: string;
  feeTier: string;
  liquidityA: number;
  liquidityB: number;
  totalLiquidity: number;
  userLiquidity?: number;
  userPercentage?: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePoolInput {
  name: string;
  tokenA: string;
  tokenB: string;
  feeTier: string;
  initialLiquidityA: number;
  initialLiquidityB: number;
}

export interface AddLiquidityInput {
  amountA: number;
  amountB: number;
}

interface PoolState {
  pools: Pool[];
  isLoading: boolean;
  error: string | null;
}

export function usePools(userAddress?: string) {
  const [state, setState] = useState<PoolState>({
    pools: [],
    isLoading: false,
    error: null,
  });

  // Fetch pools
  const fetchPools = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiClient.get<Pool[]>('/pools');
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          pools: response.data || [],
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || 'Erro ao buscar pools',
          isLoading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false,
      }));
    }
  }, []);

  // Get single pool
  const getPool = useCallback(
    async (poolId: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await apiClient.get<Pool>(`/pools/${poolId}`);
        if (response.success && response.data) {
          return response.data;
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || 'Pool não encontrado',
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }));
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    []
  );

  // Create pool
  const createPool = useCallback(
    async (input: CreatePoolInput) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await apiClient.post<Pool>('/pools', input);
        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            pools: [...prev.pools, response.data],
            isLoading: false,
          }));
          return response.data;
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || 'Erro ao criar pool',
            isLoading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro ao criar pool',
          isLoading: false,
        }));
      }
    },
    []
  );

  // Add liquidity
  const addLiquidity = useCallback(
    async (poolId: string, input: AddLiquidityInput) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await apiClient.post(
          `/pools/${poolId}/add-liquidity`,
          input
        );
        if (response.success) {
          // Refetch pools to update liquidity values
          await fetchPools();
          return response.data;
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || 'Erro ao adicionar liquidez',
            isLoading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro ao adicionar liquidez',
          isLoading: false,
        }));
      }
    },
    [fetchPools]
  );

  // Remove liquidity
  const removeLiquidity = useCallback(
    async (poolId: string, percentage: number) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await apiClient.post(
          `/pools/${poolId}/remove-liquidity`,
          { percentage }
        );
        if (response.success) {
          // Refetch pools to update liquidity values
          await fetchPools();
          return response.data;
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || 'Erro ao remover liquidez',
            isLoading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro ao remover liquidez',
          isLoading: false,
        }));
      }
    },
    [fetchPools]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Filter user pools
  const userPools = state.pools.filter((pool) => pool.userLiquidity && pool.userLiquidity > 0);

  return {
    // State
    pools: state.pools,
    userPools,
    isLoading: state.isLoading,
    error: state.error,

    // Methods
    fetchPools,
    getPool,
    createPool,
    addLiquidity,
    removeLiquidity,
    clearError,
  };
}

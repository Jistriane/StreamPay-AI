'use client';

import { useEffect, useState } from 'react';
import { usePools } from '@/hooks/usePools';
import { useAuth } from '@/hooks/useAuth';
import AddLiquidityForm from './AddLiquidityForm';
import RemoveLiquidityForm from './RemoveLiquidityForm';

type TabType = 'view' | 'add' | 'remove';

export default function PoolManager() {
  const { wallet } = useAuth();
  const { pools, userPools, isLoading, error, fetchPools, clearError } = usePools();
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('view');

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const selectedPool = pools.find((p) => p.id === selectedPoolId);

  if (!wallet) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">🔐 Conecte sua carteira para gerenciar pools</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pool List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Pools de Liquidez</h2>
              <button
                onClick={() => {
                  setActiveTab('view');
                  fetchPools();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                ↻ Atualizar
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <div className="flex justify-between items-center">
                  <span>✗ {error}</span>
                  <button
                    onClick={clearError}
                    className="text-red-700 hover:text-red-900 font-semibold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-gray-600">Carregando pools...</p>
              </div>
            ) : pools.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p>Nenhum pool disponível</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* User Pools */}
                {userPools.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-700 mb-3 uppercase">
                      ✓ Meus Pools ({userPools.length})
                    </h3>
                    <div className="space-y-2 mb-6">
                      {userPools.map((pool) => (
                        <PoolCard
                          key={pool.id}
                          pool={pool}
                          isSelected={selectedPoolId === pool.id}
                          onClick={() => {
                            setSelectedPoolId(pool.id);
                            setActiveTab('view');
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Pools */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                    Todos os Pools ({pools.length})
                  </h3>
                  <div className="space-y-2">
                    {pools.map((pool) => (
                      <PoolCard
                        key={pool.id}
                        pool={pool}
                        isSelected={selectedPoolId === pool.id}
                        onClick={() => {
                          setSelectedPoolId(pool.id);
                          setActiveTab('view');
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pool Details */}
        <div className="lg:col-span-1">
          {selectedPool ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{selectedPool.name}</h3>

              {/* Tabs */}
              <div className="flex space-x-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('view')}
                  className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'view'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  Info
                </button>
                <button
                  onClick={() => setActiveTab('add')}
                  className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'add'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setActiveTab('remove')}
                  className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'remove'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  Remover
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === 'view' && (
                  <PoolInfo pool={selectedPool} />
                )}

                {activeTab === 'add' && (
                  <AddLiquidityForm
                    poolId={selectedPool.id}
                    tokenA={selectedPool.tokenA}
                    tokenB={selectedPool.tokenB}
                    onSuccess={() => {
                      setActiveTab('view');
                      fetchPools();
                    }}
                  />
                )}

                {activeTab === 'remove' && (
                  <RemoveLiquidityForm
                    poolId={selectedPool.id}
                    tokenA={selectedPool.tokenA}
                    tokenB={selectedPool.tokenB}
                    currentBalance={selectedPool.userLiquidity || 0}
                    onSuccess={() => {
                      setActiveTab('view');
                      fetchPools();
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600 border border-gray-200">
              <p>👈 Selecione um pool para ver detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PoolCardProps {
  pool: any;
  isSelected: boolean;
  onClick: () => void;
}

function PoolCard({ pool, isSelected, onClick }: PoolCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-md border transition-all ${
        isSelected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-900">
            {pool.tokenA}/{pool.tokenB}
          </p>
          <p className="text-xs text-gray-600">{pool.name}</p>
        </div>
        <span className="text-xs font-mono text-gray-500">Fee: {pool.feeTier}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-600">Liquidez:</span>
          <p className="font-mono font-semibold text-gray-900">${pool.totalLiquidity.toFixed(2)}</p>
        </div>
        {pool.userLiquidity !== undefined && (
          <div>
            <span className="text-gray-600">Meu stake:</span>
            <p className="font-mono font-semibold text-green-700">
              {pool.userPercentage?.toFixed(2)}%
            </p>
          </div>
        )}
      </div>
    </button>
  );
}

interface PoolInfoProps {
  pool: any;
}

function PoolInfo({ pool }: PoolInfoProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Liquidez {pool.tokenA}:</span>
          <span className="font-mono font-semibold">{pool.liquidityA.toFixed(4)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Liquidez {pool.tokenB}:</span>
          <span className="font-mono font-semibold">{pool.liquidityB.toFixed(4)}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
          <span className="text-gray-600">Total:</span>
          <span className="font-mono font-semibold text-green-700">
            ${pool.totalLiquidity.toFixed(2)}
          </span>
        </div>
      </div>

      {pool.userLiquidity !== undefined && (
        <div className="bg-blue-50 rounded p-3 space-y-2 border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 uppercase">Sua Participação</p>
          <div className="flex justify-between text-sm">
            <span className="text-blue-800">Stake:</span>
            <span className="font-mono font-semibold">${pool.userLiquidity.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-blue-800">Percentual:</span>
            <span className="font-mono font-semibold">{pool.userPercentage?.toFixed(2)}%</span>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>ID: <span className="font-mono">{pool.id.slice(0, 8)}...</span></p>
        <p>Criado: {new Date(pool.created_at).toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  );
}

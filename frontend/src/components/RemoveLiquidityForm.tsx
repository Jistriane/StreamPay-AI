'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { removeLiquiditySchema, RemoveLiquidityInput } from '@/lib/validations';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/services/api';

interface RemoveLiquidityFormProps {
  poolId: string;
  tokenA: string;
  tokenB: string;
  currentBalance?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function RemoveLiquidityForm({
  poolId,
  tokenA,
  tokenB,
  currentBalance = 0,
  onSuccess,
  onError,
}: RemoveLiquidityFormProps) {
  const { authToken } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<RemoveLiquidityInput>({
    resolver: zodResolver(removeLiquiditySchema),
    defaultValues: {
      poolId,
      percentage: 50,
    },
  });

  const percentage = watch('percentage');
  const estimatedAmountA = (currentBalance * percentage) / 100;
  const estimatedAmountB = (currentBalance * percentage) / 100;

  const onSubmit = async (data: RemoveLiquidityInput) => {
    if (!authToken) {
      const msg = 'Por favor, conecte sua carteira primeiro';
      setErrorMessage(msg);
      onError?.(msg);
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await apiClient.post(
        `/pools/${poolId}/remove-liquidity`,
        {
          percentage: data.percentage,
        }
      );

      if (response.success) {
        setSuccessMessage(`✓ Liquidez removida com sucesso! TX: ${response.data?.txHash}`);
        reset();
        onSuccess?.();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const msg = response.error || 'Erro ao remover liquidez';
        setErrorMessage(msg);
        onError?.(msg);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao remover liquidez';
      console.error(msg, error);
      setErrorMessage(msg);
      onError?.(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Remover Liquidez</h2>
      <p className="text-sm text-gray-600 mb-6">
        Pool: <span className="font-mono font-semibold">{tokenA}/{tokenB}</span>
      </p>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          ✗ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Percentage */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Porcentagem a Remover
            </label>
            <span className="text-sm font-semibold text-blue-600">{percentage}%</span>
          </div>

          <input
            {...register('percentage', { valueAsNumber: true })}
            type="range"
            min="1"
            max="100"
            step="1"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />

          {errors.percentage && (
            <p className="mt-1 text-sm text-red-500">{errors.percentage.message}</p>
          )}
        </div>

        {/* Estimated Amounts */}
        <div className="bg-gray-50 rounded-md p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">Estimativa de Retorno</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{tokenA}:</span>
            <span className="font-mono font-semibold text-gray-900">
              {estimatedAmountA.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{tokenB}:</span>
            <span className="font-mono font-semibold text-gray-900">
              {estimatedAmountB.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isSubmitting ? 'Processando...' : 'Remover Liquidez'}
        </button>
      </form>

      <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200">
        <p className="text-xs text-amber-800">
          ⚠️ A remoção de liquidez pode afetar o preço. Certifique-se antes de confirmar.
        </p>
      </div>
    </div>
  );
}

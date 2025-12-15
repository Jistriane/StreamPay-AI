'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addLiquiditySchema, AddLiquidityInput } from '@/lib/validations';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/services/api';

interface AddLiquidityFormProps {
  poolId: string;
  tokenA: string;
  tokenB: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function AddLiquidityForm({
  poolId,
  tokenA,
  tokenB,
  onSuccess,
  onError,
}: AddLiquidityFormProps) {
  const { authToken } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddLiquidityInput>({
    resolver: zodResolver(addLiquiditySchema),
    defaultValues: {
      poolId,
    },
  });

  const onSubmit = async (data: AddLiquidityInput) => {
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
        `/pools/${poolId}/add-liquidity`,
        {
          amountA: data.amountA,
          amountB: data.amountB,
        }
      );

      if (response.success) {
        setSuccessMessage(`✓ Liquidez adicionada com sucesso! TX: ${response.data?.txHash}`);
        reset();
        onSuccess?.();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const msg = response.error || 'Erro ao adicionar liquidez';
        setErrorMessage(msg);
        onError?.(msg);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao adicionar liquidez';
      console.error(msg, error);
      setErrorMessage(msg);
      onError?.(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Adicionar Liquidez</h2>
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
        {/* Amount A */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade de {tokenA}
          </label>
          <input
            {...register('amountA', { valueAsNumber: false })}
            placeholder="0.00"
            type="number"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.amountA ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.amountA && (
            <p className="mt-1 text-sm text-red-500">{errors.amountA.message}</p>
          )}
        </div>

        {/* Amount B */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade de {tokenB}
          </label>
          <input
            {...register('amountB', { valueAsNumber: false })}
            placeholder="0.00"
            type="number"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.amountB ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.amountB && (
            <p className="mt-1 text-sm text-red-500">{errors.amountB.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting ? 'Processando...' : 'Adicionar Liquidez'}
        </button>
      </form>

      <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200">
        <p className="text-xs text-amber-800">
          ⚠️ Certifique-se de ter saldo suficiente de ambos os tokens antes de confirmar.
        </p>
      </div>
    </div>
  );
}

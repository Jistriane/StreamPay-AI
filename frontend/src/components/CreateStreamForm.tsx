'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStreamSchema, CreateStreamInput } from '@/lib/validations';
import { useStreams } from '@/hooks/useStreams';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from './ToastProvider';

export default function CreateStreamForm() {
  const { createStream } = useStreams();
  const { wallet } = useAuth();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStreamInput>({
    resolver: zodResolver(createStreamSchema),
    defaultValues: {
      durationUnit: 'days',
    },
  });

  const onSubmit = async (data: CreateStreamInput) => {
    if (!wallet) {
      addToast('Por favor, conecte sua carteira primeiro', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await createStream(data);
      addToast('Stream criado com sucesso!', 'success');
      reset();
    } catch (error) {
      console.error('Erro ao criar stream:', error);
      addToast(
        error instanceof Error ? error.message : 'Erro ao criar stream. Tente novamente.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Criar Stream de Pagamento</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço do Beneficiário
          </label>
          <input
            {...register('recipient')}
            placeholder="0x..."
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.recipient ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.recipient && (
            <p className="mt-1 text-sm text-red-500">{errors.recipient.message}</p>
          )}
        </div>

        {/* Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
          <select
            {...register('token')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.token ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione um token</option>
            <option value="USDC">USDC</option>
            <option value="DAI">DAI</option>
            <option value="USDT">USDT</option>
            <option value="ETH">ETH</option>
            <option value="MATIC">MATIC</option>
          </select>
          {errors.token && (
            <p className="mt-1 text-sm text-red-500">{errors.token.message}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade
          </label>
          <input
            {...register('amount', { valueAsNumber: false })}
            placeholder="0.00"
            type="number"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        {/* Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duração
            </label>
            <input
              {...register('duration', { valueAsNumber: true })}
              placeholder="30"
              type="number"
              min="1"
              max="365"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.duration && (
              <p className="mt-1 text-xs text-red-500">{errors.duration.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade
            </label>
            <select
              {...register('durationUnit')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.durationUnit ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="hours">Horas</option>
              <option value="days">Dias</option>
              <option value="weeks">Semanas</option>
              <option value="months">Meses</option>
            </select>
            {errors.durationUnit && (
              <p className="mt-1 text-xs text-red-500">{errors.durationUnit.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Criando...' : 'Criar Stream'}
        </button>
      </form>

      {/* Form Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Dicas:</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• O endereço beneficiário não pode ser seu</li>
          <li>• Duração mínima: 1 hora, máxima: 365 dias</li>
          <li>• Verifique o saldo de {wallet?.address.slice(0, 6)}...{wallet?.address.slice(-4)}</li>
          <li>• A transação será processada no Polygon</li>
        </ul>
      </div>
    </div>
  );
}

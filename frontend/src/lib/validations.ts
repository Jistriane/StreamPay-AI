import { z } from 'zod';
import { ethers } from 'ethers';

/**
 * Validações compartilhadas para o aplicativo
 * Centralizadas em um único lugar para reutilização
 */

// Validadores personalizados
export const addressValidator = z
  .string()
  .min(1, 'Endereço é obrigatório')
  .refine(
    (val) => ethers.isAddress(val),
    'Endereço Ethereum inválido'
  );

export const positiveNumberValidator = z
  .number()
  .positive('Deve ser um número positivo')
  .finite('Deve ser um número válido');

export const tokenValidator = z.enum(
  ['USDC', 'DAI', 'USDT', 'ETH', 'MATIC'],
  { errorMap: () => ({ message: 'Token inválido' }) }
);

export const durationUnitValidator = z.enum(
  ['hours', 'days', 'weeks', 'months'],
  { errorMap: () => ({ message: 'Unidade de tempo inválida' }) }
);

// Schemas para Stream
export const createStreamSchema = z.object({
  recipient: addressValidator,
  token: tokenValidator,
  amount: z
    .string()
    .min(1, 'Quantidade é obrigatória')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Quantidade deve ser um número positivo'
    )
    .transform((val) => parseFloat(val)),
  duration: z
    .number()
    .int('Duração deve ser um número inteiro')
    .min(1, 'Duração mínima é 1')
    .max(365, 'Duração máxima é 365 dias'),
  durationUnit: durationUnitValidator,
});

export type CreateStreamInput = z.infer<typeof createStreamSchema>;

export const claimStreamSchema = z.object({
  streamId: z.string().uuid('ID de stream inválido'),
});

export type ClaimStreamInput = z.infer<typeof claimStreamSchema>;

export const pauseStreamSchema = z.object({
  streamId: z.string().uuid('ID de stream inválido'),
});

export type PauseStreamInput = z.infer<typeof pauseStreamSchema>;

export const cancelStreamSchema = z.object({
  streamId: z.string().uuid('ID de stream inválido'),
});

export type CancelStreamInput = z.infer<typeof cancelStreamSchema>;

// Schemas para Pool
export const createPoolSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome do pool é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(50, 'Nome não pode exceder 50 caracteres'),
  tokenA: tokenValidator,
  tokenB: tokenValidator,
  feeTier: z.enum(['500', '3000', '10000'], {
    errorMap: () => ({ message: 'Fee tier inválido' }),
  }),
  initialLiquidityA: z
    .string()
    .min(1, 'Liquidez inicial de A é obrigatória')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Liquidez deve ser um número positivo'
    )
    .transform((val) => parseFloat(val)),
  initialLiquidityB: z
    .string()
    .min(1, 'Liquidez inicial de B é obrigatória')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Liquidez deve ser um número positivo'
    )
    .transform((val) => parseFloat(val)),
});

export type CreatePoolInput = z.infer<typeof createPoolSchema>;

export const addLiquiditySchema = z.object({
  poolId: z.string().uuid('ID de pool inválido'),
  amountA: z
    .string()
    .min(1, 'Quantidade de A é obrigatória')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Quantidade deve ser um número positivo'
    )
    .transform((val) => parseFloat(val)),
  amountB: z
    .string()
    .min(1, 'Quantidade de B é obrigatória')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Quantidade deve ser um número positivo'
    )
    .transform((val) => parseFloat(val)),
});

export type AddLiquidityInput = z.infer<typeof addLiquiditySchema>;

export const removeLiquiditySchema = z.object({
  poolId: z.string().uuid('ID de pool inválido'),
  percentage: z
    .number()
    .min(1, 'Porcentagem mínima é 1%')
    .max(100, 'Porcentagem máxima é 100%'),
});

export type RemoveLiquidityInput = z.infer<typeof removeLiquiditySchema>;

// Schemas para Chat
export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(500, 'Mensagem não pode exceder 500 caracteres'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// Helper para validar e transformar dados
export function validateAndTransform<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = Object.fromEntries(
        error.errors.map((err) => [err.path.join('.'), err.message])
      );
      return { success: false, errors };
    }
    return {
      success: false,
      errors: { general: 'Erro ao validar dados' },
    };
  }
}

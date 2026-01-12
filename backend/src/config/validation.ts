import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * Esquema de validação para variáveis de ambiente
 * Falha rápido na inicialização se houver configuração inválida
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),
  
  // Blockchain
  NETWORK: z.enum(['localhost', 'sepolia', 'ethereum', 'mainnet']).default('sepolia'),
  RPC_URL: z.string().url('RPC_URL deve ser uma URL válida').default('https://ethereum-sepolia-rpc.publicnode.com'),
  PRIVATE_KEY: z.string()
    .refine(
      (key) => key.startsWith('0x') && key.length === 66,
      'PRIVATE_KEY deve estar no formato 0x + 64 caracteres hexadecimais'
    )
    .optional(),
  
  // Smart Contracts
  STREAMPAY_CORE_ADDRESS: z.string().optional(),
  LIQUIDITY_POOL_ADDRESS: z.string().optional(),
  POOL_MANAGER_ADDRESS: z.string().optional(),
  SWAP_ROUTER_ADDRESS: z.string().optional(),
  MNEE_TOKEN_ADDRESS: z.string().optional(),
  
  // External APIs
  GEMINI_API_KEY: z.string().optional(),
  MORALIS_API_KEY: z.string().optional(),
  ETHERSCAN_API_KEY: z.string().optional(),
  INFURA_API_KEY: z.string().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  JWT_EXPIRY: z.string().default('24h'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3003'),
  
  // Feature Flags
  ENABLE_SMART_CONTRACT: z.string().transform(v => v === 'true').default('true'),
  ENABLE_GEMINI: z.string().transform(v => v === 'true').default('true'),
  ENABLE_MONITORING: z.string().transform(v => v === 'true').default('true'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | null = null;

/**
 * Valida e retorna configuração de ambiente
 * Chamado uma vez na inicialização do servidor
 */
export function validateEnv(): EnvConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  // Use safe defaults during Jest runs to avoid killing the process on missing .env
  if (process.env.NODE_ENV === 'test') {
    const testDefaults = {
      NODE_ENV: 'test',
      PORT: 3001,
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
      NETWORK: 'polygon',
      RPC_URL: 'https://example.com',
      PRIVATE_KEY: '0x' + '0'.repeat(64),
      STREAMPAY_CORE_ADDRESS: '0x' + '0'.repeat(40),
      LIQUIDITY_POOL_ADDRESS: '0x' + '0'.repeat(40),
      POOL_MANAGER_ADDRESS: '0x' + '0'.repeat(40),
      SWAP_ROUTER_ADDRESS: '0x' + '0'.repeat(40),
      MNEE_TOKEN_ADDRESS: '0x' + '0'.repeat(40),
      GEMINI_API_KEY: 'test-key',
      MORALIS_API_KEY: 'test-key',
      ETHERSCAN_API_KEY: 'test-key',
      INFURA_API_KEY: 'test-key',
      JWT_SECRET: 'test-secret-test-secret-test-secret!!',
      JWT_EXPIRY: '24h',
      CORS_ORIGIN: 'http://localhost:3003',
      ENABLE_SMART_CONTRACT: 'false',
      ENABLE_GEMINI: 'false',
      ENABLE_MONITORING: 'false',
    } as const;

    cachedConfig = envSchema.parse(testDefaults);
    return cachedConfig;
  }

  try {
    const config = envSchema.parse(process.env);
    
    logger.info('[Config] Validação de ambiente concluída com sucesso', {
      network: config.NETWORK,
      nodeEnv: config.NODE_ENV,
      port: config.PORT,
      hasPrivateKey: !!config.PRIVATE_KEY,
      hasGeminiKey: !!config.GEMINI_API_KEY,
      hasMoralisKey: !!config.MORALIS_API_KEY,
    });
    
    cachedConfig = config;
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n  ');
      
      logger.error('[Config] Erro de validação de ambiente:\n  ' + issues);
      
      console.error('\n❌ Erro de configuração:');
      console.error(issues);
      console.error('\nVerifique seu arquivo .env e as variáveis obrigatórias.');
      
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Retorna configuração validada (usa cache)
 */
export function getEnv(): EnvConfig {
  if (!cachedConfig) {
    return validateEnv();
  }
  return cachedConfig;
}

/**
 * Validações adicionais específicas do domínio
 */
export function validateBlockchainConfig(config: EnvConfig): void {
  if (config.ENABLE_SMART_CONTRACT && !config.PRIVATE_KEY) {
    logger.warn('[Config] Smart contracts habilitados mas PRIVATE_KEY não configurada. Operações on-chain falharão.');
  }

  if (config.ENABLE_GEMINI && !config.GEMINI_API_KEY) {
    logger.warn('[Config] Gemini habilitado mas GEMINI_API_KEY não configurada. Features de IA ficarão desativadas.');
  }

  if (!config.MORALIS_API_KEY && !config.ETHERSCAN_API_KEY) {
    logger.warn('[Config] Nenhuma API de blockchain configurada (Moralis ou Etherscan). Histórico de transações limitado.');
  }
}

/**
 * Retorna status de configuração para health checks
 */
export function getConfigStatus(): {
  valid: boolean;
  blockchain: boolean;
  gemini: boolean;
  databases: boolean;
} {
  const config = getEnv();
  
  return {
    valid: !!cachedConfig,
    blockchain: !!config.PRIVATE_KEY,
    gemini: !!config.GEMINI_API_KEY,
    databases: !!config.DATABASE_URL,
  };
}

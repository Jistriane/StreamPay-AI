/**
 * Smart Contracts Configuration - Backend
 * 
 * Endereços dos contratos deployados na Sepolia testnet
 * Deploy: 15/12/2025 06:05:36 UTC
 * Deployer: 0x3b598F74e735104435B450fdf3dAd565f046eA70
 * Chain ID: 11155111
 */

const polygonConfig = {
  chainId: 137,
  chainName: 'Polygon Mainnet',
  rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',

  StreamPayCore: '0x2E53DAB8B91f60B6b6163e57b9c68D025Ce0c298',
  LiquidityPool: '0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c',
  PoolManager: '0xae185cA95D0b626a554b0612777350CE3DE06bB9',
  SwapRouter: '0x07AfFa6C58999Ac0c98237d10476983A573eD368',

  // Tokens
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC.e (PoS)
  USDC_NATIVE: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC (Native)

  // Uniswap V3
  UniswapPositionManager: '0xC36442b4a4522e871399cD717ABDd847AB11fe1f',
  UniswapFactory: '0x1F98431C8aD98523631AE4a59F267346Ea31f64C',
} as const;

const mainnetConfig = {
  chainId: 1,
  chainName: 'Ethereum Mainnet',
  rpcUrl: process.env.MAINNET_RPC_URL || 'https://eth.publicnode.com',

  StreamPayCore: '0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD',
  LiquidityPool: '0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c',
  PoolManager: '0xae185cA95D0b626a554b0612777350CE3DE06bB9',
  SwapRouter: '0x07AfFa6C58999Ac0c98237d10476983A573eD368',

  // Tokens
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',

  // Uniswap V3
  UniswapPositionManager: '0xC36442b4a4522e871399cD717ABDd847AB11fe1f',
  UniswapFactory: '0x1F98431C8aD98523631AE4a59F267346Ea31f64C',
} as const;

export const CONTRACTS_CONFIG = {
  polygon: polygonConfig,
  mainnet: mainnetConfig,
  
  sepolia: {
    chainId: 11155111,
    chainName: 'Sepolia',
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    
    StreamPayCore: '0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C',
    LiquidityPool: '0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd',
    PoolManager: '0x0F71393348E7b021E64e7787956fB1e7682AB4A8',
    SwapRouter: '0x9f3d42feC59d6742CC8dC096265Aa27340C1446F',
    
    // Tokens
    // USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Native Sepolia USDC (pode estar vazio/bugado)
    USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', // Aave USDC (Mais confiável para testes)
    
    // Uniswap V3
    UniswapPositionManager: '0x1238536071E1c677A632429e3655c799b22cDA52',
    UniswapFactory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
  },
  
  localhost: {
    chainId: 31337,
    chainName: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    
    StreamPayCore: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    LiquidityPool: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    PoolManager: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    SwapRouter: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  },
} as const;

export type NetworkKey = keyof typeof CONTRACTS_CONFIG;

/**
 * Get network config based on NODE_ENV or explicit network parameter
 */
export function getNetworkConfig(network?: NetworkKey) {
  const defaultNetwork: NetworkKey = process.env.NODE_ENV === 'production' ? 'polygon' : 'localhost';
  const envNetwork = (process.env.NETWORK as NetworkKey) || undefined;
  const targetNetwork: NetworkKey = network || envNetwork || defaultNetwork;
  return CONTRACTS_CONFIG[targetNetwork];
}

/**
 * Get contract address from environment or fallback to config
 */
export function getContractAddress(contractName: string, network?: NetworkKey): string {
  // Try to get from environment first
  const envVar = `${contractName.toUpperCase()}_ADDRESS`;
  const envAddress = process.env[envVar];
  
  if (envAddress && envAddress !== '0x0000000000000000000000000000000000000000') {
    return envAddress;
  }
  
  // Fallback to config
  const config = getNetworkConfig(network);
  return config?.[contractName as keyof typeof config] as string;
}

export default CONTRACTS_CONFIG;

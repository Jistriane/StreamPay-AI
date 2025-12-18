/**
 * Smart Contracts Configuration
 * 
 * Endereços dos contratos deployados na Sepolia testnet
 * Deploy: 15/12/2025 06:05:36 UTC
 * Deployer: 0x3b598F74e735104435B450fdf3dAd565f046eA70
 * Chain ID: 11155111
 */

export const CONTRACTS = {
  sepolia: {
    chainId: 11155111,
    chainName: 'Sepolia',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    blockExplorer: 'https://sepolia.etherscan.io',
    
    contracts: {
      StreamPayCore: {
        address: '0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C',
        explorerUrl: 'https://sepolia.etherscan.io/address/0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C',
      },
      LiquidityPool: {
        address: '0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd',
        explorerUrl: 'https://sepolia.etherscan.io/address/0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd',
      },
      PoolManager: {
        address: '0x0F71393348E7b021E64e7787956fB1e7682AB4A8',
        explorerUrl: 'https://sepolia.etherscan.io/address/0x0F71393348E7b021E64e7787956fB1e7682AB4A8',
      },
      SwapRouter: {
        address: '0x9f3d42feC59d6742CC8dC096265Aa27340C1446F',
        explorerUrl: 'https://sepolia.etherscan.io/address/0x9f3d42feC59d6742CC8dC096265Aa27340C1446F',
      },
    },
    
    tokens: {
      USDC: {
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        symbol: 'USDC',
        decimals: 6,
        explorerUrl: 'https://sepolia.etherscan.io/token/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      },
    },
    
    uniswap: {
      positionManager: '0x1238536071E1c677A632429e3655c799b22cDA52',
      factory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
    },
  },
  
  localhost: {
    chainId: 31337,
    chainName: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    
    contracts: {
      StreamPayCore: {
        address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
      },
      LiquidityPool: {
        address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
      },
      PoolManager: {
        address: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
      },
      SwapRouter: {
        address: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
      },
    },
  },
} as const;

/**
 * Get contract configuration based on chain ID
 */
export function getContractConfig(chainId: number) {
  if (chainId === 11155111) return CONTRACTS.sepolia;
  if (chainId === 31337) return CONTRACTS.localhost;
  
  throw new Error(`Unsupported chain ID: ${chainId}`);
}

/**
 * Get contract address by name and chain ID
 */
export function getContractAddress(
  contractName: keyof typeof CONTRACTS.sepolia.contracts,
  chainId: number
): string {
  const config = getContractConfig(chainId);
  return config.contracts[contractName].address;
}

/**
 * Default chain ID (Sepolia for development/testing)
 */
export const DEFAULT_CHAIN_ID = 11155111;

/**
 * Supported chain IDs
 */
export const SUPPORTED_CHAINS = [11155111, 31337] as const;

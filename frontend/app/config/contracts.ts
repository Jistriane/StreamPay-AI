/**
 * Smart Contracts Configuration
 * 
 * Endereços dos contratos deployados em Mainnet e Sepolia
 * Deploy: 15/12/2025 06:05:36 UTC
 * Deployer: 0x3b598F74e735104435B450fdf3dAd565f046eA70
 * Chain IDs: Mainnet (1), Sepolia (11155111)
 */
/**
 * Default chain ID (Polygon Mainnet)
 */
export const DEFAULT_CHAIN_ID = 137;

/**
 * Supported chain IDs
 */
export const SUPPORTED_CHAINS = [137, 1, 11155111, 31337] as const;
      StreamPayCore: {
        address: '0x2E53DAB8B91f60B6b6163e57b9c68D025Ce0c298',
        explorerUrl: 'https://polygonscan.com/address/0x2E53DAB8B91f60B6b6163e57b9c68D025Ce0c298',
      },
      LiquidityPool: {
        address: '0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c',
        explorerUrl: 'https://polygonscan.com/address/0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c',
      },
      PoolManager: {
        address: '0xae185cA95D0b626a554b0612777350CE3DE06bB9',
        explorerUrl: 'https://polygonscan.com/address/0xae185cA95D0b626a554b0612777350CE3DE06bB9',
      },
      SwapRouter: {
        address: '0x07AfFa6C58999Ac0c98237d10476983A573eD368',
        explorerUrl: 'https://polygonscan.com/address/0x07AfFa6C58999Ac0c98237d10476983A573eD368',
      },
    },

    tokens: {
      USDC: {
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        symbol: 'USDC',
        decimals: 6,
        explorerUrl: 'https://polygonscan.com/token/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      },
    },

    uniswap: {
      positionManager: '0xC36442b4a4522e871399cD717ABDd847AB11fe1f',
      factory: '0x1F98431C8aD98523631AE4a59F267346Ea31f64C',
    },
  },

  mainnet: {
    chainId: 1,
    chainName: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.publicnode.com',
    blockExplorer: 'https://etherscan.io',
    
    contracts: {
      StreamPayCore: {
        address: '0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD',
        explorerUrl: 'https://etherscan.io/address/0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD',
      },
      LiquidityPool: {
        address: '0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c',
        explorerUrl: 'https://etherscan.io/address/0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c',
      },
      PoolManager: {
        address: '0xae185cA95D0b626a554b0612777350CE3DE06bB9',
        explorerUrl: 'https://etherscan.io/address/0xae185cA95D0b626a554b0612777350CE3DE06bB9',
      },
      SwapRouter: {
        address: '0x07AfFa6C58999Ac0c98237d10476983A573eD368',
        explorerUrl: 'https://etherscan.io/address/0x07AfFa6C58999Ac0c98237d10476983A573eD368',
      },
    },
    
    tokens: {
      USDC: {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        decimals: 6,
        explorerUrl: 'https://etherscan.io/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
    },
    
    uniswap: {
      positionManager: '0xC36442b4a4522e871399cD717ABDd847AB11fe1f',
      factory: '0x1F98431C8aD98523631AE4a59F267346Ea31f64C',
    },
  },

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
  if (chainId === 137) return CONTRACTS.polygon;
  if (chainId === 1) return CONTRACTS.mainnet;
  if (chainId === 11155111) return CONTRACTS.sepolia;
  if (chainId === 31337) return CONTRACTS.localhost;
  
  throw new Error(`Unsupported chain ID: ${chainId}. Supported: Mainnet (1), Sepolia (11155111), Localhost (31337)`);
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
 * Default chain ID (Mainnet)
 */
export const DEFAULT_CHAIN_ID = 1;

/**
 * Supported chain IDs
 */
export const DEFAULT_CHAIN_ID = 137;

/**
 * Supported chain IDs
 */
export const SUPPORTED_CHAINS = [137, 1, 11155111, 31337] as const;

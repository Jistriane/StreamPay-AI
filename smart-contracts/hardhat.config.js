import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        enabled: process.env.FORKING === "true",
        url: process.env.MAINNET_RPC_URL || "",
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
      chainId: 1,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    polygon_mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.POLYGON_MUMBAI_PRIVATE_KEY ? [process.env.POLYGON_MUMBAI_PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: "auto",
    },
    polygon_mainnet: {
      url: process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.POLYGON_MAINNET_PRIVATE_KEY ? [process.env.POLYGON_MAINNET_PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: "auto",
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: "auto",
    },
    arbitrum_sepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: process.env.ARBITRUM_SEPOLIA_PRIVATE_KEY ? [process.env.ARBITRUM_SEPOLIA_PRIVATE_KEY] : [],
      chainId: 421614,
    },
    optimism_sepolia: {
      url: process.env.OPTIMISM_SEPOLIA_RPC_URL || "https://sepolia.optimism.io",
      accounts: process.env.OPTIMISM_SEPOLIA_PRIVATE_KEY ? [process.env.OPTIMISM_SEPOLIA_PRIVATE_KEY] : [],
      chainId: 11155420,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    excludeContracts: [],
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
      optimisticEthereum: process.env.OPTIMISMSCAN_API_KEY || "",
      optimismSepolia: process.env.OPTIMISMSCAN_API_KEY || "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 200000,
  },
};

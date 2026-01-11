# 📋 Contract Addresses - Quick Reference

**Last updated**: January 11, 2026  
**Network**: Sepolia Testnet & Polygon Mainnet

---

## 🌐 Polygon Mainnet (Chain ID: 137)

### StreamPayCore
- **Address**: `0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD`
- **Polygonscan**: https://polygonscan.com/address/0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD
- **Function**: Core payment streaming system

### LiquidityPool
- **Address**: `0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c`
- **Polygonscan**: https://polygonscan.com/address/0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c
- **Function**: AMM pool with 0.3% fee

### PoolManager
- **Address**: `0xae185cA95D0b626a554b0612777350CE3DE06bB9`
- **Polygonscan**: https://polygonscan.com/address/0xae185cA95D0b626a554b0612777350CE3DE06bB9
- **Function**: Uniswap V3 position management
- **Deploy Date**: January 11, 2026

### SwapRouter
- **Address**: `0x07AfFa6C58999Ac0c98237d10476983A573eD368`
- **Polygonscan**: https://polygonscan.com/address/0x07AfFa6C58999Ac0c98237d10476983A573eD368
- **Function**: Swap routing between pools

### USDC (Polygon Mainnet)
- **Address**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **Polygonscan**: https://polygonscan.com/token/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
- **Decimals**: 6
- **Symbol**: USDC

---

## 🔵 Sepolia Testnet (Chain ID: 11155111)

**Last updated**: December 15, 2025

### StreamPayCore
- **Address**: `0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C`
- **Etherscan**: https://sepolia.etherscan.io/address/0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C
- **Function**: Core payment streaming system

### LiquidityPool
- **Address**: `0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd`
- **Etherscan**: https://sepolia.etherscan.io/address/0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd
- **Function**: AMM pool with 0.3% fee

### PoolManager
- **Address**: `0x0F71393348E7b021E64e7787956fB1e7682AB4A8`
- **Etherscan**: https://sepolia.etherscan.io/address/0x0F71393348E7b021E64e7787956fB1e7682AB4A8
- **Function**: Uniswap V3 position management

### SwapRouter
- **Address**: `0x9f3d42feC59d6742CC8dC096265Aa27340C1446F`
- **Etherscan**: https://sepolia.etherscan.io/address/0x9f3d42feC59d6742CC8dC096265Aa27340C1446F
- **Function**: Swap routing between pools

---

## 💰 Tokens

### USDC (Sepolia)
- **Address**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **Etherscan**: https://sepolia.etherscan.io/token/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
- **Decimals**: 6
- **Symbol**: USDC

---

## 🦄 Uniswap V3 (Sepolia)

### Position Manager
- **Address**: `0x1238536071E1c677A632429e3655c799b22cDA52`

### Factory
- **Address**: `0x0227628f3F023bb0B980b67D528571c95c6DaC1c`

---

## 📊 Deploy Information

- **Deployer**: `0x3b598F74e735104435B450fdf3dAd565f046eA70`
- **Date**: 12/15/2025 06:05:36 UTC
- **File**: `smart-contracts/deployments/sepolia-1765778736884.json`
- **Cost**: ~0.04 ETH (gas)
- **Remaining Balance**: ~2.00 SepoliaETH

---

## 🔧 How to Use

### Frontend (.env)
```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_STREAM_PAY_CORE_ADDRESS=0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C
NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS=0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd
NEXT_PUBLIC_POOL_MANAGER_ADDRESS=0x0F71393348E7b021E64e7787956fB1e7682AB4A8
NEXT_PUBLIC_SWAP_ROUTER_ADDRESS=0x9f3d42feC59d6742CC8dC096265Aa27340C1446F
NEXT_PUBLIC_TOKEN_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

### Backend (.env)
```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
STREAM_PAY_CORE_ADDRESS=0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C
LIQUIDITY_POOL_ADDRESS=0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd
POOL_MANAGER_ADDRESS=0x0F71393348E7b021E64e7787956fB1e7682AB4A8
SWAP_ROUTER_ADDRESS=0x9f3d42feC59d6742CC8dC096265Aa27340C1446F
```

### TypeScript (Import configuration)
```typescript
// Frontend
import { CONTRACTS, getContractAddress } from '@/app/config/contracts';

const streamPayCore = CONTRACTS.sepolia.contracts.StreamPayCore.address;
// or
const address = getContractAddress('StreamPayCore', 11155111);
```

```typescript
// Backend
import { getContractAddress, getNetworkConfig } from './config/contracts';

const config = getNetworkConfig('sepolia');
const streamPayCore = getContractAddress('StreamPayCore', 'sepolia');
```

---

## 🔗 Useful Links

- **Sepolia Faucet (Alchemy)**: https://www.alchemy.com/faucets/ethereum-sepolia
- **Sepolia Faucet (QuickNode)**: https://faucet.quicknode.com/ethereum/sepolia
- **Sepolia Explorer**: https://sepolia.etherscan.io
- **USDC Sepolia Faucet**: https://faucet.circle.com/

---

## 📝 Notes

1. ✅ All contracts deployed successfully
2. ✅ Contracts verified locally
3. ⏳ Etherscan verification pending (API v2 migration)
4. ✅ ABIs available in `smart-contracts/artifacts/`
5. ✅ TypeChain types generated in `smart-contracts/typechain-types/`

---

## 🚨 Next Steps

1. [ ] Update frontend `.env` with new addresses
2. [ ] Update backend `.env` with new addresses
3. [ ] Test frontend-contract integration
4. [ ] Verify contracts on Etherscan (manual or API v2)
5. [ ] Configure monitoring and alerts
6. [ ] Deploy frontend/backend to production

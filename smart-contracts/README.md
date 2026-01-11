
# StreamPay Smart Contracts

## Overview

StreamPay smart contracts implement the logic for continuous payments (streaming), compliance, liquidity, and ERC20 token integration. Developed in Solidity, they are audited, tested, and ready for deployment on mainnet/testnet.

## Project Structure

- `contracts/` — Main contracts (StreamPayCore, ERC20Mock, etc)
- `migrations/` — Deployment and migration scripts
- `__tests__/` — Automated unit and integration tests
- `docs/` — Technical documentation for contracts
- `coverage/` — Test coverage reports

## Main Features

- **StreamPayCore:** Streaming payment logic, flow control, status, events
- **ERC20Mock:** Test token for payment simulation
- **Compliance:** KYC/AML validation, backend integration
- **Liquidity:** Support for swaps, pools, and Uniswap V3 integration
- **Events:** Event emission for monitoring and automation

## Automated Tests

- Unit tests for critical functions (creation, finalization, stream queries)
- Integration tests with backend and frontend
- Full branch coverage, error scenarios, and edge cases
- Coverage reports available at `coverage/lcov-report/index.html`

## Security and Auditing

- Input and output validation
- Protection against reentrancy, overflow, common attacks
- Code auditing and automated tests

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Compile contracts:
   ```bash
   npx hardhat compile
   ```
3. Run automated tests:
   ```bash
   npx hardhat test
   ```
4. Access the coverage report at `coverage/lcov-report/index.html`

## Deployment and Production

- Deployment scripts ready for mainnet/testnet
- Integration with backend and frontend
- Dockerfile for build automation

### Live Deployments

| Network | Chain ID | StreamPayCore | LiquidityPool | PoolManager | SwapRouter | Explorer | Records |
|---------|----------|---------------|---------------|-------------|------------|----------|---------|
| Polygon Mainnet | 137 | `0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD` | `0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c` | `0xae185cA95D0b626a554b0612777350CE3DE06bB9` | `0x07AfFa6C58999Ac0c98237d10476983A573eD368` | https://polygonscan.com | [smart-contracts/deployments/polygon_mainnet-1768119533450.json](smart-contracts/deployments/polygon_mainnet-1768119533450.json), [smart-contracts/deployments/polygon-poolmanager-1768120845394.json](smart-contracts/deployments/polygon-poolmanager-1768120845394.json) |
| Sepolia Testnet | 11155111 | `0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C` | `0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd` | `0x0F71393348E7b021E64e7787956fB1e7682AB4A8` | `0x9f3d42feC59d6742CC8dC096265Aa27340C1446F` | https://sepolia.etherscan.io | [smart-contracts/deployments/sepolia-1765778736884.json](smart-contracts/deployments/sepolia-1765778736884.json) |

Full reference in [DEPLOYED_CONTRACTS.md](../DEPLOYED_CONTRACTS.md).

## References

- [Solidity](https://soliditylang.org/)
- [Hardhat](https://hardhat.org/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Uniswap V3](https://uniswap.org/)

## Roadmap

See the project roadmap for future steps, audits, and advanced integrations.

---

For questions, suggestions, or contributions, see the technical documentation or contact the development team.

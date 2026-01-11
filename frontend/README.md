
# StreamPay Frontend

## Overview

StreamPay is a continuous payment (streaming) platform with Web3 integration, AI, monitoring, compliance, and automation, ready for production/mainnet. This frontend is built with Next.js 14 + TypeScript, focusing on modularity, automated tests, accessibility, and real integration with backend, smart contracts, and external providers.

## Project Structure

- `app/` — Main pages (dashboard, registration, history, compliance, monitoring, settings, login, stream details)
- `__tests__/` — Automated integration tests, full branch coverage, error, network, and null data scenarios
- `public/` — Static assets
- `styles/` — Global and component styles
- `components/` — Reusable components
- `coverage/` — Test coverage reports

## Main Features

- **Dashboard:** Dynamic stream listing, status, AI for insights and recommendations
- **Registration:** Creation of new streams, data validation, error feedback
- **History:** Query finished streams, full details
- **Compliance:** KYC status, rejection reasons, provider integration
- **Monitoring:** Service status, alerts, automation, observability
- **Settings:** Profile editing, validation, success/error feedback
- **Login:** Secure authentication, error feedback, backend integration
- **Stream Details:** Detailed view, status, transaction history

## Automated Tests

- Full coverage of statements, functions, lines, and branches in critical files
- Integration tests for all scenarios: success, API error, network error, null data, empty fields
- Jest/Babel environment configured for ESModules, polyfills applied, global mocks for Web3 dependencies
- Coverage reports available at `coverage/lcov-report/index.html`

## Monitoring and Automation

- Service monitoring, real-time alerts, backend integration
- Automated deployment, CI/CD, Docker, environment variables
- Dynamic notifications and user feedback

## Security and Compliance

- Real integration with KYC/AML providers
- Data validation, error feedback, detailed status
- Automated tests for compliance scenarios

## Accessibility and Responsiveness

- Accessibility tests with jest-axe
- Responsive layout, adaptive components
- Visual and textual feedback for all states

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Run automated tests:
   ```bash
   npm run test -- --coverage
   ```
4. Access the coverage report at `coverage/lcov-report/index.html`

## Environment Variables

Configure variables in `.env.local` according to the providers used (API, Web3, SMTP, etc).

## Deployments

| Network | Chain ID | StreamPayCore | LiquidityPool | PoolManager | SwapRouter | Explorer |
|---------|----------|---------------|---------------|-------------|------------|----------|
| Polygon Mainnet | 137 | `0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD` | `0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c` | `0xae185cA95D0b626a554b0612777350CE3DE06bB9` | `0x07AfFa6C58999Ac0c98237d10476983A573eD368` | https://polygonscan.com |
| Sepolia Testnet | 11155111 | `0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C` | `0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd` | `0x0F71393348E7b021E64e7787956fB1e7682AB4A8` | `0x9f3d42feC59d6742CC8dC096265Aa27340C1446F` | https://sepolia.etherscan.io |

Set `NEXT_PUBLIC_*` variables using the addresses above. Details in [DEPLOYED_CONTRACTS.md](DEPLOYED_CONTRACTS.md).

## Deployment and Production

- Dockerfile ready for build and deployment
- CI/CD configured for automation
- Ready for mainnet/testnet

## References

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [wagmi](https://wagmi.sh/)
- [Moralis](https://moralis.io/)
- [Etherscan](https://etherscan.io/)
- [Infura](https://infura.io/)
- [ElizaOS](https://elizaos.com/)

## Roadmap

See the project roadmap for future steps and advanced integrations.

---

For questions, suggestions, or contributions, check the technical documentation or contact the engineering team.

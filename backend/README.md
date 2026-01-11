
# StreamPay Backend

## Overview

The StreamPay backend orchestrates Web3 integrations, payment automation, monitoring, compliance, notifications, and security. Built with Node.js + TypeScript, it integrates external APIs, smart contracts, databases, and compliance providers, ready for production/mainnet.

## Project Structure

- `src/` — Main source code (controllers, services, routes, middlewares)
- `__tests__/` — Automated integration and unit tests
- `docs/` — Technical and API documentation
- `scripts/` — Automation, deployment, and maintenance scripts
- `coverage/` — Test coverage reports

## Main Features

- **RESTful API:** Endpoints for registration, streams, history, compliance, monitoring, notifications, authentication
- **Web3 Integration:** Communication with smart contracts, providers (Infura, Moralis, Etherscan)
- **Automation:** Scheduled jobs, event monitoring, automatic notifications
- **Compliance:** KYC/AML validation, provider integration, detailed status
- **Monitoring:** Service status, logs, alerts, metrics
- **Notifications:** Email sending, webhooks, SMTP integration
- **Security:** JWT authentication, data validation, protection against common attacks

## Automated Tests

- Integration tests for all endpoints and critical flows
- Coverage for success, error, invalid data, authentication scenarios
- Coverage reports available at `coverage/lcov-report/index.html`

## Monitoring and Automation

- Scheduled jobs for stream, compliance, and liquidity monitoring
- Automatic alerts for failures, critical events, and service status
- Integration with ElizaOS for agent automation

## Security and Compliance

- Input and output data validation
- JWT authentication, route protection
- Real integration with KYC/AML providers
- Operation logs and auditing

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env`
3. Start the server:
   ```bash
   npm run dev
   ```
4. Run automated tests:
   ```bash
   npm run test -- --coverage
   ```
5. Access the coverage report at `coverage/lcov-report/index.html`

## Environment Variables

Configure variables in `.env` for:
- Web3 providers (Infura, Moralis, Etherscan)
- SMTP for notifications
- Database (Postgres)
- JWT authentication keys
- Compliance providers

## Deployments

| Network | Chain ID | StreamPayCore | LiquidityPool | PoolManager | SwapRouter | Explorer |
|---------|----------|---------------|---------------|-------------|------------|----------|
| Polygon Mainnet | 137 | `0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD` | `0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c` | `0xae185cA95D0b626a554b0612777350CE3DE06bB9` | `0x07AfFa6C58999Ac0c98237d10476983A573eD368` | https://polygonscan.com |
| Sepolia Testnet | 11155111 | `0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C` | `0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd` | `0x0F71393348E7b021E64e7787956fB1e7682AB4A8` | `0x9f3d42feC59d6742CC8dC096265Aa27340C1446F` | https://sepolia.etherscan.io |

Refer to [DEPLOYED_CONTRACTS.md](DEPLOYED_CONTRACTS.md) for tokens, notes, and verification status.

## Deployment and Production

- Dockerfile ready for build and deployment
- CI/CD configured for automation
- Ready for mainnet/testnet

## References

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [Jest](https://jestjs.io/)
- [ElizaOS](https://elizaos.com/)
- [Moralis](https://moralis.io/)
- [Etherscan](https://etherscan.io/)
- [Infura](https://infura.io/)

## Roadmap

See the project roadmap for future steps and advanced integrations.

---

For questions, suggestions, or contributions, review the technical documentation or contact the engineering team.

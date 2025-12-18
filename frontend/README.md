
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

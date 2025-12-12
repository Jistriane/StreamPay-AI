

# StreamPay AI - MVP

<p align="center">
	<img src="docs/StreamPay AI.png" alt="Dashboard do StreamPay AI com navegação, chat do assistente e status da carteira conectada" width="960" />
</p>

## Overview
StreamPay is a streaming payment system for freelancers, using ERC20, Uniswap V3, Moralis, Chainlink, and a modular architecture ready for compliance (KYC/LGPD).

## Quick Links
- [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
- [Roadmap](docs/roadmap.md)

### Project Structure
- `frontend/`: Next.js 14 + TypeScript, Web3 integration, dashboard, AI interface.
- `scripts/`: Automation, deployment, and test scripts.

## Technical Acceptance Criteria
- Functional MVP on testnet.

## Main Flows
- **Automated Notifications:** Receive alerts and notifications for events and compliance status.

// Connect wallet (frontend)
import { useConnect } from 'wagmi';

// Query streams (API)
fetch('/api/streams')
  .then(res => res.json())
  .then(data => console.log(data));
```

## API Endpoints
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT
## Deployment & Environment
1. Clone the repository and install dependencies:
	git clone <repo-url>
	cd StreamPay
	npm install
2. Configure environment variables in `.env.example` (copy to `.env`):
	- SMTP (notifications)
	- Database (Postgres)
	- JWT keys
	- Compliance providers
	```bash
	npm run test -- --coverage
## Security Best Practices
- Always use HTTPS in production.
- Store secrets and keys securely (never commit `.env` files).
- Enable JWT authentication for all protected routes.
- Validate all user input (backend and frontend).
- Keep dependencies up to date.

## Example API Payloads
### Register User
Request:
```json
{
	"name": "Alice",
	"email": "alice@example.com",
	"password": "securePassword123"
}
```
Response:
```json
{
	"success": true,
	"userId": "0x123...abc"
}
```

### Create Stream
Request:
```json
{
	"recipient": "0x456...def",
	"amount": 50,
	"token": "USDC",
	"duration": 3600
}
```
Response:
```json
{
	"success": true,
	"streamId": "0x789...xyz"
}
```

## Main Process Flow (Textual)
1. User connects wallet via dashboard.
2. User registers or logs in.
3. User creates a new payment stream (form submission).
4. Backend validates, interacts with smart contract, emits event.
5. Frontend updates dashboard with real-time stream status.
6. Compliance checks run in background (KYC/AML).
7. Notifications sent for status changes, compliance, or errors.


## How to Contribute
1. Fork the repository and create a new branch.
2. Make your changes with clear commit messages.
3. Ensure all tests pass (`npm run test`).
4. Open a pull request describing your changes and motivation.
5. Follow the code style and documentation standards.

## Architecture
StreamPay is designed as a modular, scalable, and secure platform for streaming payments. The architecture is divided into:

### 1. Frontend (Next.js 14 + TypeScript)
- Dashboard, registration, history, compliance, monitoring, settings, login, stream details
- Wallet integration (wagmi, viem)
- Glassmorphism UI, neon effects, responsive design
- English interface, accessibility, real-time updates

### 2. Backend (Node.js + TypeScript)
- RESTful API for user, stream, compliance, monitoring, notification endpoints
- JWT authentication, input validation, error handling
- Orchestration of smart contract interactions and compliance checks
- Scheduled jobs for monitoring and notifications
- JSON persistence fallback for user data

### 3. Smart Contracts (Solidity 0.8.20)
- StreamPayCore: streaming payment logic, event emission, compliance hooks
- ERC20Mock: test token for development
- Integration with Uniswap V3 (liquidity/swaps) and Chainlink (price feeds)
- Security: reentrancy guard, input validation

### 4. Infrastructure
- Docker/Docker Compose for containerization
- Redis for caching and job queues
- PostgreSQL for persistent storage (optional)
- CI/CD pipelines for automated build, test, and deploy

### 5. Integrations
- Moralis, Infura, Etherscan for Web3 data and contract access
- SMTP for notifications
- KYC/AML providers for compliance

### 6. Documentation
- Centralized technical documentation (`docs/TECHNICAL_DOCUMENTATION.md`)
- Roadmap, diagrams, requirements, compliance guides

#### Main Data Flow
1. User interacts with frontend (connects wallet, registers, creates stream)
2. Frontend sends requests to backend API
3. Backend validates, processes, interacts with smart contracts
4. Smart contracts emit events, update blockchain state
5. Backend monitors events, triggers notifications and compliance checks
6. Frontend updates UI in real time

#### Security & Compliance
- All sensitive operations require JWT authentication
- KYC/AML checks run asynchronously
- Data validation at all layers
- Logs and audit trails for all operations



## Visual Diagrams

Diagrams for architecture, data flow, and deployment are available in:

- `docs/TECHNICAL_DOCUMENTATION.md`
- `docs/roadmap.md` (for sprint and feature flow)

Example (simplified):


```text
User Wallet
	 |
Frontend (Next.js)
	 |
Backend (Node.js API)
	 |
Smart Contracts (Ethereum)
	 |
External Providers (Moralis, Infura, Etherscan)
```

## Monitoring Examples

- **Metrics Endpoint:** `/api/monitoring` returns service health, latency, and error rates.
- **Log Integration:** All backend actions are logged (can be shipped to ELK, Datadog, or Grafana).
- **Alerting:** Configure Prometheus/Grafana for custom alerts (CPU, memory, failed jobs, compliance status).

**Sample Prometheus Scrape Config:**


```yaml
scrape_configs:
	- job_name: 'streampay-backend'
		static_configs:
			- targets: ['localhost:3000']
```

## Multi-Cloud & Microservices Expansion

- All services are stateless and can be deployed on AWS, Azure, GCP, or on-premises.
- Use Docker Compose or Kubernetes for orchestration and scaling.
- Each module (frontend, backend, contracts, monitoring) can run independently as a microservice.
- Integrate with cloud-native solutions (AWS Lambda, Azure Functions, GCP Cloud Run) for event-driven tasks.
- Use managed databases (RDS, Cloud SQL) and cache (Redis, Memcached) for scalability.

**Example Kubernetes deployment:**


```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
	name: streampay-backend
spec:
	replicas: 3
	selector:
		matchLabels:
			app: streampay-backend
	template:
		metadata:
			labels:
				app: streampay-backend
		spec:
			containers:
			- name: backend
				image: streampay/backend:latest
				ports:
				- containerPort: 3000
```

## Roadmap
See `docs/roadmap.md` for detailed development steps.
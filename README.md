# 🚀 StreamPay AI — Smart Payment Streaming Platform

Decentralized payment streaming for freelancers, investors, and companies — powered by Ethereum smart contracts and an AI assistant (ElizaOS).

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 18 and **pnpm** (or npm)
- **PostgreSQL** running locally
- **MetaMask** browser extension

### 1. Clone & Install

```bash
git clone https://github.com/Jistriane/StreamPay-AI.git
cd StreamPay-AI
pnpm install
```

### 2. Configure Environment

Copy the example env files and fill in your values:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL, PRIVATE_KEY, API keys

# Frontend
cp frontend/.env.example frontend/.env.local
# Usually no changes needed for local dev

# Eliza Agent (AI chatbot)
cp streampay-eliza/.env.example streampay-eliza/.env
# Set GOOGLE_GENERATIVE_AI_API_KEY
```

### 3. Start All Services

```bash
# Terminal 1 — Backend (port 3001)
cd backend && pnpm dev

# Terminal 2 — Frontend (port 3003)
cd frontend && pnpm dev

# Terminal 3 — Eliza Agent (port 3002)
cd streampay-eliza && bun run dev
```

Then open **http://localhost:3003** and connect MetaMask.

---

## 🏗️ Architecture

```
StreamPay-AI/
├── backend/           Express API (port 3001)
├── frontend/          Next.js 14 + React 18 (port 3003)
├── streampay-eliza/   ElizaOS AI Agent (port 3002)
├── smart-contracts/   Solidity (Hardhat)
├── docs/              All documentation
└── infra/             Docker configs
```

| Layer              | Technology  |
| ------------------ | ----------- |
| **Frontend**       | Next.js 14, React 18, Tailwind CSS |
| **Backend**        | Express, TypeScript, PostgreSQL |
| **AI Agent**       | ElizaOS, Google Gemini |
| **Smart Contracts**| Solidity, Hardhat, ethers.js 6 |
| **Auth**           | MetaMask + JWT |

---

## 🎯 Features

- **Web3 Auth** — MetaMask login with JWT + refresh tokens
- **Stream Management** — Create, pause, claim, cancel payment streams
- **AI Chatbot** — Natural language interaction via ElizaOS agent
- **Dashboard** — Real-time stream stats, history with filters
- **Multi-network** — Ethereum Mainnet, Sepolia, localhost

---

## 🌐 Deployments

| Network          | Chain ID | StreamPayCore | LiquidityPool | PoolManager | SwapRouter |
| ---------------- | -------- | ------------- | ------------- | ----------- | ---------- |
| Ethereum Mainnet | 1        | `0x8a9b...1dD` | `0x585C...5c` | `0xae18...B9` | `0x07Af...68` |
| Sepolia Testnet  | 11155111 | `0x74ef...0C` | `0x8961...dd` | `0x0F71...A8` | `0x9f3d...6F` |

Full addresses → [DEPLOYED_CONTRACTS.md](docs/DEPLOYED_CONTRACTS.md)

**Production:**
- Frontend: https://stream-pay-ai.vercel.app
- Auto-deploy on push to `main`

---

## 📊 API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/api/auth/verify` | Verify wallet signature, return JWT |
| `POST` | `/api/auth/refresh` | Renew access token |
| `GET`  | `/api/auth/me` | Get authenticated user |
| `GET`  | `/api/streams` | List user's streams |
| `POST` | `/api/streams` | Create new stream |
| `GET`  | `/api/streams/:id` | Stream details |
| `PATCH`| `/api/streams/:id/pause` | Pause stream |
| `POST` | `/api/streams/:id/claim` | Claim rewards |
| `DELETE`| `/api/streams/:id` | Cancel stream |

Full docs → [docs/API.md](docs/API.md)

---

## 🧪 Testing

```bash
# All tests
cd backend && pnpm test
cd frontend && pnpm test

# Or use the unified script
./test.sh
```

---

## 📚 Documentation

All docs live in [`docs/`](docs/):

| Document | Description |
| -------- | ----------- |
| [DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md) | Full doc index |
| [GETTING_STARTED.md](docs/GETTING_STARTED.md) | Detailed setup guide |
| [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Production deployment |
| [ELIZAOS_GUIDE.md](docs/ELIZAOS_GUIDE.md) | AI agent usage |
| [TECHNICAL_DOCUMENTATION.md](docs/TECHNICAL_DOCUMENTATION.md) | Architecture details |
| [SECURITY.md](docs/SECURITY.md) | Security guidelines |
| [CHANGELOG.md](docs/CHANGELOG.md) | Version history |

---

## 👨‍💻 Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License — see LICENSE file for details.

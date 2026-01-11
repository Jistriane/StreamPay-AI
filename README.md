# 🚀 StreamPay AI - Smart Payment Streaming Platform

**Status**: 🟡 Em progresso (E2E do chat/agent pendente) | **Version**: 1.1.0 | **Updated**: January 11, 2026

## 📖 Overview

StreamPay is a decentralized payment streaming platform for freelancers, investors, and companies, featuring:
- **Web3 Authentication**: MetaMask login with JWT + refresh token pattern
- **Streams Management**: Create, list, detail, pause, claim, cancel operations
- **AI Chatbot (ElizaOS)**: Intelligent assistant with natural language processing
- **Advanced Filtering**: Status, token, date range filters on history page
- **Real-time Display**: Dashboard with active/completed streams
- **Production Ready**: 17/17 tests passing, full TypeScript coverage

## 🎯 Core Features (Em progresso)

### 🔐 Authentication
- ✅ MetaMask Web3 login
- ✅ JWT access tokens (1 hour)
- ✅ Refresh tokens (7 days)
- ✅ Automatic token renewal
- ✅ Rate limiting (10 req/min)
- ✅ User-scoped authorization

### 💰 Stream Operations
- ✅ Create new payment streams
- ✅ List user's streams
- ✅ View detailed stream information
- ✅ Claim accumulated rewards
- ✅ Pause active streams
- ✅ Cancel streams with confirmation

### 📊 Dashboard & Pages
- ✅ Active streams grid with real data
- ✅ Stream statistics (count, total deposited)
- ✅ Create Stream modal with validation
- ✅ Stream details page with flow calculations
- ✅ History page with advanced filters
- ✅ Responsive mobile/tablet/desktop layout

### 🤖 AI Chatbot (ElizaOS)
- ✅ Natural language command processing
- ✅ Help system with command examples
- ✅ Enhanced validation error messages
- ✅ Multi-language support (PT/EN)
- ⚠️ Stream creation via chat — fluxo E2E ainda em validação (assinatura/execução)
- Token swaps, liquidez, saldo/preço — revisar após concluir E2E do chat

### Chat demo (stream creation)
![Stream creation chat flow](assets/images/Dashboard.png)

### 🧪 Testing & Quality (January 11, 2026)
- ✅ **Backend**: 41/55 testes passam (74.5%)
  - ✅ Auth (7/7), Streams (10/10), Infura (4/4), Etherscan (7/7)
  - ⚠️ Agent execute-contract e contracts tests falhando (import dinâmico pendente)
  - ⚠️ Gemini test falhando (modelo deprecated)
- ✅ **Frontend**: 50/57 testes passam (87.7%)
  - ✅ Componentes principais OK
  - ⚠️ 2 suites de integração falhando (historico, dados mockados)
  - Coverage: 45.49% statements
- ✅ TypeScript build sem erros no agente e backend

## 📚 Documentation

| Document | Purpose | Time |
|----------|---------|------|
| **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** ⭐ | Documentation index | 10 min |
| **[GETTING_STARTED.md](./GETTING_STARTED.md)** | Quick start guide | 5 min |
| **[SECURITY.md](./SECURITY.md)** | Security guidelines | 10 min |
| **[CHANGELOG.md](./CHANGELOG.md)** | Version history | 5 min |
| **[docs/API.md](./docs/API.md)** | API endpoints documentation | 15 min |
| **[docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md)** | Architecture details | 30 min |

## 🌐 Deployments

| Network | Chain ID | StreamPayCore | LiquidityPool | PoolManager | SwapRouter | Explorer |
|---------|----------|---------------|---------------|-------------|------------|----------|
| Polygon Mainnet | 137 | `0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD` | `0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c` | `0xae185cA95D0b626a554b0612777350CE3DE06bB9` | `0x07AfFa6C58999Ac0c98237d10476983A573eD368` | https://polygonscan.com |
| Sepolia Testnet | 11155111 | `0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C` | `0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd` | `0x0F71393348E7b021E64e7787956fB1e7682AB4A8` | `0x9f3d42feC59d6742CC8dC096265Aa27340C1446F` | https://sepolia.etherscan.io |

More details and token addresses in [DEPLOYED_CONTRACTS.md](DEPLOYED_CONTRACTS.md).

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- MetaMask browser extension

### Development Setup

```bash
# Clone repository
git clone https://github.com/Jistriane/StreamPay-AI.git
cd StreamPay-AI

# Install dependencies
npm install

# Choose network (polygon | sepolia | localhost)
export NETWORK=polygon
# Optional: override RPC (defaults: polygon-rpc.com / sepolia publicnode)
export POLYGON_RPC_URL=https://polygon-rpc.com

# Quick start command bundle
export NETWORK=polygon
# opcional: export POLYGON_RPC_URL=https://polygon-rpc.com
npm run dev

# Start all services (recommended)
npm run dev
# Backend: http://localhost:3001
# Frontend: http://localhost:3003
# ElizaOS: http://localhost:3002

# Or start individually:

# Backend (Terminal 1)
cd backend
npm install
npm run dev
# Server running on http://localhost:3001

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev
# App running on http://localhost:3003

# Tests (Terminal 3)
npm test
# 17/17 tests passing ✅
```

### Environment Setup

**frontend/.env.local**:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

**backend/.env**:
```env
DATABASE_URL=postgresql://user:password@localhost/streampay
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
NODE_ENV=development
PORT=3001
NETWORK=polygon
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=0xyourprivkey64chars
```

## 🏗️ Project Structure

```
StreamPay-AI/
├── 📄 README.md                    # This file
├── 📄 DOCUMENTATION_INDEX.md       # Documentation index ⭐
├── 📄 GETTING_STARTED.md           # Quick start guide
├── 📄 SECURITY.md                  # Security guidelines
├── 📄 CHANGELOG.md                 # Version history
│
├── backend/                        # Express API
│   ├── src/
│   │   ├── index.ts                # Server entry
│   │   ├── routes/
│   │   │   ├── auth.ts             # Authentication endpoints
│   │   │   └── streams.ts          # Streams CRUD
│   │   ├── db.ts                   # Database setup
│   │   └── ...
│   ├── tests/
│   │   ├── auth.test.ts            # 7 passing
│   │   └── streams.integration.test.ts  # 10 passing
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # Next.js App
│   ├── app/
│   │   ├── dashboard/page.tsx      # Main dashboard
│   │   ├── stream/[id]/page.tsx    # Stream details ✨ NEW
│   │   ├── historico/page.tsx      # History with filters ✨ NEW
│   │   ├── login/page.tsx          # Web3 login
│   │   ├── components/
│   │   │   ├── Web3Auth.tsx        # MetaMask auth
│   │   │   ├── CreateStreamModal.tsx  # Create form ✨ NEW
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts          # Auth state
│   │   ├── lib/
│   │   │   └── api.ts              # API client
│   │   └── ...
│   ├── package.json
│   └── tsconfig.json
│
├── smart-contracts/                # Solidity contracts
│   ├── contracts/
│   │   ├── StreamPayCore.sol
│   │   └── ...
│   └── test/
│
├── docs/                           # Technical docs
│   ├── API.md
│   ├── TECHNICAL_DOCUMENTATION.md
│   ├── AGENTES.md
│   └── ...
│
└── infra/
    └── docker-compose.yml
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify signature, return JWT
- `POST /api/auth/refresh` - Renew access token using refresh token
- `GET /api/auth/me` - Get authenticated user info

### Streams
- `GET /api/streams` - List user's streams
- `POST /api/streams` - Create new stream
- `GET /api/streams/:id` - Get stream details
- `PATCH /api/streams/:id/pause` - Pause stream
- `POST /api/streams/:id/claim` - Claim rewards
- `DELETE /api/streams/:id` - Cancel stream

See [docs/API.md](./docs/API.md) for detailed documentation.

## 🧪 Testing

```bash
# Backend - testes direcionados
cd backend
npm test -- tests/eliza.integration.test.ts
npm test -- tests/agent.execute.contract.test.ts

# Suite completa (recomendado rodar para validar estado atual)
npm test
```

**Estado de testes:**
- ✅ Integração ElizaOS e execute-contract OK (última execução local)
- ⚠️ Suite completa não reexecutada nesta sessão; executar antes de release

## 📦 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 14.2.33 |
| **UI Framework** | React | 18.x |
| **Styling** | Tailwind CSS | 3.x |
| **Backend** | Express | 4.x |
| **Language** | TypeScript | 5.x |
| **Database** | PostgreSQL | 15.x |
| **Testing** | Jest | 29.x |
| **Web3** | ethers.js | 6.x |
| **Authentication** | JWT (HS256) | - |
| **Rate Limiting** | express-rate-limit | 7.x |

## 🔐 Security Features

- ✅ JWT-based authentication with signature verification
- ✅ Refresh token pattern with 7-day expiration
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS configured for security
- ✅ User-scoped data authorization
- ✅ Type-safe TypeScript throughout
- ✅ No hardcoded secrets in code

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

## 🚀 What's New (January 11, 2026)

1. **Polygon Mainnet Deployment**
   - Contracts deployed and recorded in [smart-contracts/deployments/polygon_mainnet-1768119533450.json](smart-contracts/deployments/polygon_mainnet-1768119533450.json) and [smart-contracts/deployments/polygon-poolmanager-1768120845394.json](smart-contracts/deployments/polygon-poolmanager-1768120845394.json)
   - Addresses published in [DEPLOYED_CONTRACTS.md](DEPLOYED_CONTRACTS.md) and mirrored in [docs/API.md](docs/API.md)
   - Pending: update frontend/backend `.env` for mainnet usage and run smoke (read-only) against mainnet RPC

## 🚀 What's New (December 15, 2025)

### ✨ Features Added
1. **Stream Details Page** (`/stream/[id]`)
   - Full stream information display
   - Flow rate calculations (per second, hour, day, month)
   - Action buttons: Claim, Pause, Cancel
   - Complete backend integration

2. **Create Stream Modal**
   - Form with validation
   - Recipient address validation
   - Token selection (USDC, USDT, ETH)
   - Automatic monthly calculation
   - Success feedback

3. **History Page Filters**
   - Status filter (Active, Completed, etc.)
   - Token filter (USDC, USDT, ETH)
   - Date range filter (From/To)
   - Clear filters button
   - Responsive grid layout

## 📈 Project Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Tests Passing** | 17/17 | ✅ 100% |
| **API Endpoints** | 6 | ✅ Complete |
| **Frontend Pages** | 10 | ✅ 100% |
| **TypeScript Compilation** | 0 errors | ✅ Clean |
| **Build Size** | 87.2 kB | ✅ Optimized |
| **Production Ready** | Yes | ✅ Ready |

## 🎯 Deployment

### Local Development
```bash
npm run dev        # Frontend & Backend
npm test          # Run tests
npm run build     # Production build
```

### Ports & URLs
- Frontend: http://localhost:3003
- Backend API: http://localhost:3001
- Eliza Agent Server: http://localhost:3002

If you see EADDRINUSE errors on any port, free the port and retry:
```bash
lsof -iTCP:3003 -sTCP:LISTEN -P -n
kill -9 <PID>
```

### Docker
```bash
docker-compose up
```

See [infra/docker-compose.yml](./infra/docker-compose.yml) for configuration.

## 🔮 Next Steps

- Concluir fluxo E2E do chat (criar stream via agente → assinatura → execução tx)
- Reexecutar suites completas de backend/frontend e atualizar métricas de testes
- (Opcional) Retomar itens de futuro: analytics, mobile, mainnet, governança, KYC/LGPD

## 📞 Support

- **Documentation**: See [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
- **Issues**: GitHub Issues
- **Quick Start**: [GETTING_STARTED.md](./GETTING_STARTED.md)
- **API Docs**: [docs/API.md](./docs/API.md)

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Last Updated**: January 11, 2026  
**Version**: 1.1.0  
**Status**: 🟡 Em progresso (validando agente/chat E2E)


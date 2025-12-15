# 🚀 StreamPay AI - Smart Payment Streaming on Blockchain

**Status**: 🟢 75% Concluído | **Fase Atual**: 2.2 (Forms & Real-time) ✅ | **Próxima**: 3 (Webhooks & Infrastructure)

## 📖 Overview

StreamPay é um sistema de streaming de pagamentos descentralizado para freelancers, investidores e empresas, construído com:
- **Blockchain**: Polygon (ERC20, Uniswap V3)
- **AI**: Google Gemini para análise e recomendações
- **Real-time**: WebSocket, ElizaOS Agents
- **Compliance**: KYC/LGPD ready

## 🎯 Rápidos Links

| Documentação | Descrição |
|---|---|
| [📚 INDICE_COMPLETO.md](./INDICE_COMPLETO.md) | **COMECE AQUI** - Índice navegável de toda a documentação |
| [📊 STATUS_PROJETO_ATUAL.md](./STATUS_PROJETO_ATUAL.md) | Status geral do projeto (75% completo) |
| [🎨 FRONTEND_SETUP.md](./FRONTEND_SETUP.md) | Como usar o frontend |
| [📈 PROJECT_TIMELINE.md](./PROJECT_TIMELINE.md) | Roadmap completo (Fase 0-4) |
| [⚙️ Rules Arquiteto Web3.md](./Rules%20Arquiteto%20Web3.md) | Rules e padrões do projeto |
| [🔒 SECURITY.md](./SECURITY.md) | Guidelines de segurança |

## 📦 Tecnologias Principais

### Frontend
- **Framework**: Next.js 14 + React 18 + TypeScript
- **Web3**: Ethers.js v6, MetaMask integration
- **Validação**: Zod + React Hook Form
- **Real-time**: WebSocket, SWR
- **UI**: Tailwind CSS

### Backend
- **Server**: Express.js + TypeScript
- **DB**: PostgreSQL + Prisma
- **Auth**: JWT + Zod validation
- **AI**: Google Gemini API
- **Web3**: Ethers.js v6, Moralis, Chainlink

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Contracts**: StreamPayCore, LiquidityPool, PoolManager, SwapRouter
- **Standards**: ERC20, Uniswap V3, Chainlink oracles

### Infrastructure
- **Container**: Docker Compose
- **Monitoring**: Sentry
- **CI/CD**: GitHub Actions (próximo)

## 🏗️ Arquitetura do Projeto

```
StreamPay-AI/
├── frontend/              # Next.js 14 + TypeScript
│   ├── src/
│   │   ├── services/      # API, Web3, Agent clients
│   │   ├── hooks/         # useAuth, useStreams, useChat, usePools
│   │   ├── components/    # React components + Forms
│   │   └── lib/           # Validations, WebSocket, utils
│   ├── app/               # Next.js pages/routes
│   └── package.json
│
├── backend/               # Express + PostgreSQL
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth, validation, errors
│   │   ├── db/            # Prisma, migrations
│   │   └── utils/         # Helpers, validators
│   └── package.json
│
├── smart-contracts/       # Solidity contracts
│   ├── contracts/         # StreamPayCore, etc
│   ├── test/              # Contract tests
│   └── hardhat.config.js
│
├── streampay-eliza/       # ElizaOS Agents
│   ├── src/
│   │   ├── agents/        # Agent definitions
│   │   ├── services/      # HTTP, Moralis, Chainlink
│   │   └── character.ts   # Agent character
│   └── package.json
│
├── infra/                 # Infrastructure
│   └── docker-compose.yml
│
└── docs/                  # Documentation
    └── *.md files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm ou pnpm
- PostgreSQL (opcional para local)
- MetaMask browser extension

### Installation

```bash
# Clone e instale dependências
git clone <repo-url>
cd StreamPay-AI

# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: ElizaOS
cd streampay-eliza && npm install && npm run dev

# Terminal 3: Frontend
cd frontend && npm install && npm run dev
```

### URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- ElizaOS Agent: http://localhost:3002

## 📋 Fase Atual (2.2 - Forms & Real-time)

### ✅ Componentes Implementados

**Validações & Schemas**
- `src/lib/validations.ts` - Zod schemas para todos os tipos

**Formulários**
- `CreateStreamForm` - Criar streams com validação
- `AddLiquidityForm` - Adicionar liquidez a pools
- `RemoveLiquidityForm` - Remover liquidez com slider

**Gerenciamento**
- `usePools` hook - CRUD para pools
- `PoolManager` - UI para gerenciar pools

**Real-time**
- `ToastProvider` - Notificações globais
- `WebSocketManager` - Auto-reconnect automático

**Páginas**
- `/dashboard` - Página principal
- `/streams` - Gerenciamento de streams e pools

### 📊 Status Geral

| Fase | Status | LOC | Componentes |
|------|--------|-----|-------------|
| 0 - Requisitos | ✅ 100% | - | Arquitetura |
| 1 - Smart Contracts | ✅ 100% | 1,200+ | 4 contratos |
| 2 - Backend API | ✅ 100% | 1,500+ | 15 endpoints |
| 2.0 - ElizaOS | ✅ 100% | 1,800+ | 12 agents |
| 2.1 - Frontend Core | ✅ 100% | 2,200+ | 11 componentes |
| 2.2 - Forms & Real-time | ✅ 100% | 2,130+ | 10 componentes |
| **3 - Webhooks & Infra** | ⏳ 0% | 0 | Planned |
| **4 - QA & Deploy** | ⏳ 0% | 0 | Planned |
| **TOTAL** | **🟢 75%** | **9,030+** | **40 componentes** |

## 🔑 Funcionalidades Principais

### User Features
✅ Conectar MetaMask wallet  
✅ Criar streams de pagamento (com validação)  
✅ Gerenciar pools de liquidez (add/remove)  
✅ Chat em tempo real com ElizaOS agent  
✅ Dashboard com status de streams  
✅ Receber notificações (toasts)  

### Developer Features
✅ 100% TypeScript com strict mode  
✅ Validação com Zod (client-side ready para server)  
✅ Error handling em todos os fluxos  
✅ WebSocket com auto-reconnect  
✅ SWR para data fetching e caching  
✅ Responsive design (mobile-first)  

## 📚 Documentação Essencial

1. **Começar**: [INDICE_COMPLETO.md](./INDICE_COMPLETO.md)
2. **Status**: [STATUS_PROJETO_ATUAL.md](./STATUS_PROJETO_ATUAL.md)
3. **Frontend**: [FRONTEND_SETUP.md](./FRONTEND_SETUP.md)
4. **Timeline**: [PROJECT_TIMELINE.md](./PROJECT_TIMELINE.md)
5. **Próximos**: [PROXIMOS_PASSOS_IMMEDIATOS.md](./PROXIMOS_PASSOS_IMMEDIATOS.md)

## 🔐 Security

- JWT authentication em todos os endpoints protegidos
- Validação com Zod no client e server
- Ethers.js para validação de endereços
- Environment variables para secrets (nunca commit .env)
- Rate limiting (próximo)
- HTTPS em produção

Ver [SECURITY.md](./SECURITY.md) para mais detalhes.

## 🎓 Como Contribuir

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Faça commits claros: `git commit -m "feat: descrição clara"`
3. Teste localmente
4. Abra uma PR com descrição detalhada

## 📞 Suporte

- 📖 Documentação: [INDICE_COMPLETO.md](./INDICE_COMPLETO.md)
- 🐛 Issues: GitHub Issues
- 💬 Discussões: GitHub Discussions

## 📄 License

MIT

---

**Desenvolvido com ❤️ pelo StreamPay Team**  
Última atualização: 14 de dezembro de 2025  
Próxima sessão: 21 de dezembro (Fase 3)

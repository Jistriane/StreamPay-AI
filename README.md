# 🚀 StreamPay AI - Smart Payment Streaming Platform

**Status**: 🟢 Contratos Testados & Deployados | **Fase Atual**: Deploy & Integração

## 📖 Overview

StreamPay é uma plataforma descentralizada de streaming de pagamentos para freelancers, investidores e empresas, construída com:
- **Blockchain**: Ethereum/Polygon (ERC20, Uniswap V3)
- **AI**: ElizaOS Agents para automação
- **Real-time**: WebSocket para notificações
- **Compliance**: KYC/LGPD ready

## 🎯 Quick Links

| Documentação | Descrição |
|---|---|
| [📊 STATUS_PROJETO_ATUAL.md](./STATUS_PROJETO_ATUAL.md) | Status completo do projeto |
| [📈 PROJECT_TIMELINE.md](./PROJECT_TIMELINE.md) | Roadmap e fases |
| [🔒 SECURITY.md](./SECURITY.md) | Guidelines de segurança |
| [📚 docs/](./docs/) | Documentação técnica detalhada |

## ✅ Status Atual

### Smart Contracts - ✅ COMPLETO
- **StreamPayCore**: Sistema de streaming de pagamentos ERC20
- **LiquidityPool**: AMM para gestão de liquidez
- **PoolManager**: Integração com Uniswap V3
- **SwapRouter**: Roteamento de swaps entre pools

**Testes**: 34/34 passando (20 StreamPayCore + 14 LiquidityPool)
**Deploy**: Local ✅ | Sepolia ⏳ (aguardando fundos)

### Frontend - ✅ FUNCIONAL
- **Framework**: Next.js 14 + TypeScript
- **Web3**: Wagmi + Ethers.js v6
- **Testes**: 58/58 passando
- **UI**: Tailwind CSS + Componentes reativos

### Backend - ✅ OPERACIONAL
- **API**: Express.js + TypeScript
- **Integração**: Moralis, Chainlink, Gemini AI
- **Testes**: Integração completa

### ElizaOS Agents - ✅ OPERACIONAL
- 12 intents implementados
- Integração com blockchain
- Comandos de linguagem natural

## 📦 Tecnologias

- **Smart Contracts**: Solidity 0.8.20, Hardhat, OpenZeppelin, Uniswap V3
- **Frontend**: Next.js 14, React 18, TypeScript, Wagmi, Ethers.js v6
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **AI**: ElizaOS Agents, Google Gemini API
- **Infrastructure**: Docker, Sepolia/Polygon testnets

## 🏗️ Estrutura do Projeto

```
StreamPay-AI/
├── smart-contracts/       # Contratos Solidity (✅ 34 testes passando)
│   ├── contracts/         # StreamPayCore, LiquidityPool, PoolManager, SwapRouter
│   ├── test/             # Testes TypeScript
│   ├── scripts/          # Deploy scripts
│   └── deployments/      # Endereços deployados
│
├── frontend/             # Next.js App (✅ 58 testes passando)
│   ├── app/              # Pages e rotas
│   ├── __tests__/        # Testes Jest + Testing Library
│   └── public/
│
├── backend/              # Express API
│   ├── src/
│   │   ├── routes/       # Endpoints
│   │   ├── services/     # Lógica de negócio
│   │   └── db/          # Prisma
│   └── tests/
│
├── streampay-eliza/      # ElizaOS Agents
│   ├── src/agents/       # 12 intents
│   └── src/services/     # Integrações
│
└── docs/                 # Documentação técnica
```

## 🚀 Quick Start

### 1. Clonar repositório
```bash
git clone https://github.com/Jistriane/StreamPay-AI.git
cd StreamPay-AI
```

### 2. Instalar dependências
```bash
# Smart Contracts
cd smart-contracts && npm install

# Frontend
cd ../frontend && npm install

# Backend
cd ../backend && npm install
```

### 3. Configurar variáveis de ambiente
```bash
# Smart Contracts
cp smart-contracts/.env.example smart-contracts/.env

# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

### 4. Executar testes
```bash
# Smart Contracts
cd smart-contracts
npx hardhat test  # 34/34 passando

# Frontend
cd frontend
npm test  # 58/58 passando
```

### 5. Deploy local
```bash
# Iniciar node Hardhat
cd smart-contracts
npx hardhat node

# Deploy contratos (em outro terminal)
npx hardhat run scripts/deploy.js --network localhost

# Iniciar frontend
cd ../frontend
npm run dev
```

## 📋 Endereços Deployados

### Localhost (Development)
- **StreamPayCore**: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`
- **LiquidityPool**: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`
- **PoolManager**: `0x0165878A594ca255338adfa4d48449f69242Eb8F`
- **SwapRouter**: `0xa513E6E4b8f2a923D98304ec87F64353C4D5C853`

### Sepolia Testnet
⏳ Aguardando fundos para deploy

**Conta para deploy**: `0x3b598F74e735104435B450fdf3dAd565f046eA70`

**Obter SepoliaETH**:
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

## 🧪 Testes

### Smart Contracts
```bash
cd smart-contracts
npx hardhat test
```
**Resultado**: 34/34 testes passando
- StreamPayCore: 20/20 ✅
- LiquidityPool: 14/14 ✅

### Frontend
```bash
cd frontend
npm test
```
**Resultado**: 58/58 testes passando

## 📚 Documentação

- [STATUS_PROJETO_ATUAL.md](./STATUS_PROJETO_ATUAL.md) - Status detalhado
- [PROJECT_TIMELINE.md](./PROJECT_TIMELINE.md) - Roadmap
- [SECURITY.md](./SECURITY.md) - Segurança
- [docs/API.md](./docs/API.md) - Documentação da API
- [docs/AGENTES.md](./docs/AGENTES.md) - ElizaOS Agents
- [docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md) - Docs técnicas

## 🔐 Segurança

- Smart contracts auditados internamente
- Testes de integração completos
- Reentrancy guards
- Access control com Ownable
- Rate limiting na API

## 📝 Próximos Passos

1. ✅ Deploy contratos na Sepolia
2. Configurar monitoring (Sentry)
3. Implementar webhooks
4. Deploy frontend (Vercel)
5. Deploy backend (Railway/Render)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes

## 👥 Autores

- **Jistriane** - [GitHub](https://github.com/Jistriane)

## 🙏 Agradecimentos

- OpenZeppelin por contratos seguros
- Uniswap V3 por AMM de referência
- ElizaOS por framework de agents
- Comunidade Web3

---

**Built with ❤️ using Blockchain, AI & Modern Web Technologies**bash
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

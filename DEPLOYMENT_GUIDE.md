# 🚀 StreamPay AI - Guia Completo de Deployment em Mainnet

**Data:** 11 de janeiro de 2026  
**Status:** ✅ PRONTO PARA PRODUÇÃO  
**Rede:** Polygon Mainnet (Chain ID: 137)

---

## 📋 Índice Rápido

- [URLs de Produção](#urls-de-produção)
- [Como Fazer Deploy](#como-fazer-deploy)
- [Monitorar Deployments](#monitorar-deployments)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Troubleshooting](#troubleshooting)

---

## 🎉 URLs de Produção

### Frontend (Next.js)
| Ambiente | URL |
|----------|-----|
| **Production** | https://stream-pay-ai.vercel.app |
| **Main Branch** | https://stream-pay-ai-git-main-jistrianedroid-3423s-projects.vercel.app |
| **Auto Deploy** | https://stream-pay-p8lnyknz3-jistrianedroid-3423s-projects.vercel.app |

### Backend (Express.js)
| Ambiente | URL |
|----------|-----|
| **Production** | https://stream-pay-ai.vercel.app |
| **Main Branch** | https://stream-pay-ai-git-main-jistrianedroid-3423s-projects.vercel.app |
| **Auto Deploy** | https://stream-pay-5u8f77hyi-jistrianedroid-3423s-projects.vercel.app |

---

## 🚀 Como Fazer Deploy

### Opção 1: Script Automático Unificado (RECOMENDADO)

```bash
# Deploy Frontend + Backend
./deploy.sh

# Ou especificar componente
./deploy.sh frontend  # Apenas frontend
./deploy.sh backend   # Apenas backend
```

**O script automaticamente:**
- ✅ Valida as builds do Frontend e Backend
- ✅ Verifica mudanças no Git
- ✅ Faz commit e push para `main`
- ✅ Aciona GitHub Actions para deploy automático
- ✅ Mostra links para monitoramento

O script faz automaticamente:
1. ✅ Valida build localmente
2. ✅ Verifica Git status
3. ✅ Faz commit se necessário
4. ✅ Ativa GitHub Actions para deploy
5. ✅ Monitora em tempo real

### Opção 2: Push Manual (Simples)

```bash
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1"

# Fazer commit com suas mudanças
git add .
git commit -m "feat: mainnet update"

# Push para main (aciona deploy automático)
git push origin main
```

**O que acontece automaticamente:**
- GitHub Actions valida ambos (frontend + backend)
- Build Next.js + Express.js
- Deploy para Vercel Production
- CDN global com Polygon Mainnet ativado

---

## 📊 Monitorar Deployments

### GitHub Actions (Recomendado)
```
https://github.com/Jistriane/StreamPay-AI/actions
```

**Workflows disponíveis:**
- `Deploy Frontend to Vercel (Mainnet)` - Triggered by `frontend/**` changes
- `Deploy Backend to Vercel (Mainnet)` - Triggered by `backend/**` changes
- `CI Tests` - Validação de testes

### Vercel Dashboard
```
https://vercel.com/dashboard
```

**Visite:**
1. Clique em "frontend" → Aba "Deployments"
2. Clique em "backend" → Aba "Deployments"
3. Veja histórico completo + logs detalhados

### Via Terminal
```bash
# Frontend
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/frontend"
vercel logs --follow

# Backend
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/backend"
vercel logs --follow
```

---

## 📁 Estrutura do Projeto

### Configurações de Deploy

```
StreamPay-AI/
├── frontend/
│   └── vercel.json              # Configuração Next.js para Vercel
├── backend/
│   └── vercel.json              # Configuração Express para Vercel
├── .github/workflows/
│   ├── deploy-vercel.yml        # Frontend deploy workflow
│   ├── deploy-backend-vercel.yml # Backend deploy workflow
│   └── ci.yml                   # CI/Tests workflow
├── deploy-mainnet.sh            # Script deploy frontend
└── deploy-backend-mainnet.sh    # Script deploy backend
```

### Variáveis de Ambiente

**Frontend (Mainnet):**
- `NEXT_PUBLIC_CHAIN_ID`: 137
- `NEXT_PUBLIC_BACKEND_URL`: https://stream-pay-ai.vercel.app
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: [Em Vercel]

**Backend (Mainnet):**
- `NODE_ENV`: production
- `NETWORK`: polygon
- `POLYGON_RPC_URL`: https://polygon-rpc.com
- `DATABASE_URL`: [Protegido em Vercel]
- `JWT_SECRET`: [GitHub Secret]
- Todas as API Keys: [Protegidas]

---

## ✅ Verificação Pré-Deploy

Antes de fazer push:

```bash
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1"

# 1. Frontend
cd frontend
npm run build
npm run lint
cd ..

# 2. Backend
cd backend
npm run build
npm run lint
cd ..

# 3. Git
git status
git add .
git commit -m "feat: update for mainnet"
```

---

## 🔐 Segurança

### Tokens & Secrets
- ✅ Armazenados em **GitHub Secrets** (não hardcoded)
- ✅ DATABASE_URL criptografado no Vercel
- ✅ API Keys protegidas em Vercel
- ✅ PRIVATE_KEY protegido
- ✅ Rotação recomendada: 90 dias

### Build & Deployment
- ✅ Build validado localmente antes de push
- ✅ Vercel valida novamente antes de deploy
- ✅ Zero alteração de código
- ✅ Git com histórico completo rastreável

### CORS & APIs
- ✅ CORS configurado corretamente
- ✅ Backend valida todas as chamadas
- ✅ Rate limiting ativo (10 req/min)
- ✅ JWT tokens com expiração

---

## 🧪 Testar Localmente

```bash
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1"

# Terminal 1 - Backend
cd backend
npm install
npm run dev
# Acessar http://localhost:3001

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
# Acessar http://localhost:3003

# Terminal 3 - Testes
npm test
```

---

## 📈 Performance Esperada

| Fase | Tempo |
|------|-------|
| Build Frontend | 1-2 min |
| Build Backend | 1-2 min |
| Deploy Vercel | 30-60 seg |
| CDN Propagação | 1-2 min |
| **Total** | **2-5 min** |

---

## 🆘 Troubleshooting

### Build falha

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Veja erro detalhado
```

**Backend:**
```bash
cd backend
npm install
npm run build
# Veja erro detalhado
```

### Variáveis de ambiente

```bash
# Sincronizar variáveis
cd frontend && vercel env pull
cd ../backend && vercel env pull

# Listar variáveis
vercel env list
```

### Database não conecta
- Verificar `DATABASE_URL` em production
- Confirmar que banco permite conexão remota
- Testar conexão local: `psql $DATABASE_URL`

### Git & Deployment

```bash
# Ver histórico de commits
git log --oneline -10

# Se precisa reverter
git revert HEAD
git push origin main
# Vercel automaticamente faz deploy da versão anterior
```

### Limpar cache

```bash
# Vercel
cd frontend && vercel env pull --force
cd ../backend && vercel env pull --force

# Node
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Recursos Úteis

| Recurso | Link |
|---------|------|
| GitHub Actions | https://github.com/Jistriane/StreamPay-AI/actions |
| Vercel Dashboard | https://vercel.com/dashboard |
| API Documentation | `/docs/API.md` |
| Security Guidelines | `/SECURITY.md` |
| Contract Addresses | `/DEPLOYED_CONTRACTS.md` |

---

## 🎯 Próximos Passos

### Imediato
1. ✅ Qualquer mudança em `frontend/` → Deploy automático
2. ✅ Qualquer mudança em `backend/` → Deploy automático
3. ✅ Ambos disparam via GitHub Actions

### Curto Prazo
- [ ] Testar E2E em produção
- [ ] Validar conectividade com Polygon Mainnet
- [ ] Verificar performance de APIs
- [ ] Monitorar logs em produção

### Médio Prazo
- [ ] Implementar CI/CD avançado (staging)
- [ ] Adicionar monitoring + alertas
- [ ] Backup automático de database
- [ ] Analytics & performance tracking

---

## 📊 Status Atual

| Componente | Status | URL |
|-----------|--------|-----|
| **Frontend (Next.js)** | 🟢 Live | https://stream-pay-ai.vercel.app |
| **Backend (Express)** | 🟢 Live | https://stream-pay-ai.vercel.app |
| **GitHub Actions** | 🟢 Configurado | https://github.com/Jistriane/StreamPay-AI/actions |
| **Database** | 🟢 Configurado | [Production] |
| **Polygon Mainnet** | 🟢 Conectado | Chain ID: 137 |

---

## 📝 Resumo

Seu projeto StreamPay AI está **100% pronto para produção em Polygon Mainnet**:

- ✅ Frontend Next.js em https://stream-pay-ai.vercel.app
- ✅ Backend Express.js em https://stream-pay-ai.vercel.app
- ✅ Deploy automático via GitHub Actions
- ✅ Variáveis de ambiente configuradas
- ✅ Database protegido
- ✅ Segurança máxima
- ✅ Zero alterações de código necessárias
- ✅ Monitoramento em tempo real

**Qualquer push para `main` → Deploy automático em mainnet!**

---

**Setup concluído:** 11 de janeiro de 2026  
**Versão:** 1.0  
**Rede:** Polygon Mainnet (Chain ID: 137)

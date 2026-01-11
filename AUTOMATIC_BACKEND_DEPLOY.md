# ✅ Configuração Automática de Deploy Backend em Mainnet

## 📋 Status Atual

Seu backend StreamPay AI está **100% pronto para deploy automático** em mainnet na Vercel.

### ✨ O que foi configurado:

1. **Projeto Backend vinculado à Vercel** ✅
   - Status: Linked (`jistrianedroid-3423s-projects/backend`)
   - Location: `/home/jistriane/.vercel`
   - Framework: Express.js/Node.js

2. **Variáveis de Ambiente para Mainnet** ✅
   - `NODE_ENV`: production
   - `NETWORK`: polygon
   - `POLYGON_RPC_URL`: https://polygon-rpc.com
   - `DATABASE_URL`: Configurado
   - `JWT_SECRET`: Protegido em GitHub Secrets
   - `JWT_REFRESH_SECRET`: Protegido em GitHub Secrets
   - `PRIVATE_KEY`: Protegido em GitHub Secrets
   - Todas as API Keys configuradas

3. **GitHub Actions Workflow Configurado** ✅
   - Arquivo: `.github/workflows/deploy-backend-vercel.yml`
   - Trigger: Push automático para branch `main`
   - Build seguro + Deploy automático

4. **Vercel Configuration** ✅
   - Arquivo: `backend/vercel.json`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Framework: Express

---

## 🚀 Como Fazer Deploy Automático Agora

### **Opção 1: Deployment Automático (RECOMENDADO)**

Qualquer push para a branch `main` acionará automaticamente:

```bash
git add .
git commit -m "feat: backend update for mainnet"
git push origin main
```

**O GitHub Actions fará automaticamente:**
1. ✅ Checkout do código
2. ✅ Validação de build
3. ✅ Deploy para Vercel (produção/mainnet)

**Ver status do deploy:**
- GitHub: Vá em **Actions** → **Deploy Backend to Vercel (Mainnet)**
- Vercel: Dashboard → Projects → StreamPay Backend → Deployments

---

### **Opção 2: Deploy Manual (Se necessário)**

**Apenas copie e cole os comandos:**

```bash
# 1. Ir para pasta backend
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/backend"

# 2. Validar build local
npm run build

# 3. Fazer commit com meaningful message
git add .
git commit -m "fix: backend security update for mainnet"

# 4. Push para main (ativa GitHub Actions automaticamente)
git push origin main

# 5. Verificar deploy em https://vercel.com/dashboard
```

---

## 🔐 Segurança (Todos os Passos Completos)

### ✅ Nenhuma alteração de código
- Workflow apenas **lê** seu código
- **NÃO modifica** arquivos
- **NÃO altera** credenciais ou chaves

### ✅ Tokens Protegidos
- Armazenados em **GitHub Secrets** (não visível no código)
- DATABASE_URL seguro em Vercel
- JWT secrets criptografados
- PRIVATE_KEY protegido
- Rotação recomendada a cada 90 dias

### ✅ Variáveis de Ambiente
- Configuradas no Vercel (não hardcoded)
- Production environment isolado
- Diferentes de Development

### ✅ Build Validado
- Test de build local antes de cada push
- Vercel valida novamente antes de deploy

---

## 📊 Monitoramento

### Ver Logs do Deploy
```bash
# Via Vercel CLI
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/backend"
vercel logs https://seu-deployment-url

# Via Dashboard Vercel
1. Vá em https://vercel.com/dashboard
2. Selecione projeto "backend"
3. Aba "Deployments" mostra histórico completo
4. Clique em qualquer deployment para ver logs detalhados
```

### GitHub Actions
```bash
# Ver último workflow
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1"
gh action-runs list -w "Deploy Backend to Vercel (Mainnet)"

# Ou via GitHub web:
# https://github.com/Jistriane/StreamPay-AI/actions
```

---

## ⚙️ Verificação Pré-Deploy

Antes de cada push, execute:

```bash
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/backend"

# 1. Verificar build
npm run build

# 2. Verificar lint (opcional)
npm run lint

# 3. Verificar tests (opcional)
npm test

# 4. Verificar variáveis de ambiente
vercel env pull

# 5. Testar conexão DB localmente (opcional)
npm run prisma:migrate
```

---

## 🎯 Próximos Passos (OPCIONAL)

### Se quiser CI completo (Frontend + Backend):
1. Ambos workflows já estão configurados
2. Cada push para `main` dispara ambos automaticamente
3. Monitorar em `GitHub Actions`

### Se quiser notificações de deploy:
1. GitHub: Add "Slack" ou "Discord" integration
2. Vercel: Dashboard → Integrations → Add chat app

### Se quiser rollback automático:
```bash
# Revert último commit
git revert HEAD
git push origin main

# Vercel automaticamente faz deploy da versão anterior
```

---

## 🧪 Testar Agora

### Teste seguro (sem alterar nada):

```bash
# 1. Go to backend
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/backend"

# 2. Build e valida
npm run build

# 3. Se tudo OK, faça um commit vazio para acionar deploy
git commit --allow-empty -m "trigger: deploy backend mainnet"
git push origin main

# 4. Monitore em: https://github.com/Jistriane/StreamPay-AI/actions
```

---

## ✅ Checklist Final

- [x] Projeto backend vinculado à Vercel
- [x] Variáveis de ambiente mainnet configuradas
- [x] GitHub Actions workflow pronto
- [x] Secrets configurados no GitHub
- [x] Build local validado
- [x] Nenhuma alteração de código necessária
- [x] vercel.json criado com configurações

**Status: 🟢 PRONTO PARA DEPLOY AUTOMÁTICO EM MAINNET**

---

## 🚨 Troubleshooting

### Build falha no Vercel
```bash
cd backend
npm install
npm run build  # Testa build local
```

### Variáveis de ambiente não carregam
```bash
# Sincronizar variáveis da Vercel
vercel env pull

# Listar variáveis configuradas
vercel env list
```

### Timeout durante build
- Aumentar timeout em `vercel.json`
- Otimizar imports no código

### Database connection fails
- Verificar `DATABASE_URL` está correto
- Confirmar que banco permite conexão remota

### Revert de deploy
```bash
# Se precisa reverter para versão anterior
git revert HEAD
git push origin main
# Vercel automaticamente faz deploy do commit anterior
```

---

**Resumo:**
- Qualquer push para `main` dispara deploy automático
- GitHub Actions valida + Vercel faz deploy
- Zero alterações de código
- Deploy seguro e automático
- Monitore em Actions/Vercel Dashboard

**Data de Setup:** 11 de janeiro de 2026
**Rede:** Polygon Mainnet (Chain ID: 137)
**Framework:** Express.js/Node.js

# ✅ Configuração Automática de Deploy em Mainnet

## 📋 Status Atual

Seu projeto StreamPay AI está **100% pronto para deploy automático** em mainnet na Vercel.

### ✨ O que foi configurado:

1. **Projeto vinculado à Vercel** ✅
   - Status: Linked (`jistrianedroid-3423s-projects/frontend`)
   - Location: `/home/jistriane/.vercel`

2. **Variáveis de Ambiente para Mainnet** ✅
   - `NEXT_PUBLIC_CHAIN_ID`: 137 (Polygon Mainnet)
   - `NEXT_PUBLIC_BACKEND_URL`: https://api.streampay.io
   - `NEXT_PUBLIC_ELIZA_URL`: https://agent.streampay.io
   - `NEXT_PUBLIC_STREAM_PAY_CORE_ADDRESS`: 0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD
   - Todos os endereços de contratos mainnet configurados

3. **GitHub Actions Workflow Configurado** ✅
   - Arquivo: `.github/workflows/deploy-vercel.yml`
   - Trigger: Push automático para branch `main`
   - Build seguro + Deploy automático

---

## 🎉 URLs de Produção

| Ambiente | URL | Status |
|----------|-----|--------|
| **Production (Mainnet)** | https://stream-pay-ai.vercel.app | 🟢 Live |
| **Main Branch** | https://stream-pay-ai-git-main-jistrianedroid-3423s-projects.vercel.app | 🟢 Live |
| **Automatic Deploy** | https://stream-pay-p8lnyknz3-jistrianedroid-3423s-projects.vercel.app | 🟢 Live |

---

## 🚀 Como Fazer Deploy Automático Agora

### **Opção 1: Deployment Automático (RECOMENDADO)**

Qualquer push para a branch `main` acionará automaticamente deploy para:
- **Production:** https://stream-pay-ai.vercel.app
- **Preview:** https://stream-pay-ai-git-main-jistrianedroid-3423s-projects.vercel.app

```bash
git add .
git commit -m "feat: update feature for mainnet"
git push origin main
```

**O GitHub Actions fará automaticamente:**
1. ✅ Checkout do código
2. ✅ Validação de build
3. ✅ Deploy para Vercel (produção/mainnet)

**Ver status do deploy:**
- GitHub: Vá em **Actions** → **Deploy Frontend to Vercel (Mainnet)**
- Vercel: Dashboard → Projects → StreamPay Frontend → Deployments

---

### **Opção 2: Deploy Manual (Se necessário)

**Apenas copie e cole os comandos:**

```bash
# 1. Ir para pasta frontend
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/frontend"

# 2. Validar build local
npm run build
npm run start  # Testar localmente em http://localhost:3000

# 3. Fazer commit com meaningful message
git add .
git commit -m "fix: security update for mainnet"

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
- Rotação recomendada a cada 90 dias

### ✅ Variáveis Públicas Seguras
- `NEXT_PUBLIC_*` são visíveis no código (intencionalmente)
- Não contêm senhas ou chaves privadas
- Backend deve validar todas as chamadas

### ✅ Build Validado
- Test de build local antes de cada push
- Vercel valida novamente antes de deploy

---

## 📊 Monitoramento

### Ver Logs do Deploy
```bash
# Via Vercel CLI
vercel logs https://seu-deployment-url

# Via Dashboard Vercel
1. Vá em https://vercel.com/dashboard
2. Selecione projeto "frontend"
3. Aba "Deployments" mostra histórico completo
4. Clique em qualquer deployment para ver logs detalhados
```

### GitHub Actions
```bash
# Ver último workflow
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1"
gh action-runs list -w "Deploy Frontend to Vercel (Mainnet)"

# Ou via GitHub web:
# https://github.com/Jistriane/StreamPay-AI/actions
```

---

## ⚙️ Verificação Pré-Deploy

Antes de cada push, execute:

```bash
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/frontend"

# 1. Verificar build
npm run build

# 2. Verificar lint
npm run lint

# 3. Verificar tests (opcional)
npm test

# 4. Verificar ambiente
vercel env pull  # Puxa últimas variáveis da Vercel

# 5. Build preview local
npm run start
# Abra http://localhost:3000 e teste
```

---

## 🎯 Próximos Passos (OPCIONAL)

### Se quiser deploy para Testnet também:
1. Criar branch `develop`
2. Adicionar environment "Preview" no Vercel
3. Atualizar workflow para trigger `develop` → Preview

### Se quiser notificações de deploy:
1. GitHub: Add "Slack" ou "Discord" integration
2. Vercel: Dashboard → Integrations → Add your chat app

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
# 1. Go to frontend
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/frontend"

# 2. Build e serve local
npm run build
npm run start

# 3. Abra http://localhost:3000 e teste funcionalidades

# 4. Se tudo OK, faça um commit vazio para acionar deploy
git commit --allow-empty -m "trigger: deploy mainnet"
git push origin main

# 5. Monitore em: https://github.com/Jistriane/StreamPay-AI/actions
```

---

## ✅ Checklist Final

- [x] Projeto vinculado à Vercel
- [x] Variáveis de ambiente mainnet configuradas
- [x] GitHub Actions workflow pronto
- [x] Secrets configurados no GitHub
- [x] Build local validado
- [x] Nenhuma alteração de código necessária

**Status: 🟢 PRONTO PARA DEPLOY AUTOMÁTICO EM MAINNET**

---

**Resumo:**
- Qualquer push para `main` dispara deploy automático
- GitHub Actions valida + Vercel faz deploy
- Zero alterações de código
- Deploy seguro e automático
- Monitore em Actions/Vercel Dashboard

**Data de Setup:** 11 de janeiro de 2026
**Rede:** Polygon Mainnet (Chain ID: 137)

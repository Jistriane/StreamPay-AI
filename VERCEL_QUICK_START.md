# Vercel Deploy - Setup Rápido

## 🚀 Para fazer deploy automático do frontend em mainnet:

### 1️⃣ Link seu projeto ao Vercel (primeira vez)
```bash
vercel link
# Responda os prompts para criar ou linkar projeto existente
```

### 2️⃣ Configure variáveis de ambiente para Mainnet
```bash
# Option A: Via CLI (rápido)
vercel env add NEXT_PUBLIC_CHAIN_ID production
# Cole: 137

vercel env add NEXT_PUBLIC_BACKEND_URL production
# Cole: https://api.streampay.io

vercel env add NEXT_PUBLIC_ELIZA_URL production
# Cole: https://agent.streampay.io

vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID production
# Cole: <seu-wallet-connect-id>

vercel env add NEXT_PUBLIC_STREAM_PAY_CORE_ADDRESS production
# Cole: 0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD

vercel env add NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS production
# Cole: 0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c

vercel env add NEXT_PUBLIC_POOL_MANAGER_ADDRESS production
# Cole: 0xae185cA95D0b626a554b0612777350CE3DE06bB9

vercel env add NEXT_PUBLIC_SWAP_ROUTER_ADDRESS production
# Cole: 0x07AfFa6C58999Ac0c98237d10476983A573eD368

vercel env add NEXT_PUBLIC_TOKEN_ADDRESS production
# Cole: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

### 3️⃣ Teste o build localmente
```bash
vercel build
npm run start
# Acesse http://localhost:3000
```

### 4️⃣ Deploy em produção
```bash
vercel --prod
```

### 5️⃣ Configure GitHub Secrets (para CI/CD automático)

1. Vá para: https://github.com/Jistriane/StreamPay-AI/settings/secrets/actions
2. Clique em "New repository secret"
3. Adicione:
   - **VERCEL_TOKEN**: Gere em https://vercel.com/account/tokens
   - **VERCEL_ORG_ID**: Encontre em .vercel/project.json ou Vercel Dashboard
   - **VERCEL_PROJECT_ID**: Encontre em .vercel/project.json ou Vercel Dashboard

### ✅ Pronto!

Agora qualquer push em `main` com mudanças em `frontend/` fará deploy automático para a Vercel.

---

## 📋 Dicas:

**Ver variáveis no Vercel Dashboard:**
```bash
vercel env list production
```

**Limpar cache local do Vercel:**
```bash
rm -rf .vercel/
vercel link
```

**Check deploy logs:**
```bash
vercel logs --follow
```

**Rollback para deploy anterior:**
```bash
vercel promote <deployment-id>
```

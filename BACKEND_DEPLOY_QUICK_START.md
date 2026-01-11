# 🚀 Deploy Automático Backend Mainnet - Guia Rápido

## 🎉 URLs ao Vivo

Após primeiro deploy, seu backend estará em:
```
https://streampay-backend.vercel.app
```

---

## ⚡ Método Mais Fácil (1 comando)

```bash
bash "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/deploy-backend-mainnet.sh"
```

**Esse script:**
✅ Valida o build automaticamente  
✅ Verifica Git status  
✅ Faz commit automático se necessário  
✅ Ativa GitHub Actions para deploy  
✅ Monitora o progresso  

---

## 📋 Método Manual (4 passos)

Se preferir fazer manualmente:

```bash
# 1. Ir para pasta do backend
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/backend"

# 2. Validar build (segurança)
npm run build

# 3. Fazer commit (se houver mudanças)
cd ..
git add .
git commit -m "feat: backend mainnet update"

# 4. Push para main (aciona deploy automático)
git push origin main
```

---

## 📊 Monitorar Deploy

### Opção 1: Acessar Site (Quando pronto)
```
https://streampay-backend.vercel.app
```

### Opção 2: GitHub Actions (Monitorar Deploy)
```bash
# Terminal - ver status em tempo real
gh action-runs list -w "Deploy Backend to Vercel (Mainnet)" --limit 1

# Ou acesse:
https://github.com/Jistriane/StreamPay-AI/actions
```

### Opção 3: Vercel Dashboard
```
https://vercel.com/dashboard
→ Clique em "backend"
→ Aba "Deployments"
→ Veja todas as URLs geradas
```

### Opção 4: Vercel CLI
```bash
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/backend"
vercel logs --follow
```

---

## 🔐 Verificação de Segurança

Deploy foi configurado com máxima segurança:

- ✅ **Nenhuma alteração de código** - Seu código não é modificado
- ✅ **Build validado** - Testa antes de enviar
- ✅ **Tokens protegidos** - GitHub Secrets, nunca visível
- ✅ **Variáveis públicas seguras** - Sem dados sensíveis
- ✅ **Database seguro** - Conexão via variável de ambiente
- ✅ **Git seguro** - Histórico completo rastreável

---

## ✅ Checklist Antes de Deploy

- [ ] Testei localmente: `npm run build` em `backend/`
- [ ] Build funciona sem erros
- [ ] Nenhuma variável sensível em `.env` ou código
- [ ] Commitei mudanças com mensagem clara
- [ ] Estou na branch `main`

---

## 🎯 O Que Acontece Automaticamente

Quando você faz `git push origin main`:

1. **GitHub Actions Aciona** (segundos)
   - Faz checkout do código
   - Instala dependências
   - Valida build

2. **Build Automático** (1-2 minutos)
   - Compila TypeScript
   - Otimiza código
   - Prepara para produção

3. **Deploy Automático** (30-60 segundos)
   - Envia para Vercel
   - Ativa mainnet (Chain ID 137)
   - Aponta para URL de produção

4. **Resultado**
   - Backend está online em https://streampay-backend.vercel.app
   - APIs disponíveis globalmente via CDN Vercel

---

## 🚨 Se der erro

### Build falha
```bash
cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/backend"
npm run build
# Veja erro detalhado
```

### Timeout no GitHub Actions
- Verificar logs em: https://github.com/Jistriane/StreamPay-AI/actions
- Se timeout, aumentar timeout no `vercel.json`

### Variáveis de ambiente incorretas
```bash
# Verificar que estão todas em mainnet
vercel env list
```

### Revert de deploy
```bash
# Se precisa reverter para versão anterior
git revert HEAD
git push origin main
# Vercel automaticamente faz deploy do commit anterior
```

### Database não conecta
```bash
# Verificar DATABASE_URL está correto em production
vercel env list | grep DATABASE_URL

# Confirmar que banco permite conexão remota
```

---

## 📞 Suporte Rápido

| Problema | Solução |
|----------|---------|
| **Não está deployando** | Verifique Actions em GitHub |
| **Build fails** | `npm run build` local para debugar |
| **Site offline** | Verifique logs em Vercel Dashboard |
| **Env variables erradas** | `vercel env pull` para sincronizar |
| **Database connection error** | Verificar DATABASE_URL em production |
| **Quer rollback** | `git revert HEAD && git push` |

---

**Setup concluído:** 11 de janeiro de 2026  
**Status:** 🟢 Pronto para deploy automático  
**Rede:** Polygon Mainnet (Chain ID: 137)  
**Framework:** Express.js/Node.js

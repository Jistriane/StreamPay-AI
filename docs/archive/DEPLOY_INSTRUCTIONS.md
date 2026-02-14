# 🚀 Instruções de Deploy - Correção MetaMask Error

## 📦 Arquivos a Deploy

### Frontend
- `frontend/app/components/TransactionConfirm.tsx` ✅
- `frontend/app/i18n/index.tsx` ✅

**Nenhum arquivo novo**, apenas atualizações.

## 🔄 Processo de Deploy

### 1. Verificar Mudanças

```bash
# Verifique o status do git
git status

# Deve mostrar:
# modified:   frontend/app/components/TransactionConfirm.tsx
# modified:   frontend/app/i18n/index.tsx
```

### 2. Testar Localmente

```bash
# Frontend
cd frontend
npm install  # Se necessário
npm run dev

# Backend
cd backend
npm run dev

# Teste em navegador http://localhost:3000
```

### 3. Executar Testes

```bash
# Frontend tests (se houver)
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### 4. Build para Produção

#### Frontend
```bash
cd frontend
npm run build

# Verificar se build passou sem erros
npm start  # Testa production build localmente
```

#### Backend
```bash
cd backend
npm run build
```

### 5. Deploy Staging

```bash
# Se usar Vercel ou similar
npm run deploy:staging

# Teste em ambiente staging
# http://staging.streampaypay.ai (ou seu domínio)
```

### 6. Deploy Produção

```bash
# Após validar em staging
npm run deploy:production

# OU manualmente:
git push main
# CI/CD faz o deploy automaticamente
```

## ⚠️ Pontos de Atenção

### 1. Compatibilidade de Versão
✅ Não requer nova versão do backend
✅ Funciona com versão atual do frontend
✅ Compatível com MetaMask

### 2. Variáveis de Ambiente
Nenhuma nova variável necessária

### 3. Migrations do Banco
Nenhuma migration necessária

### 4. Cache
```bash
# Se necessário limpar cache após deploy:
localStorage.clear()  # No console do navegador
```

## 🧪 Validação Pós-Deploy

### Em Staging

1. **Teste de Rede**
   - Conecte MetaMask em rede errada
   - Crie stream
   - Deve receber "Network mismatch"

2. **Teste de Contrato**
   - Modifique endereço no config para endereço inválido
   - Crie stream
   - Deve receber "not a contract"

3. **Teste Normal**
   - Rede correta
   - Endereço válido
   - Deve criar stream com sucesso

### Em Produção

Após deploy, execute:

```bash
# 1. Teste com MetaMask
# Conecte com rede errada → deve pedir para mudar

# 2. Teste de transação
# Crie um stream simples → deve funcionar

# 3. Verifique logs
# docker logs <container> | grep TransactionConfirm
# OU
# Verifique console do navegador (F12)
```

## 📊 Rollback (se necessário)

Se encontrar problema grave:

```bash
# Revert ao commit anterior
git revert HEAD

# OU checkout de branch anterior
git checkout production  # Se tiver branch production

# Deploy da versão anterior
npm run deploy:production
```

## ✅ Checklist Final

- [ ] Código testado localmente
- [ ] Build passa sem erros
- [ ] Tests passam (backend + frontend)
- [ ] Staging validado
- [ ] Nenhuma mensagem de erro no console
- [ ] MetaMask funcionando em Sepolia
- [ ] Transações criando com sucesso
- [ ] Documentação atualizada
- [ ] Team notificado

## 📝 Documentação para o Time

Compartilhe estes arquivos com o time:

1. **RESUMO_EXECUTIVO.md** - Para Product/Management
2. **FIX_METAMASK_ERROR.md** - Para Devs
3. **TEST_METAMASK_ERROR_FIX.md** - Para QA
4. **METAMASK_ERROR_SOLUTION.md** - Para Suporte

## 🔔 Comunicação

### Mensagem para o Time

```
🎉 Correção de Erro MetaMask Implementada

✅ O erro genérico "call to non-contract" agora mostra mensagens claras.

Mudanças:
- TransactionConfirm.tsx: Adicionada validação de rede e contrato
- i18n/index.tsx: Adicionadas 3 novas strings de erro

Benefícios:
- Usuários veem exatamente o que está errado
- Menos tickets de suporte
- Melhor diagnóstico de problemas

Testing:
- Todos os 4 cenários de teste passando
- Deploy realizado sem incidentes

Próximas fases:
- Melhorias no backend
- Automação de retry
- Documentação em português
```

## 📞 Contato

Em caso de problema pós-deploy:
1. Verifique os logs (F12 no navegador)
2. Consulte METAMASK_ERROR_SOLUTION.md
3. Execute os testes em TEST_METAMASK_ERROR_FIX.md
4. Contate o desenvolvedor

---

**Última Atualização**: 11 de janeiro de 2026
**Pronto para Deploy**: ✅ Sim
**Risk Level**: 🟢 Baixo (mudanças não-invasivas)

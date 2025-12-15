# 🧪 Guia de Validação de Integração - StreamPay AI

**Data**: 15 de Dezembro de 2025  
**Objetivo**: Validar integração completa sem dados mockados

## 📋 **Pré-requisitos**

- [ ] Stack completa instalada (`npm install` em todos os módulos)
- [ ] PostgreSQL rodando (porta 5432)
- [ ] MetaMask instalado no navegador
- [ ] Conta com Sepolia ETH (faucet: https://sepoliafaucet.com)
- [ ] Node.js v18+ instalado

## 🚀 **Passo 1: Iniciar a Stack**

```bash
# No diretório raiz do projeto
./start-stack.sh
```

Este script vai:
- ✅ Parar serviços existentes
- ✅ Iniciar Backend (porta 3001)
- ✅ Iniciar Frontend (porta 3003)  
- ✅ Iniciar ElizaOS (porta 3002)
- ✅ Aguardar cada serviço estar pronto

**Tempo estimado**: 30-60 segundos

## 🧪 **Passo 2: Executar Testes Automatizados**

### 2.1 Teste de Integração Básico

```bash
./test-integration.sh
```

**Valida**:
- ✅ Health checks de todos os serviços
- ✅ Conectividade com PostgreSQL
- ✅ Endpoints de API (com e sem auth)
- ✅ Arquivos .env presentes
- ✅ Conexão com Sepolia RPC

### 2.2 Teste End-to-End

```bash
./test-e2e.sh
```

**Simula**:
- ✅ Autenticação (com/sem JWT)
- ✅ Listagem de streams
- ✅ Criação de stream via API
- ✅ Validação de contratos no Sepolia

## 🌐 **Passo 3: Teste Manual via Interface**

### 3.1 Acessar Frontend

1. Abra o navegador em: **http://localhost:3003**
2. Verifique se a página carrega sem erros
3. Abra DevTools (F12) e verifique console

**Checklist**:
- [ ] Página carrega completamente
- [ ] Sem erros no console
- [ ] Componentes renderizam (Header, BackgroundEffects)
- [ ] ToastProvider está ativo

### 3.2 Conectar MetaMask

1. Clique em "Connect Wallet"
2. Selecione MetaMask
3. Aprove a conexão
4. Verifique se endereço aparece na UI

**Configuração Sepolia**:
```
Network Name: Sepolia
RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

### 3.3 Criar Stream (Fluxo Completo)

**Dados de Teste**:
```
Recipient: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Token: USDT Sepolia ou criar mock ERC20
Amount: 100 tokens
Duration: 86400 seconds (1 day)
```

**Passo a Passo**:
1. [ ] Preencher formulário de criação
2. [ ] Clicar "Create Stream"
3. [ ] Aprovar transação no MetaMask
4. [ ] Aguardar confirmação
5. [ ] Verificar toast de sucesso
6. [ ] Stream aparece na lista

### 3.4 Validar no Backend

```bash
# Verificar logs do backend
tail -f /tmp/backend_test.log | grep -i stream

# Consultar database diretamente
psql -U postgres -d streampay -c "SELECT * FROM streams;"
```

### 3.5 Validar no Blockchain

1. Copiar transaction hash da transação
2. Abrir: https://sepolia.etherscan.io/tx/[HASH]
3. Verificar:
   - [ ] Status: Success
   - [ ] Contract: StreamPayCore
   - [ ] Method: createStream
   - [ ] Gas usado

## 📊 **Passo 4: Testar Funcionalidades Específicas**

### 4.1 Teste de Claim

1. Aguardar alguns segundos (stream acumular fundos)
2. Usar conta do recipient
3. Chamar `claimStream(streamId)`
4. Verificar saldo aumentou

### 4.2 Teste de Cancel

1. Como sender, cancelar stream ativo
2. Verificar fundos retornados
3. Verificar status na UI

### 4.3 Teste de ElizaOS

```bash
# Enviar comando via API
curl -X POST http://localhost:3002/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "text": "create stream to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 for 1 day",
    "userId": "test-user"
  }'
```

## 🐛 **Troubleshooting**

### Backend não inicia

```bash
# Ver log completo
cat /tmp/backend_test.log

# Verificar PostgreSQL
pg_isready -h localhost -p 5432

# Testar conexão manual
psql -U postgres -h localhost -p 5432 -d streampay
```

### Frontend não carrega

```bash
# Ver log
cat /tmp/frontend_test.log

# Verificar porta
lsof -i :3003

# Rebuild
cd frontend && rm -rf .next && npm run build
```

### Transação falha

**Causas comuns**:
- [ ] Saldo insuficiente de Sepolia ETH
- [ ] Gas price muito baixo
- [ ] Contrato não deployado
- [ ] Token não aprovado (ERC20)

**Solução**:
```javascript
// Aprovar token antes de criar stream
await tokenContract.approve(streamPayCore.address, amount);
await streamPayCore.createStream(...);
```

### MetaMask não conecta

1. Verificar se está na rede Sepolia
2. Limpar cache do MetaMask
3. Resetar conta no MetaMask (Settings > Advanced)
4. Verificar se frontend tem configuração correta:

```typescript
// frontend/app/config/contracts.ts
export const CHAIN_ID = 11155111; // Sepolia
```

## ✅ **Checklist de Validação Completa**

### Infraestrutura
- [ ] Backend rodando sem erros
- [ ] Frontend acessível via browser
- [ ] ElizaOS respondendo
- [ ] PostgreSQL conectado
- [ ] Logs sendo gerados

### API Backend
- [ ] Health check retorna 200
- [ ] Autenticação JWT funciona
- [ ] GET /api/streams retorna lista
- [ ] POST /api/streams cria registro
- [ ] Validação de dados funciona

### Frontend UI
- [ ] Página carrega sem erros
- [ ] Wallet conecta (MetaMask)
- [ ] Formulário de criação funciona
- [ ] Toast notifications aparecem
- [ ] Lista de streams atualiza

### Blockchain Integration
- [ ] Transação é enviada ao Sepolia
- [ ] Confirmação recebida
- [ ] Evento StreamCreated emitido
- [ ] Estado do contrato atualizado
- [ ] Visível no Etherscan

### ElizaOS
- [ ] Responde a comandos
- [ ] Integra com backend
- [ ] Processa linguagem natural
- [ ] Retorna respostas corretas

## 📈 **Métricas de Sucesso**

| Métrica | Meta | Status |
|---------|------|--------|
| Uptime Backend | > 99% | ⏳ |
| Response Time API | < 500ms | ⏳ |
| Frontend Load Time | < 3s | ⏳ |
| Transaction Success | > 95% | ⏳ |
| Test Coverage | > 80% | ✅ 92/92 |

## 🎯 **Próximos Passos**

Após validação completa:

1. **Deploy em Staging**
   - Railway (Backend)
   - Vercel (Frontend)
   - Testar em ambiente público

2. **Testes de Carga**
   - Simular 100+ usuários simultâneos
   - Verificar limites de rate limiting
   - Monitorar uso de recursos

3. **Security Audit**
   - Verificar vulnerabilidades
   - Testar ataques comuns
   - Validar contratos com Slither

4. **Preparar Produção**
   - Configurar monitoramento (Sentry)
   - Setup de backups
   - Documentar runbooks

---

**Última atualização**: 15/12/2025  
**Responsável**: Jistriane  
**Versão**: 1.0.0

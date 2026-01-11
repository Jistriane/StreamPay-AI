# Guia de Teste - Correção do Erro MetaMask "call to non-contract"

## 🎯 Objetivo
Validar que as correções implementadas funcionam corretamente e que os erros são detectados antes de enviar transações.

## 🧪 Testes de Validação

### Teste 1: Validação de Rede (Network Mismatch)

**Objetivo**: Verificar se o sistema detecta quando a carteira está em uma rede diferente da esperada.

**Pré-requisitos:**
- MetaMask instalado
- Sepolia Testnet configurado no MetaMask
- Aplicação rodando

**Passo a Passo:**

1. Abra a aplicação no navegador
2. Conecte MetaMask à aplicação
3. **Mude MetaMask para Mainnet** (ou qualquer rede que não seja Sepolia)
4. Tente criar um stream (clique em "Create Stream" → "Confirm" → "Sign & Execute")
5. **Resultado Esperado**: 
   - Mensagem de erro: "Network mismatch: Please switch to the correct network in MetaMask."
   - **Importante**: Não deve chegar ao erro "call to non-contract"

**Validação:** ✅ Se receber mensagem clara sobre network mismatch

---

### Teste 2: Validação de Endereço Inválido (Invalid Address)

**Objetivo**: Verificar se o sistema detecta endereços de contrato malformados.

**Pré-requisitos:**
- MetaMask em Sepolia
- Acesso ao arquivo `backend/src/config/contracts.ts`

**Passo a Passo:**

1. Faça backup de `backend/src/config/contracts.ts`
   ```bash
   cp backend/src/config/contracts.ts backend/src/config/contracts.ts.backup
   ```

2. Edite o arquivo e corrompa um endereço (ex: remova alguns caracteres)
   ```typescript
   StreamPayCore: '0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c' // Faltam caracteres
   ```

3. Reinicie o servidor backend
   ```bash
   cd backend && npm start
   ```

4. Tente criar um stream
5. **Resultado Esperado**: 
   - Mensagem: "Invalid contract address detected. Please contact support."
   - Validação acontece **antes** de enviar para blockchain

6. Restaure o arquivo:
   ```bash
   cp backend/src/config/contracts.ts.backup backend/src/config/contracts.ts
   ```

**Validação:** ✅ Se receber mensagem sobre endereço inválido

---

### Teste 3: Validação de Contrato Não Encontrado (Contract Not Found)

**Objetivo**: Verificar se o sistema detecta quando o endereço não é um contrato ou não existe na rede.

**Pré-requisitos:**
- MetaMask em Sepolia
- Acesso ao arquivo de configuração

**Passo a Passo:**

1. Edite `backend/src/config/contracts.ts` e mude um endereço para um endereço válido, mas que não seja um contrato:
   ```typescript
   // Use uma wallet EOA (Externally Owned Account) válida
   StreamPayCore: '0x1234567890123456789012345678901234567890'
   ```

2. Reinicie o servidor backend

3. Conecte com MetaMask em Sepolia

4. Tente criar um stream

5. **Resultado Esperado**: 
   - Mensagem: "Address is not a contract or not found on this network. Verify deployment."
   - A validação acontece **antes** de tentar enviar

6. Restaure o arquivo original

**Validação:** ✅ Se receber mensagem sobre contrato não encontrado

---

### Teste 4: Fluxo Normal (Happy Path)

**Objetivo**: Verificar que transações válidas ainda funcionam corretamente.

**Pré-requisitos:**
- MetaMask em Sepolia
- Contratos corretamente deployados
- Saldo em USDC (ou token utilizado)
- Fundos ETH para gas

**Passo a Passo:**

1. Certifique-se que `backend/src/config/contracts.ts` tem endereços válidos
2. Abra a aplicação
3. Conecte MetaMask à rede Sepolia
4. Navegue até "Create Stream"
5. Preencha os dados:
   - Recipient: endereço válido
   - Token: USDC
   - Amount: 10
   - Duration: 3600 segundos (1 hora)
6. Clique em "Confirm"
7. Clique em "Sign & Execute"
8. **Resultado Esperado**:
   - Step "signing" → aguarda assinatura no MetaMask
   - MetaMask abre modal de assinatura
   - Assine a mensagem
   - Step "preparing" → busca transações do backend
   - Step "sending" → envia transações (aprovação + create)
   - Hashes aparecem com status "confirmed"

**Validação:** ✅ Se stream é criado e hashes aparecem

---

## 📊 Matriz de Teste Completa

| Teste | Condição | Erro Esperado | Antes | Depois |
|-------|----------|---------------|-------|--------|
| 1 | Wallet em rede errada | Network mismatch | "call to non-contract" | ✅ Claro |
| 2 | Endereço malformado | Invalid address | Erro vago | ✅ Claro |
| 3 | Contrato não existe | Contract not found | "call to non-contract" | ✅ Claro |
| 4 | Tudo correto | N/A (sucesso) | Funciona | ✅ Continua |

---

## 🔍 Verificações Técnicas

### Verificar Logs do Frontend

1. Abra o DevTools do navegador (F12)
2. Vá para a aba "Console"
3. Procure por erros relacionados a:
   - "Network mismatch"
   - "Invalid contract address"
   - "not a contract or contract not found"

### Verificar Logs do Backend

```bash
# Terminal onde backend está rodando
npm start

# Você deve ver logs de:
# POST /api/agent/execute-contract
# Signature validation
# Transaction request generation
```

---

## 🛠️ Troubleshooting

### Erro: "Cannot find module 'ethers'"
**Solução**: 
```bash
cd frontend
npm install ethers
```

### Erro: "isAddress is not a function"
**Solução**: Certifique-se que a importação de `isAddress` está correta:
```typescript
const { BrowserProvider, isAddress } = await import("ethers");
```

### Validação não aparece
**Solução**: 
1. Verifique se as strings de tradução foram adicionadas a `frontend/app/i18n/index.tsx`
2. Limpe cache: `localStorage.clear()`
3. Recarregue a página

---

## 📱 Teste em Diferentes Cenários

### Cenário A: Localhost
- Configure localhost em MetaMask
- Rode blockchain local (hardhat node)
- Use endereços de `localhost` em `contracts.ts`
- Execute testes

### Cenário B: Sepolia Testnet
- Configure Sepolia em MetaMask
- Obtém Sepolia ETH em: https://sepoliafaucet.com
- Use endereços de `sepolia` em `contracts.ts`
- Execute testes

### Cenário C: Polygon Mainnet
- Configure Polygon em MetaMask
- Use endereços de `polygon` em `contracts.ts`
- Execute testes (apenas se quiser teste em produção)

---

## ✅ Checklist Final

- [ ] Teste 1: Network Mismatch - ✅ Mensagem clara
- [ ] Teste 2: Invalid Address - ✅ Mensagem clara
- [ ] Teste 3: Contract Not Found - ✅ Mensagem clara
- [ ] Teste 4: Happy Path - ✅ Stream criado com sucesso
- [ ] Logs do frontend - ✅ Sem erros não esperados
- [ ] Logs do backend - ✅ Transações processadas
- [ ] Traduções - ✅ Mensagens em português/inglês

---

## 📝 Relatório de Teste

Após executar todos os testes, crie um relatório:

```markdown
# Relatório de Teste - Correção MetaMask Error

## Ambiente
- Navegador: [Chrome/Firefox/Safari]
- MetaMask Version: [versão]
- Rede: [Sepolia/Localhost]
- Data: [data]

## Resultados
- Teste 1 (Network Mismatch): [✅/❌]
- Teste 2 (Invalid Address): [✅/❌]
- Teste 3 (Contract Not Found): [✅/❌]
- Teste 4 (Happy Path): [✅/❌]

## Issues Encontrados
[descreva qualquer problema]

## Conclusão
[aprovado/reprovado]
```

---

**Última atualização:** 11 de janeiro de 2026

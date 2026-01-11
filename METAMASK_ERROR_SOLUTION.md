# MetaMask RPC Error: "execution reverted: Address: call to non-contract"

## 📋 Descrição do Problema

Você está recebendo o seguinte erro ao tentar executar uma transação:

```
MetaMask - RPC Error: execution reverted: Address: call to non-contract
{code: 3, message: 'execution reverted: Address: call to non-contract', ...}
```

Este erro ocorre quando o código tenta chamar uma função em um endereço que **não é um contrato válido** na blockchain. Existem várias causas possíveis:

## 🔍 Causas Principais

### 1. **Rede Incorreta no MetaMask**
- ❌ Wallet conectado à rede errada (ex: Mainnet, ao invés de Sepolia)
- ✅ Solução: Verificar e mudar para a rede correta no MetaMask

### 2. **Contrato Não Deployado**
- ❌ O endereço do contrato não está deployado na rede selecionada
- ❌ Endereço do contrato está incorreto na configuração
- ✅ Solução: Verificar `backend/src/config/contracts.ts`

### 3. **Endereço Inválido do Contrato**
- ❌ Endereço malformado ou truncado
- ✅ Solução: Validar os endereços em `CONTRACTS_CONFIG`

## 🔧 Solução Implementada

Foi adicionada **validação prévia** antes de enviar transações:

### No Frontend (`frontend/app/components/TransactionConfirm.tsx`)

```typescript
// 1️⃣ Valida rede
const network = await provider.getNetwork();
const expectedChainId = request.payload.chainId;
if (network.chainId !== expectedChainId) {
  throw new Error(t("txConfirm.networkMismatch"));
}

// 2️⃣ Valida endereço do contrato
const code = await provider.getCode(item.tx.to);
if (code === "0x") {
  throw new Error(t("txConfirm.contractNotFound"));
}
```

## ✅ Passo a Passo para Resolver

### Se o erro persistir após a atualização:

1. **Verifique a rede no MetaMask**
   - Abra a extensão MetaMask
   - Certifique-se de estar conectado à **Sepolia Testnet**
   - Se não estiver, selecione "Sepolia" na lista de redes

2. **Verifique os endereços dos contratos**
   ```bash
   # Verifique o arquivo de configuração
   cat backend/src/config/contracts.ts
   
   # Procure por "sepolia:" e confirme os endereços
   ```

3. **Se os endereços estiverem errados**
   - Re-faça o deploy dos contratos na Sepolia
   - Atualize os endereços em `backend/src/config/contracts.ts`
   - Reinicie o servidor backend

4. **Se está usando localhost**
   - Certifique-se que a blockchain local está rodando
   - Verifique a porta (padrão 8545)
   - Re-deploy dos contratos em localhost

## 📊 Configuração Esperada

### Sepolia Testnet
```typescript
sepolia: {
  chainId: 11155111,
  StreamPayCore: '0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C',
  LiquidityPool: '0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd',
  PoolManager: '0x0F71393348E7b021E64e7787956fB1e7682AB4A8',
  SwapRouter: '0x9f3d42feC59d6742CC8dC096265Aa27340C1446F',
  USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  // ... outros contratos
}
```

## 🧪 Teste a Solução

### 1. Limpe o cache local
```bash
localStorage.clear();
```

### 2. Reconecte a carteira
- Desconecte MetaMask do site
- Reconecte novamente

### 3. Teste uma transação simples
- Crie um stream básico
- Observe se a validação ocorre corretamente

## 📝 Mensagens de Erro Adicionadas

Novas traduções foram adicionadas para melhor clareza:

| Chave | Mensagem |
|-------|----------|
| `txConfirm.networkMismatch` | "Network mismatch: Please switch to the correct network in MetaMask." |
| `txConfirm.invalidAddress` | "Invalid contract address detected. Please contact support." |
| `txConfirm.contractNotFound` | "Address is not a contract or not found on this network. Verify deployment." |

## 🔗 Referências

- [MetaMask Documentation](https://docs.metamask.io/)
- [Sepolia Testnet](https://www.sepoliaethernet.com/)
- [Ethers.js Provider API](https://docs.ethers.org/v6/api/providers/)

## 📞 Suporte

Se o problema persistir:

1. Verifique os logs do servidor backend
2. Confirme que os contratos estão deployados
3. Valide os endereços dos contratos usando Etherscan
4. Limpe cache e cookies do navegador

---

**Última atualização:** 11 de janeiro de 2026

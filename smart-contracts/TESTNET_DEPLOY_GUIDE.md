# Guia: Deploy em Testnet sem Mocks

Este guia explica como configurar e deployar os contratos StreamPay em testnet usando apenas dados reais (sem mocks).

## Passo 1: Configurar Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha os valores necessários:

```bash
cp .env.example .env
```

### Variáveis Obrigatórias para Deploy em Testnet (Sepolia)

#### 1. TOKEN_ADDRESS (Token Real da Testnet)
Exemplos de tokens reais em Sepolia:
- **USDC (Circle)**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **USDT**: `0x7169D38820dfd117C3FA1f22a697dBA58d90BA06`
- **DAI**: `0x68194a729C2450ad26072b3D33ADaCbcef39D574`

```bash
TOKEN_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238  # Exemplo: USDC Sepolia
```

#### 2. UNISWAP_POSITION_MANAGER (Sepolia)
```bash
UNISWAP_POSITION_MANAGER=0x1238536071E1c677A632429e3655c799b22cDA52
```

#### 3. UNISWAP_FACTORY (Sepolia)
```bash
UNISWAP_FACTORY=0x0227628f3F023bb0B980b67D528571c95c6DaC1c
```

#### 4. Chaves e RPCs
- `SEPOLIA_RPC_URL`: Sua URL RPC (Alchemy/Infura)
- `SEPOLIA_PRIVATE_KEY`: Chave privada da conta com ETH Sepolia
- `ETHERSCAN_API_KEY`: Para verificação de contratos

#### 5. Flags
```bash
USE_MOCK=false
FORKING=false  # false para deploy real, true para testes em fork
```

## Passo 2: Testar em Fork ANTES do Deploy

Antes de fazer o deploy real, valide tudo em fork local:

### 2.1 Configurar Teste em Fork

No `.env`, adicione:
```bash
FORKING=true
TESTNET_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/SUA-API-KEY
TESTNET_TOKEN_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238  # mesmo TOKEN_ADDRESS
TESTNET_TOKEN_WHALE=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266  # conta com saldo do token
STREAM_DURATION_SECONDS=3600
```

**Como encontrar uma whale:**
1. Vá ao [Etherscan Sepolia](https://sepolia.etherscan.io/)
2. Busque o token (ex.: USDC)
3. Clique em "Holders"
4. Copie um endereço com saldo alto

### 2.2 Executar Teste em Fork

```bash
cd smart-contracts
npx hardhat test test/StreamPayCore.testnet-fork.test.ts
```

Se passar ✅, você pode prosseguir com o deploy real.

## Passo 3: Deploy Real na Testnet

### 3.1 Verificar Saldo de ETH

```bash
npx hardhat run scripts/check-balance.js --network sepolia
```

Certifique-se de ter pelo menos 0.1 ETH Sepolia. Faucets:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### 3.2 Executar Deploy

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

O script irá:
1. ✅ Deployar StreamPayCore
2. ✅ Deployar LiquidityPool
3. ✅ Deployar PoolManager (usando UNISWAP_POSITION_MANAGER e UNISWAP_FACTORY)
4. ✅ Deployar SwapRouter
5. 💾 Salvar endereços em `deployments/sepolia-<timestamp>.json`
6. 📝 Atualizar `.env.example` com endereços deployados

### 3.3 Verificar Contratos no Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> [CONSTRUCTOR_ARGS]
```

Exemplo para StreamPayCore (sem argumentos):
```bash
npx hardhat verify --network sepolia 0xSEU_ENDERECO_AQUI
```

Para PoolManager (com argumentos):
```bash
npx hardhat verify --network sepolia 0xSEU_POOL_MANAGER \
  "0x1238536071E1c677A632429e3655c799b22cDA52" \
  "0x0227628f3F023bb0B980b67D528571c95c6DaC1c"
```

## Passo 4: Testar Contrato Deployado

### 4.1 Criar Stream de Teste

Crie um script de teste `scripts/test-stream.js`:

```javascript
import hre from "hardhat";

async function main() {
  const [signer] = await hre.ethers.getSigners();
  
  const STREAM_PAY_CORE = "0xSEU_ENDERECO_DEPLOYADO";
  const TOKEN = process.env.TOKEN_ADDRESS;
  
  const streamPayCore = await hre.ethers.getContractAt("StreamPayCore", STREAM_PAY_CORE);
  const token = await hre.ethers.getContractAt("IERC20", TOKEN);
  
  const amount = hre.ethers.parseUnits("10", 6); // 10 USDC (6 decimals)
  const rate = amount / 3600n; // 10 USDC por hora
  const duration = 3600; // 1 hora
  
  console.log("Aprovando tokens...");
  await token.approve(STREAM_PAY_CORE, amount);
  
  console.log("Criando stream...");
  const tx = await streamPayCore.createStream(
    "0xRECIPIENTE_AQUI",
    TOKEN,
    amount,
    rate,
    duration
  );
  await tx.wait();
  
  console.log("✅ Stream criado com sucesso!");
}

main().catch(console.error);
```

Execute:
```bash
npx hardhat run scripts/test-stream.js --network sepolia
```

## Endereços Úteis - Sepolia

### Tokens Reais
- **USDC**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **USDT**: `0x7169D38820dfd117C3FA1f22a697dBA58d90BA06`
- **DAI**: `0x68194a729C2450ad26072b3D33ADaCbcef39D574`
- **WETH**: `0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14`

### Uniswap V3 (Sepolia)
- **Position Manager**: `0x1238536071E1c677A632429e3655c799b22cDA52`
- **Factory**: `0x0227628f3F023bb0B980b67D528571c95c6DaC1c`
- **Router**: `0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E`

## Troubleshooting

### Erro: "Insufficient deposit"
Certifique-se de que `deposit >= ratePerSecond * duration`

### Erro: "UNISWAP_POSITION_MANAGER ausente"
Defina as variáveis de ambiente antes do deploy:
```bash
export UNISWAP_POSITION_MANAGER=0x1238536071E1c677A632429e3655c799b22cDA52
export UNISWAP_FACTORY=0x0227628f3F023bb0B980b67D528571c95c6DaC1c
```

### Erro: "Transaction underpriced"
Aumente o gas price no hardhat.config.js:
```javascript
sepolia: {
  gasPrice: 20000000000, // 20 gwei
}
```

### Teste em fork não executa (fica pending)
Verifique se `FORKING=true` e `TESTNET_RPC_URL` estão definidos.

## Próximos Passos

Após deploy bem-sucedido:
1. ✅ Verificar todos os contratos no Etherscan
2. ✅ Atualizar frontend com novos endereços
3. ✅ Criar documentação da API
4. ✅ Configurar monitoramento (eventos, gas)
5. ✅ Testar integração com frontend

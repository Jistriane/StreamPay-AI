[]{#anchor}**Arquitetura Completa do StreamPay AI com MNEE**
============================================================

[]{#anchor-1}**FASE 1: REQUISITOS REVISADOS (com MNEE + Trilhas)**
------------------------------------------------------------------

### []{#anchor-2}**1.1 Mapeamento de Trilhas do Hackathon**

O StreamPay AI cobre **todas as 3 trilhas simultaneamente:**

### []{#anchor-3}**1.2 Requisitos Não-Funcionais Finais**

[]{#anchor-4}

  ----------------------------- ------------------ ---------------------------------
  **Suporte a MNEE (ERC-20)**   **Obrigatório**    Trilha do hackathon
  **Latência de Swap MNEE**     \< 2s (p95)        Chainlink Oracle + Uniswap V3
  **Slippage máximo**           \< 0.5%            Proteção contra volatilidade
  **Throughput**                100--500 TPS       Ethereum L2 (Arbitrum/Optimism)
  **Uptime Core**               99.5%              Pagamentos críticos
  **Cobertura de testes**       \>= 80%            Smart contracts + backend
  **Auditoria**                 1 auditoria leve   Pré-mainnet
  ----------------------------- ------------------ ---------------------------------

[]{#anchor-5}**FASE 2: ARQUITETURA TÉCNICA (5 Camadas Completas)**
------------------------------------------------------------------

### []{#anchor-6}**2.1 Camada 1: Smart Contracts (Solidity + Rust/Move)**

**Contratos Obrigatórios:**

#### []{#anchor-7}**A) StreamPayCore.sol** (Streaming de Pagamentos com MNEE)

solidity

[]{#anchor-8}**// SPDX-License-Identifier: MIT**

**pragma** **solidity** **\^0.8.20;**

**import** **\"\@openzeppelin/contracts/token/ERC20/IERC20.sol\";**

**import**
**\"\@openzeppelin/contracts/security/ReentrancyGuard.sol\";**

**import**
**\"\@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol\";**

**/\*\***

* *\* StreamPayCore: Streaming de pagamentos com MNEE (ERC-20)**

* *\* Trilha: IA + Pagamentos a Agentes + Finanças Programáveis**

* *\* **

* *\* Fluxo:**

* *\* 1. Empresa deposita MNEE (escrow)**

* *\* 2. Sistema calcula MNEE/segundo**

* *\* 3. A cada minuto/hora, AI decide: swap MNEE → cripto preferida?**

* *\* 4. Freelancer recebe em tempo real (sem delays)**

* *\* 5. IA faz hedge automático se volatilidade \> 2%**

* *\*/**

**contract** **StreamPayCore** **is** **ReentrancyGuard {**

* *// ============ STATE VARIABLES ============**

* *// MNEE token (Ethereum mainnet)**

* *IERC20 public** **constant** **MNEE\_TOKEN =** **

* *IERC20(0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF);**

* *// Chainlink Oracle para MNEE/USD**

* *AggregatorV3Interface public** **mneeOracle;**

* *// Endereço do AI Agent (ElizaOS)**

* *address** **public** **aiAgent;**

* *// Endereço do router Uniswap V3**

* *address** **public** **uniswapRouter;**

* *struct** **Stream** **{**

* *address** **company;** **// Pagadora**

* *address** **freelancer;** **// Recebedora**

* *uint256** **amountPerSecond;** **// MNEE/segundo**

* *uint256** **startTime;** **// Timestamp início**

* *uint256** **endTime;** **// Timestamp fim**

* *address** **outputToken;** **// Token de saída (USDT, USDC, ETH,
etc.)**

* *uint256** **totalDeposited;** **// Total MNEE depositado**

* *uint256** **totalWithdrawn;** **// Total já retirado**

* *bool** **active;** **// Status**

* *bool** **hedged;** **// Flag: foi feito hedge?**

* *}**

* *mapping(uint256** **=\>** **Stream)** **public** **streams;**

* *mapping(address** **=\>** **uint256\[\])** **public**
**userStreams;**

* *uint256** **public** **streamCounter;**

* *// Histórico de hedges (auditoria)**

* *struct** **HedgeRecord** **{**

* *uint256** **streamId;**

* *uint256** **timestamp;**

* *uint256** **mneeAmount;**

* *uint256** **outputAmount;**

* *address** **outputToken;**

* *uint256** **volatilityPercent;**

* *}**

* *HedgeRecord\[\]** **public** **hedgeHistory;**

* *// ============ EVENTS ============**

* *event** **StreamCreated(**

* *uint256** **indexed** **streamId,**

* *address** **indexed** **company,**

* *address** **indexed** **freelancer,**

* *uint256** **amountPerSecond,**

* *uint256** **totalAmount,**

* *address** **outputToken,**

* *uint256** **duration**

* *);**

* *event** **StreamUpdated(**

* *uint256** **indexed** **streamId,**

* *bool** **active,**

* *uint256** **timestamp**

* *);**

* *event** **PaymentStreamed(**

* *uint256** **indexed** **streamId,**

* *address** **indexed** **freelancer,**

* *uint256** **mneeAmount,**

* *uint256** **outputAmount,**

* *address** **outputToken,**

* *uint256** **timestamp**

* *);**

* *event** **HedgeExecuted(**

* *uint256** **indexed** **streamId,**

* *uint256** **mneeAmount,**

* *uint256** **outputAmount,**

* *uint256** **volatilityPercent,**

* *uint256** **timestamp**

* *);**

* *// ============ MODIFIERS ============**

* *modifier** **onlyAIAgent()** **{**

* *require(msg.sender ==** **aiAgent,** **\"Only AI Agent can call\");**

* *\_;**

* *}**

* *modifier** **streamExists(uint256** **\_streamId)** **{**

* *require(\_streamId \<** **streamCounter,** **\"Stream does not
exist\");**

* *\_;**

* *}**

* *// ============ CONSTRUCTOR ============**

* *constructor(**

* *address** **\_mneeOracle,**

* *address** **\_aiAgent,**

* *address** **\_uniswapRouter**

* *)** **{**

* *mneeOracle =** **AggregatorV3Interface(\_mneeOracle);**

* *aiAgent =** **\_aiAgent;**

* *uniswapRouter =** **\_uniswapRouter;**

* *}**

* *// ============ CORE FUNCTIONS ============**

* */\*\***

* *\* Criar stream de pagamento em MNEE**

* *\* **

* *\* \@param \_freelancer Endereço do freelancer**

* *\* \@param \_totalAmount Total em MNEE (18 decimals)**

* *\* \@param \_duration Duração em segundos**

* *\* \@param \_outputToken Token de saída (USDT, USDC, ETH, etc.)**

* *\*/**

* *function** **createStream(**

* *address** **\_freelancer,**

* *uint256** **\_totalAmount,**

* *uint256** **\_duration,**

* *address** **\_outputToken**

* *)** **external** **nonReentrant returns** **(uint256)** **{**

* *require(\_freelancer !=** **address(0),** **\"Invalid
freelancer\");**

* *require(\_totalAmount \>** **0,** **\"Amount must be \> 0\");**

* *require(\_duration \>** **0,** **\"Duration must be \> 0\");**

* *require(\_outputToken !=** **address(0),** **\"Invalid output
token\");**

* *// Transferir MNEE da empresa para contrato (escrow)**

* *require(**

* *MNEE\_TOKEN.transferFrom(msg.sender,** **address(this),**
**\_totalAmount),**

* *\"MNEE transfer failed\"**

* *);**

* *uint256** **amountPerSecond =** **\_totalAmount /** **\_duration;**

* *require(amountPerSecond \>** **0,** **\"Amount per second too
small\");**

* *uint256** **streamId =** **streamCounter;**

* *streams\[streamId\]** **=** **Stream({**

* *company:** **msg.sender,**

* *freelancer:** **\_freelancer,**

* *amountPerSecond:** **amountPerSecond,**

* *startTime:** **block.timestamp,**

* *endTime:** **block.timestamp +** **\_duration,**

* *outputToken:** **\_outputToken,**

* *totalDeposited:** **\_totalAmount,**

* *totalWithdrawn:** **0,**

* *active:** **true,**

* *hedged:** **false**

* *});**

* *userStreams\[msg.sender\].push(streamId);**

* *userStreams\[\_freelancer\].push(streamId);**

* *emit** **StreamCreated(**

* *streamId,**

* *msg.sender,**

* *\_freelancer,**

* *amountPerSecond,**

* *\_totalAmount,**

* *\_outputToken,**

* *\_duration**

* *);**

* *streamCounter++;**

* *return** **streamId;**

* *}**

* */\*\***

* *\* Calcular quanto o freelancer já recebeu (em MNEE)**

* *\*/**

* *function** **getStreamedAmount(uint256** **\_streamId)** **

* *external** **

* *view** **

* *streamExists(\_streamId)** **

* *returns** **(uint256)** **

* *{**

* *Stream storage** **stream =** **streams\[\_streamId\];**

* *if** **(!stream.active)** **return** **stream.totalWithdrawn;**

* *uint256** **elapsed =** **block.timestamp \>** **stream.endTime **

* *?** **stream.endTime -** **stream.startTime **

* *:** **block.timestamp -** **stream.startTime;**

* *uint256** **accrued =** **stream.amountPerSecond \*** **elapsed;**

* *// Não pode exceder o total depositado**

* *return** **accrued \>** **stream.totalDeposited **

* *?** **stream.totalDeposited **

* *:** **accrued;**

* *}**

* */\*\***

* *\* AI Agent: Executar swap automático (MNEE → outputToken)**

* *\* Chamado a cada minuto/hora pelo ElizaOS**

* *\* **

* *\* \@param \_streamId ID do stream**

* *\* \@param \_mneeAmount Quantidade MNEE a converter**

* *\* \@param \_minOutputAmount Slippage protection**

* *\* \@param \_volatilityPercent Volatilidade detectada (para
auditoria)**

* *\*/**

* *function** **executeAISwap(**

* *uint256** **\_streamId,**

* *uint256** **\_mneeAmount,**

* *uint256** **\_minOutputAmount,**

* *uint256** **\_volatilityPercent**

* *)** **

* *external** **

* *onlyAIAgent **

* *nonReentrant **

* *streamExists(\_streamId)** **

* *{**

* *Stream storage** **stream =** **streams\[\_streamId\];**

* *require(stream.active,** **\"Stream not active\");**

* *require(\_mneeAmount \>** **0,** **\"Amount must be \> 0\");**

* *require(\_mneeAmount \<=** **stream.totalDeposited -**
**stream.totalWithdrawn,** **

* *\"Insufficient balance\");**

* *// Simular swap via Uniswap V3 (em produção, usar router real)**

* *// Aqui apenas registramos a intenção; o backend faz o swap real**

* *uint256** **outputAmount =** **\_mneeAmount;** **// Placeholder (será
calculado via oracle)**

* *// Atualizar ledger**

* *stream.totalWithdrawn +=** **\_mneeAmount;**

* *stream.hedged =** **(\_volatilityPercent \>** **200);** **// \> 2%**

* *// Registrar hedge (auditoria)**

* *hedgeHistory.push(HedgeRecord({**

* *streamId:** **\_streamId,**

* *timestamp:** **block.timestamp,**

* *mneeAmount:** **\_mneeAmount,**

* *outputAmount:** **outputAmount,**

* *outputToken:** **stream.outputToken,**

* *volatilityPercent:** **\_volatilityPercent**

* *}));**

* *emit** **HedgeExecuted(**

* *\_streamId,**

* *\_mneeAmount,**

* *outputAmount,**

* *\_volatilityPercent,**

* *block.timestamp**

* *);**

* *}**

* */\*\***

* *\* Pausar/Retomar stream**

* *\*/**

* *function** **toggleStream(uint256** **\_streamId,** **bool**
**\_active)** **

* *external** **

* *streamExists(\_streamId)** **

* *{**

* *Stream storage** **stream =** **streams\[\_streamId\];**

* *require(msg.sender ==** **stream.company,** **\"Only company can
toggle\");**

* *stream.active =** **\_active;**

* *emit** **StreamUpdated(\_streamId,** **\_active,**
**block.timestamp);**

* *}**

* */\*\***

* *\* Cancelar stream e retornar MNEE não utilizado**

* *\*/**

* *function** **cancelStream(uint256** **\_streamId)** **

* *external** **

* *nonReentrant **

* *streamExists(\_streamId)** **

* *{**

* *Stream storage** **stream =** **streams\[\_streamId\];**

* *require(msg.sender ==** **stream.company,** **\"Only company can
cancel\");**

* *require(stream.active,** **\"Stream already inactive\");**

* *uint256** **remaining =** **stream.totalDeposited -**
**stream.totalWithdrawn;**

* *require(remaining \>** **0,** **\"No MNEE to return\");**

* *stream.active =** **false;**

* *// Retornar MNEE não utilizado**

* *require(MNEE\_TOKEN.transfer(stream.company,** **remaining),** **

* *\"Return transfer failed\");**

* *emit** **StreamUpdated(\_streamId,** **false,** **block.timestamp);**

* *}**

* *// ============ VIEW FUNCTIONS ============**

* */\*\***

* *\* Obter histórico de hedges (auditoria)**

* *\*/**

* *function** **getHedgeHistory(uint256** **\_streamId)** **

* *external** **

* *view** **

* *returns** **(HedgeRecord\[\]** **memory)** **

* *{**

* *HedgeRecord\[\]** **memory** **result =** **new**
**HedgeRecord\[\](hedgeHistory.length);**

* *uint256** **count =** **0;**

* *for** **(uint256** **i =** **0;** **i \<** **hedgeHistory.length;**
**i++)** **{**

* *if** **(hedgeHistory\[i\].streamId ==** **\_streamId)** **{**

* *result\[count\]** **=** **hedgeHistory\[i\];**

* *count++;**

* *}**

* *}**

* *// Redimensionar array**

* *HedgeRecord\[\]** **memory** **filtered =** **new**
**HedgeRecord\[\](count);**

* *for** **(uint256** **i =** **0;** **i \<** **count;** **i++)** **{**

* *filtered\[i\]** **=** **result\[i\];**

* *}**

* *return** **filtered;**

* *}**

* */\*\***

* *\* Obter preço MNEE/USD via Chainlink**

* *\*/**

* *function** **getMNEEPrice()** **external** **view** **returns**
**(uint256)** **{**

* *(,** **int256** **price,** **,** **,** **)** **=**
**mneeOracle.latestRoundData();**

* *require(price \>** **0,** **\"Invalid price\");**

* *return** **uint256(price);**

* *}**

**}**

#### []{#anchor-9}**B) LiquidityPool.sol** (Gerenciamento de Pools MNEE - Stables)

solidity

[]{#anchor-10}**// SPDX-License-Identifier: MIT**

**pragma** **solidity** **\^0.8.20;**

**import** **\"\@openzeppelin/contracts/token/ERC20/IERC20.sol\";**

**/\*\***

* *\* LiquidityPool: Gerencia pools MNEE/USDT, MNEE/USDC, etc.**

* *\* Integrado com Uniswap V3 para swaps otimizados**

* *\*/**

**contract** **LiquidityPool** **{**

* *IERC20 public** **mneeToken;**

* *IERC20 public** **stableToken;** **// USDT, USDC, etc.**

* *uint256** **public** **mneeReserve;**

* *uint256** **public** **stableReserve;**

* *event** **LiquidityAdded(uint256** **mneeAmount,** **uint256**
**stableAmount);**

* *event** **LiquidityRemoved(uint256** **mneeAmount,** **uint256**
**stableAmount);**

* *event** **Swapped(address** **indexed** **user,** **uint256**
**amountIn,** **uint256** **amountOut);**

* *constructor(address** **\_mnee,** **address** **\_stable)** **{**

* *mneeToken =** **IERC20(\_mnee);**

* *stableToken =** **IERC20(\_stable);**

* *}**

* */\*\***

* *\* Adicionar liquidez ao pool (para provedores de liquidez)**

* *\*/**

* *function** **addLiquidity(uint256** **\_mneeAmount,** **uint256**
**\_stableAmount)** **external** **{**

* *mneeToken.transferFrom(msg.sender,** **address(this),**
**\_mneeAmount);**

* *stableToken.transferFrom(msg.sender,** **address(this),**
**\_stableAmount);**

* *mneeReserve +=** **\_mneeAmount;**

* *stableReserve +=** **\_stableAmount;**

* *emit** **LiquidityAdded(\_mneeAmount,** **\_stableAmount);**

* *}**

* */\*\***

* *\* Swap MNEE → Stable (via Uniswap V3 ou AMM simples)**

* *\*/**

* *function** **swapMNEEForStable(uint256** **\_mneeAmount)** **

* *external** **

* *returns** **(uint256** **stableOut)** **

* *{**

* *require(\_mneeAmount \>** **0,** **\"Invalid amount\");**

* *require(mneeReserve \>** **0** **&&** **stableReserve \>** **0,**
**\"Insufficient liquidity\");**

* *// Fórmula AMM simples: x \* y = k**

* *stableOut =** **(\_mneeAmount \*** **stableReserve)** **/**
**(mneeReserve +** **\_mneeAmount);**

* *mneeToken.transferFrom(msg.sender,** **address(this),**
**\_mneeAmount);**

* *stableToken.transfer(msg.sender,** **stableOut);**

* *mneeReserve +=** **\_mneeAmount;**

* *stableReserve -=** **stableOut;**

* *emit** **Swapped(msg.sender,** **\_mneeAmount,** **stableOut);**

* *return** **stableOut;**

* *}**

**}**

### []{#anchor-11}**2.2 Camada 2: Backend (Node.js + ElizaOS + Python)**

**Arquitetura de Microsserviços:**

yaml

[]{#anchor-12}**\# docker-compose.yml (MVP)**

**version:** **\'3.8\'**

**services:**

* *\# ============ CORE SERVICES ============**

* *payment-streaming-service:**

* *image:** **streampay/payment-streaming:latest**

* *environment:**

* *-** **MNEE\_CONTRACT=0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF**

* *-**
**ETHEREUM\_RPC=https://eth-mainnet.g.alchemy.com/v2/\${ALCHEMY\_KEY}**

* *-** **MORALIS\_API\_KEY=\${MORALIS\_API\_KEY}**

* *ports:**

* *-** **\"3001:3001\"**

* *depends\_on:**

* *-** **postgres**

* *-** **redis**

* *volumes:**

* *-** **./logs:/app/logs**

* *networks:**

* *-** **streampay-network**

* *ai-liquidity-agent:**

* *image:** **streampay/ai-agent:latest**

* *environment:**

* *-** **ELIZAOS\_MODEL=gpt-4**

* *-** **CHAINLINK\_ORACLE=\${CHAINLINK\_ORACLE}**

* *-** **UNISWAP\_ROUTER=\${UNISWAP\_ROUTER}**

* *-** **VOLATILITY\_THRESHOLD=2.0 **\# 2%**

* *ports:**

* *-** **\"3002:3002\"**

* *depends\_on:**

* *-** **postgres**

* *-** **redis**

* *-** **payment-streaming-service**

* *networks:**

* *-** **streampay-network**

* *compliance-service:**

* *image:** **streampay/compliance:latest**

* *environment:**

* *-** **SUMSUB\_API\_KEY=\${SUMSUB\_API\_KEY}**

* *-** **KYC\_THRESHOLD=1000 **\# \$1000 USD**

* *ports:**

* *-** **\"3003:3003\"**

* *networks:**

* *-** **streampay-network**

* *notification-service:**

* *image:** **streampay/notifications:latest**

* *environment:**

* *-** **TWILIO\_SID=\${TWILIO\_SID}**

* *-** **SENDGRID\_API\_KEY=\${SENDGRID\_API\_KEY}**

* *ports:**

* *-** **\"3004:3004\"**

* *depends\_on:**

* *-** **redis**

* *networks:**

* *-** **streampay-network**

* *\# ============ DATA LAYER ============**

* *postgres:**

* *image:** **postgres:15-alpine**

* *environment:**

* *-** **POSTGRES\_DB=streampay**

* *-** **POSTGRES\_USER=streampay**

* *-** **POSTGRES\_PASSWORD=\${DB\_PASSWORD}**

* *volumes:**

* *-** **postgres\_data:/var/lib/postgresql/data**

* *networks:**

* *-** **streampay-network**

* *redis:**

* *image:** **redis:7-alpine**

* *ports:**

* *-** **\"6379:6379\"**

* *networks:**

* *-** **streampay-network**

* *\# ============ BLOCKCHAIN INDEXING ============**

* *moralis-indexer:**

* *image:** **streampay/moralis-indexer:latest**

* *environment:**

* *-** **MORALIS\_API\_KEY=\${MORALIS\_API\_KEY}**

* *-** **STREAM\_CONTRACT=\${STREAM\_CONTRACT\_ADDRESS}**

* *networks:**

* *-** **streampay-network**

**volumes:**

* *postgres\_data:**

**networks:**

* *streampay-network:**

* *driver:** **bridge**

**Serviço Principal: Payment Streaming Service (Node.js)**

typescript

[]{#anchor-13}**// src/services/PaymentStreamingService.ts**

**import** **{** **ethers }** **from** **\'ethers\';**

**import** **{** **Moralis }** **from** **\'moralis\';**

**import** **Redis from** **\'redis\';**

**class** **PaymentStreamingService** **{**

* *private** **provider:** **ethers.Provider;**

* *private** **streamContract:** **ethers.Contract;**

* *private** **redis:** **Redis.RedisClient;**

* *private** **aiAgent:** **AILiquidityAgent;**

* *constructor()** **{**

* *this.provider =** **new**
**ethers.JsonRpcProvider(process.env.ETHEREUM\_RPC);**

* *this.redis =** **Redis.createClient({** **host:** **\'redis\',**
**port:** **6379** **});**

* *this.aiAgent =** **new** **AILiquidityAgent();**

* *}**

* */\*\***

* *\* Iniciar listener de eventos de streams**

* *\* Chamado a cada minuto/hora para processar pagamentos**

* *\*/**

* *async** **startStreamProcessor()** **{**

* *setInterval(async** **()** **=\>** **{**

* *await** **this.processActiveStreams();**

* *},** **60000);** **// A cada minuto**

* *}**

* */\*\***

* *\* Processar streams ativos**

* *\* 1. Calcular MNEE acumulado**

* *\* 2. Consultar preço MNEE/USD via Chainlink**

* *\* 3. Decidir: fazer swap agora?**

* *\* 4. Executar swap via Uniswap V3**

* *\* 5. Registrar em ledger**

* *\*/**

* *async** **processActiveStreams()** **{**

* *console.log(\'\[StreamProcessor\] Iniciando processamento\...\');**

* *try** **{**

* *// 1. Buscar streams ativos do banco de dados**

* *const** **activeStreams =** **await**
**this.getActiveStreamsFromDB();**

* *for** **(const** **stream of** **activeStreams)** **{**

* *// 2. Calcular MNEE acumulado desde último processamento**

* *const** **mneeAccrued =** **await**
**this.calculateAccruedMNEE(stream.id);**

* *if** **(mneeAccrued \<=** **0)** **continue;**

* *// 3. Consultar preço MNEE via Chainlink**

* *const** **mneePrice =** **await** **this.getMNEEPrice();**

* *const** **volatility =** **await**
**this.calculateVolatility(stream.id);**

* *console.log(\`\[Stream \${stream.id}\] MNEE acumulado:
\${mneeAccrued}, Volatilidade: \${volatility}%\`);**

* *// 4. AI Agent decide: fazer swap?**

* *const** **shouldSwap =** **await**
**this.aiAgent.decideShouldSwap({**

* *streamId:** **stream.id,**

* *mneeAmount:** **mneeAccrued,**

* *mneePrice,**

* *volatility,**

* *outputToken:** **stream.outputToken**

* *});**

* *if** **(shouldSwap)** **{**

* *// 5. Executar swap via Uniswap V3**

* *const** **swapResult =** **await** **this.executeSwap(**

* *stream.id,**

* *mneeAccrued,**

* *stream.outputToken,**

* *volatility**

* *);**

* *console.log(\`\[Stream \${stream.id}\] Swap executado:
\${swapResult.outputAmount}** **\${stream.outputToken}\`);**

* *// 6. Registrar em ledger (auditável)**

* *await** **this.recordSwapInLedger(stream.id,** **swapResult);**

* *// 7. Notificar freelancer**

* *await** **this.notifyFreelancer(stream.freelancer,** **swapResult);**

* *}**

* *}**

* *}** **catch** **(error)** **{**

* *console.error(\'\[StreamProcessor\] Erro:\',** **error);**

* *}**

* *}**

* */\*\***

* *\* Calcular MNEE acumulado desde último processamento**

* *\*/**

* *async** **calculateAccruedMNEE(streamId:** **number):**
**Promise\<number\>** **{**

* *const** **stream =** **await** **this.getStreamFromDB(streamId);**

* *const** **now =** **Math.floor(Date.now()** **/** **1000);**

* *const** **lastProcessed =** **stream.lastProcessedAt \|\|**
**stream.startTime;**

* *const** **elapsed =** **now -** **lastProcessed;**

* *const** **accrued =** **stream.amountPerSecond \*** **elapsed;**

* *return** **Math.min(accrued,** **stream.totalDeposited -**
**stream.totalWithdrawn);**

* *}**

* */\*\***

* *\* Calcular volatilidade MNEE (últimas 24h)**

* *\*/**

* *async** **calculateVolatility(streamId:** **number):**
**Promise\<number\>** **{**

* *const** **priceHistory =** **await**
**this.redis.get(\`price\_history:\${streamId}\`);**

* *// Implementar cálculo de volatilidade (desvio padrão)**

* *return** **1.5;** **// Placeholder**

* *}**

* */\*\***

* *\* Executar swap MNEE → outputToken via Uniswap V3**

* *\*/**

* *async** **executeSwap(**

* *streamId:** **number,**

* *mneeAmount:** **number,**

* *outputToken:** **string,**

* *volatility:** **number**

* *):** **Promise\<{** **outputAmount:** **number;** **txHash:**
**string** **}\>** **{**

* *// Chamar contrato StreamPayCore.executeAISwap()**

* *const** **tx =** **await** **this.streamContract.executeAISwap(**

* *streamId,**

* *ethers.parseEther(mneeAmount.toString()),**

* *0,** **// minOutputAmount (será calculado com slippage)**

* *Math.floor(volatility \*** **100)** **// volatility em basis points**

* *);**

* *const** **receipt =** **await** **tx.wait();**

* *return** **{**

* *outputAmount:** **mneeAmount \*** **0.99,** **// Placeholder (será
calculado via oracle)**

* *txHash:** **receipt.transactionHash**

* *};**

* *}**

* */\*\***

* *\* Obter preço MNEE/USD via Chainlink**

* *\*/**

* *async** **getMNEEPrice():** **Promise\<number\>** **{**

* *const** **price =** **await** **this.streamContract.getMNEEPrice();**

* *return** **parseFloat(ethers.formatUnits(price,** **8));**

* *}**

* *// ============ HELPER FUNCTIONS ============**

* *async** **getActiveStreamsFromDB()** **{**

* *// Implementar query ao PostgreSQL**

* *return** **\[\];**

* *}**

* *async** **getStreamFromDB(streamId:** **number)** **{**

* *// Implementar query ao PostgreSQL**

* *return** **{};**

* *}**

* *async** **recordSwapInLedger(streamId:** **number,** **swapResult:**
**any)** **{**

* *// Registrar em banco de dados para auditoria**

* *}**

* *async** **notifyFreelancer(freelancerAddress:** **string,**
**swapResult:** **any)** **{**

* *// Enviar notificação via Twilio/SendGrid**

* *}**

**}**

**export** **default** **PaymentStreamingService;**

### []{#anchor-14}**2.3 Camada 3: AI Agent (ElizaOS)**

**Configuração do Agente de IA:**

typescript

[]{#anchor-15}**// src/agents/LiquidityAIAgent.ts**

**import** **{** **ElizaOS }** **from** **\'elizaos\';**

**import** **{** **ChainlinkOracle }** **from**
**\'./oracles/ChainlinkOracle\';**

**import** **{** **UniswapV3Router }** **from**
**\'./routers/UniswapV3Router\';**

**class** **LiquidityAIAgent** **extends** **ElizaOS** **{**

* *private** **chainlink:** **ChainlinkOracle;**

* *private** **uniswap:** **UniswapV3Router;**

* *constructor()** **{**

* *super({**

* *name:** **\'StreamPay Liquidity AI\',**

* *model:** **\'gpt-4\',**

* *systemPrompt:** **\`**

* *Você é um agente de IA especializado em gerenciamento de liquidez e
hedging.**

* *Suas responsabilidades:**

* *1. Monitorar preço MNEE em tempo real via Chainlink**

* *2. Calcular volatilidade (desvio padrão das últimas 24h)**

* *3. Decidir: \"Fazer swap MNEE → Stable agora?\"**

* *4. Executar swaps otimizados via Uniswap V3**

* *5. Registrar todas as decisões em ledger (auditável)**

* *Regras de decisão:**

* *- Se volatilidade \> 2%: fazer hedge (converter MNEE → USDT/USDC)**

* *- Se slippage \> 0.5%: aguardar melhor momento**

* *- Se liquidez \< \$10k: alertar operador**

* *Objetivo: Proteger freelancers contra volatilidade, minimizando
custos de transação.**

* *\`**

* *});**

* *this.chainlink =** **new** **ChainlinkOracle();**

* *this.uniswap =** **new** **UniswapV3Router();**

* *}**

* */\*\***

* *\* Decidir se deve fazer swap**

* *\*/**

* *async** **decideShouldSwap(context:** **{**

* *streamId:** **number;**

* *mneeAmount:** **number;**

* *mneePrice:** **number;**

* *volatility:** **number;**

* *outputToken:** **string;**

* *}):** **Promise\<boolean\>** **{**

* *const** **decision =** **await** **this**

\

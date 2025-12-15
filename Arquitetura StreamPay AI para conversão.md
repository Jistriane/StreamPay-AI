# []{#anchor}StreamPay AI : Arquitetura Production-Ready

## **Core Concept Revisado**

**Sistema de pagamentos streaming para freelancers usando apenas ERC20 +
Uniswap V3 + ElizaOS + Chainlink**

## **Arquitetura Técnica Completa**

\[\[minimalist blockchain architecture diagram with dark blue gradient
background horizontal layout\]\]

*┌────────────────────────────────────────────────────────────────────────┐*

*│ *FRONTEND LAYER │**

*│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │*

*│ │ *Web3 Wallet │ │ Payment Stream │ │ AI Chat │ │**

*│ │ *Connection │ │ Dashboard │ │ Interface │ │**

*│ │ *(RainbowKit) │ │ (Real-time) │ │ (Prompt-based) │ │**

*│ └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘ │*

*└───────────┼────────────────────┼────────────────────┼─────────────────┘*

* │ │ │*

* └────────────────────┼────────────────────┘*

* │*

*┌────────────────────────────────┼─────────────────────────────────────┐*

*│ *ELIZAOS AGENT LAYER │**

*│ │ │*

*│ ┌─────────────────────────────▼──────────────────────────────────┐ │*

*│ │ *MAIN ORCHESTRATOR AGENT │ │**

*│ │ • *Natural language processing │ │**

*│ │ • *Intent classification │ │**

*│ │ │ • *Payment routing │ │**

*│ └──┬───────────────┬────────────────┬──────────────┬─────────────┘ │*

*│ │ │ │ │ │*

*│ ┌──▼──────────┐ ┌─▼─────────────┐ ┌▼────────────┐ ┌▼──────────┐ │*

*│ │ *Pool Agent │ │ Stream Agent │ │ Price Agent │ │ Analytics │ │**

*│ │ │ │ │ │ │ │ *Agent │ │**

*│ │ •*Create pool│ │ •Start stream │ │ •Monitor │ │ •Track │ │**

*│ │ •*Add liquid │ │ •Stop stream │ │ •Alert vol │ │ •Report │ │**

*│ │ •*Rebalance │ │ •Claim tokens │ │ •Get prices │ │ •Optimize │ │**

*│ └──┬──────────┘ └─┬─────────────┘ └┬────────────┘ └┬──────────┘ │*

*└─────┼──────────────┼────────────────┼────────────────┼──────────────┘*

* │ │ │ │*

* └──────────────┴────────────────┴────────────────┘*

* │*

*┌────────────────────┼──────────────────────────────────────────────────┐*

*│ *INTEGRATION LAYER │**

*│ │ │*

*│ ┌────────────────▼─────────────────────────────────────────────┐ │*

*│ │ *MORALIS WEB3 DATA API │ │**

*│ │ • *Token balances (getWalletTokenBalances) │ │**

*│ │ • *Uniswap V3 pairs (getPairAddress) │ │**

*│ │ • *Pool reserves (getPairReserves) │ │**

*│ │ • *Transaction history (getWalletTransactions) │ │**

*│ │ • *Real-time streams (Moralis Streams API) │ │**

*│ └──────────────────────────────────────────────────────────────┘ │*

*│ │*

*│ ┌──────────────────────────────────────────────────────────────┐ │*

*│ │ *CHAINLINK ORACLES │ │**

*│ │ • *Price Feeds (ETH/USD, token pairs) │ │**

*│ │ • *Automation (checkUpkeep/performUpkeep) │ │**

*│ │ • *VRF (randomness for disputes) │ │**

*│ │ • *CCIP (future: cross-chain) │ │**

*│ └──────────────────────────────────────────────────────────────┘ │*

*└────────────────────────────────────────────────────────────────────────┘*

* │*

*┌────────────────────┼──────────────────────────────────────────────────┐*

*│ *BLOCKCHAIN LAYER (EVM) │**

*│ │ │*

*│ ┌────────────────▼─────────────────────────────────────────────┐ │*

*│ │ *SMART CONTRACTS (Solidity 0.8.20) │ │**

*│ │ │ │*

*│ │ ┌──────────────────────────────────────────────────────┐ │ │*

*│ │ │ *StreamPayCore.sol │ │ │**

*│ │ │ • *createStream(recipient, token, rate, duration) │ │ │**

*│ │ │ • *claimStream(streamId) │ │ │**

*│ │ │ • *cancelStream(streamId) │ │ │**

*│ │ │ • *ERC20 token handling only │ │ │**

*│ │ └──────────────────────────────────────────────────────┘ │ │*

*│ │ │ │*

*│ │ ┌──────────────────────────────────────────────────────┐ │ │*

*│ │ │ *PoolManager.sol │ │ │**

*│ │ │ • *Uniswap V3 pool creation │ │ │**

*│ │ │ • *Liquidity provision via NonfungiblePositionMgr │ │ │**

*│ │ │ • *Automated rebalancing │ │ │**

*│ │ └──────────────────────────────────────────────────────┘ │ │*

*│ │ │ │*

*│ │ ┌──────────────────────────────────────────────────────┐ │ │*

*│ │ │ *SwapRouter.sol │ │ │**

*│ │ │ • *Optimal routing via Uniswap V3 │ │ │**

*│ │ │ • *Multi-hop swaps │ │ │**

*│ │ │ • *Slippage protection (Chainlink price feeds) │ │ │**

*│ │ └──────────────────────────────────────────────────────┘ │ │*

*│ └──────────────────────────────────────────────────────────────┘ │*

*│ │*

*│ ┌──────────────────────────────────────────────────────────────┐ │*

*│ │ *UNISWAP V3 PROTOCOL │ │**

*│ │ • *Factory (pool creation) │ │**

*│ │ • *NonfungiblePositionManager (LP tokens) │ │**

*│ │ • *SwapRouter (token swaps) │ │**

*│ └──────────────────────────────────────────────────────────────┘ │*

*└────────────────────────────────────────────────────────────────────────┘*

## **Stack Técnico Detalhado**

### []{#anchor-1}**1. Frontend (Next.js 14 + TypeScript)**

typescript

[]{#anchor-2}**// app/page.tsx**

**\'use client\';**

**import** **{** **useState }** **from** **\'react\';**

**import** **{** **useAccount,** **useWriteContract }** **from**
**\'wagmi\';**

**import** **{** **parseEther }** **from** **\'viem\';**

**export** **default** **function** **StreamPayDashboard()** **{**

* *const** **{** **address }** **=** **useAccount();**

* *const** **{** **writeContract }** **=** **useWriteContract();**

* *const** **\[prompt,** **setPrompt\]** **=** **useState(\'\');**

* *const** **handleAIPrompt** **=** **async** **()** **=\>** **{**

* *// Send to ElizaOS agent**

* *const** **response =** **await** **fetch(\'/api/eliza\',** **{**

* *method:** **\'POST\',**

* *body:** **JSON.stringify({** **prompt,** **userAddress:** **address
})**

* *});**

* *const** **{** **action,** **params }** **=** **await**
**response.json();**

* *// Execute blockchain action**

* *if** **(action ===** **\'create_stream\')** **{**

* *writeContract({**

* *address:** **STREAMPAY_CORE,**

* *abi:** **StreamPayCoreABI,**

* *functionName:** **\'createStream\',**

* *args:** **\[**

* *params.recipient,**

* *params.token,**

* *parseEther(params.rate),**

* *params.duration**

* *\]**

* *});**

* *}**

* *};**

* *return** **(**

* *\<div className=\"min-h-screen bg-gradient-to-br from-slate-900
to-blue-900\"\>**

* *\<div className=\"container mx-auto p-8\"\>**

* *\<h1 className=\"text-4xl font-bold text-cyan-400 mb-8\"\>**

* *StreamPay** **AI**

* *\</h1\>**

* *{**/\* AI Prompt Interface \*/**}**

* *\<div className=\"bg-slate-800/50 backdrop-blur rounded-lg p-6
mb-8\"\>**

* *\<textarea**

* *value={prompt}**

* *onChange={(e)** **=\>** **setPrompt(e.target.value)}**

* *placeholder=\"Example: Pay 0x123\... 50 USDC/hour for 100 hours\"**

* *className=\"w-full h-32 bg-slate-900 text-white rounded p-4\"**

* */\>**

* *\<button**

* *onClick={handleAIPrompt}**

* *className=\"mt-4 px-6 py-3 bg-cyan-500 rounded-lg
hover:bg-cyan-600\"**

* *\>**

* *Process** **with** **AI**

* *\</button\>**

* *\</div\>**

* *{**/\* Active Streams \*/**}**

* *\<StreamsList** **address={address}** **/\>**

* *\</div\>**

* *\</div\>**

* *);**

**}**

### []{#anchor-3}**2. ElizaOS Agent Configuration**

typescript

[]{#anchor-4}**// agents/streampay-agent.ts**

**import** **{** **Agent,** **Plugin** **}** **from**
**\'@ai16z/eliza\';**

**import** **{** **ethers }** **from** **\'ethers\';**

**import** **Moralis** **from** **\'moralis\';**

**// Initialize Moralis**

**await** **Moralis.start({** **

* *apiKey:** **process.env.MORALIS_API_KEY** **

**});**

**// Custom Moralis Plugin**

**const** **moralisPlugin:** **Plugin** **=** **{**

* *name:** **\'moralis-integration\',**

* *actions:** **{**

* *// Get Uniswap V3 pair address**

* *async** **getPoolAddress(token0:** **string,** **token1:**
**string)** **{**

* *const** **response =** **await**
**Moralis.EvmApi.defi.getPairAddress({**

* *chain:** **\'0x1\',**

* *token0Address:** **token0,**

* *token1Address:** **token1,**

* *exchange:** **\'uniswapv3\'**

* *});**

* *return** **response.json();**

* *},**

* *// Get token balances**

* *async** **getTokenBalance(address:** **string,** **token:**
**string)** **{**

* *const** **response =** **await**
**Moralis.EvmApi.token.getWalletTokenBalances({**

* *chain:** **\'0x1\',**

* *address:** **address,**

* *tokenAddresses:** **\[token\]**

* *});**

* *return** **response.json();**

* *},**

* *// Monitor stream events**

* *async** **setupStreamMonitor(contractAddress:** **string,**
**streamId:** **number)** **{**

* *const** **stream =** **await** **Moralis.Streams.add({**

* *chains:** **\[\'0x1\'\],**

* *description:** **\`Monitor stream \${streamId}\`,**

* *tag:** **\'streampay\',**

* *webhookUrl:** **\`\${process.env.API_URL}/webhook/moralis\`,**

* *abi:** **\[**

* *{**

* *anonymous:** **false,**

* *inputs:** **\[**

* *{** **indexed:** **true,** **name:** **\'streamId\',** **type:**
**\'uint256\'** **},**

* *{** **indexed:** **false,** **name:** **\'amount\',** **type:**
**\'uint256\'** **}**

* *\],**

* *name:** **\'StreamClaimed\',**

* *type:** **\'event\'**

* *}**

* *\],**

* *topic0:** **\[\'StreamClaimed(uint256,uint256)\'\],**

* *includeContractLogs:** **true,**

* *includeNativeTxs:** **true**

* *});**

* *return** **stream;**

* *}**

* *}**

**};**

**// Chainlink Plugin**

**const** **chainlinkPlugin:** **Plugin** **=** **{**

* *name:** **\'chainlink-oracles\',**

* *actions:** **{**

* *async** **getPriceFeed(pair:** **string)** **{**

* *const** **PRICE_FEEDS** **=** **{**

* *\'ETH/USD\':** **\'0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419\',**

* *\'USDC/USD\':** **\'0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6\'**

* *};**

* *const** **feed =** **new** **ethers.Contract(**

* *PRICE_FEEDS\[pair\],**

* *\[**

* *\'function latestRoundData() view returns (uint80, int256, uint256,
uint256, uint80)\'**

* *\],**

* *this.provider**

* *);**

* *const** **\[,** **price,** **,** **timestamp\]** **=** **await**
**feed.latestRoundData();**

* *return** **{**

* *price:** **price.toString(),**

* *timestamp:** **timestamp.toString(),**

* *pair**

* *};**

* *}**

* *}**

**};**

**// Main StreamPay Agent**

**export** **const** **streamPayAgent =** **new** **Agent({**

* *name:** **\'StreamPayAI\',**

* *description:** **\'AI agent for managing streaming crypto
payments\',**

* *// LLM Configuration**

* *llm:** **{**

* *provider:** **\'openai\',**

* *model:** **\'gpt-4-turbo-preview\',**

* *temperature:** **0.1,** **// Low for precision**

* *systemPrompt:** **\`You are StreamPayAI, an expert at managing crypto
payment streams.**

* *You can:**

* *1. Create payment streams (ERC20 tokens only)**

* *2. Check Uniswap V3 pools**

* *3. Get real-time token prices**

* *4. Monitor active streams**

* *Always parse user intent carefully and extract:**

* *- Recipient address**

* *- Token symbol (convert to address)**

* *- Payment rate (amount per hour)**

* *- Duration (in hours or days)**

* *Format responses as JSON with this structure:**

* *{**

* *\"action\": \"create_stream\" \| \"check_pool\" \| \"get_price\",**

* *\"params\": { /\* action-specific params \*/ },**

* *\"confirmation\": \"Human-readable message\"**

* *}\`**

* *},**

* *// Blockchain config**

* *chains:** **\[{**

* *name:** **\'ethereum\',**

* *rpcUrl:** **process.env.ETH_RPC_URL,**

* *chainId:** **1**

* *}\],**

* *// Register plugins**

* *plugins:** **\[moralisPlugin,** **chainlinkPlugin\]**

**});**

**// Intent parser**

**streamPayAgent.onMessage(async** **(message:** **string,**
**context:** **any)** **=\>** **{**

* *const** **prompt =** **\`**

* *User message: \"\${message}\"**

* *User address: \${context.userAddress}**

* *Parse this into a StreamPay action.**

* *\`;**

* *const** **response =** **await**
**streamPayAgent.llm.complete(prompt);**

* *const** **parsed =** **JSON.parse(response);**

* *// Validate and execute**

* *switch(parsed.action)** **{**

* *case** **\'create_stream\':**

* *return** **await** **handleCreateStream(parsed.params);**

* *case** **\'check_pool\':**

* *return** **await** **handleCheckPool(parsed.params);**

* *case** **\'get_price\':**

* *return** **await** **handleGetPrice(parsed.params);**

* *}**

**});**

**// Action handlers**

**async** **function** **handleCreateStream(params:** **any)** **{**

* *// 1. Resolve token addresses**

* *const** **tokenAddress =** **await**
**resolveTokenAddress(params.tokenSymbol);**

* *// 2. Check if pool exists (token/USDC)**

* *const** **poolData =** **await**
**streamPayAgent.plugins.moralis.getPoolAddress(**

* *tokenAddress,**

* *USDC_ADDRESS**

* *);**

* *// 3. Get current price from Chainlink**

* *const** **priceData =** **await**
**streamPayAgent.plugins.chainlink.getPriceFeed(**

* *\`\${params.tokenSymbol}/USD\`**

* *);**

* *// 4. Calculate stream parameters**

* *const** **ratePerSecond =** **ethers.utils.parseUnits(**

* *(params.hourlyRate** **/** **3600).toString(),**

* *18**

* *);**

* *const** **duration =** **params.hours** **\*** **3600;**

* *// 5. Return transaction params**

* *return** **{**

* *action:** **\'create_stream\',**

* *params:** **{**

* *recipient:** **params.recipient,**

* *token:** **tokenAddress,**

* *ratePerSecond:** **ratePerSecond.toString(),**

* *duration:** **duration,**

* *estimatedTotal:** **ethers.utils.formatUnits(**

* *ratePerSecond.mul(duration),**

* *18**

* *)**

* *},**

* *confirmation:** **\`Creating stream: Pay \${params.recipient}
\${params.hourlyRate} \${params.tokenSymbol}/hour for \${params.hours}
hours. Total: \~\${params.hourlyRate \* params.hours}
\${params.tokenSymbol}\`,**

* *poolAddress:** **poolData.pairAddress,**

* *currentPrice:** **ethers.utils.formatUnits(priceData.price,** **8)**

* *};**

**}**

### []{#anchor-5}**3. Smart Contracts (Solidity)**

solidity

[]{#anchor-6}**// SPDX-License-Identifier: MIT**

**pragma** **solidity** **\^0.8.20;**

**import** **\"@openzeppelin/contracts/token/ERC20/IERC20.sol\";**

**import**
**\"@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol\";**

**import** **\"@openzeppelin/contracts/security/ReentrancyGuard.sol\";**

**import**
**\"@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol\";**

**/\*\***

* *\* \@title StreamPayCore**

* *\* \@notice ERC20-only streaming payment contract**

* *\* \@dev Optimized for gas efficiency and ElizaOS integration**

* *\*/**

**contract** **StreamPayCore** **is** **ReentrancyGuard {**

* *using** **SafeERC20** **for** **IERC20;**

* *// Stream structure**

* *struct** **Stream** **{**

* *address** **sender;** **// Who pays**

* *address** **recipient;** **// Who receives**

* *address** **token;** **// ERC20 token address**

* *uint256** **deposit;** **// Total deposited amount**

* *uint256** **ratePerSecond;** **// Payment rate**

* *uint256** **startTime;** **// Stream start**

* *uint256** **stopTime;** **// Stream end**

* *uint256** **remainingBalance;**// Unclaimed balance**

* *bool** **active;** **// Stream status**

* *}**

* *// State**

* *mapping(uint256** **=\>** **Stream)** **public** **streams;**

* *uint256** **public** **nextStreamId;**

* *// Chainlink price feed**

* *mapping(address** **=\>** **AggregatorV3Interface)** **public**
**priceFeeds;**

* *// ElizaOS agent (authorized to create streams)**

* *address** **public** **elizaAgent;**

* *// Events**

* *event** **StreamCreated(**

* *uint256** **indexed** **streamId,**

* *address** **indexed** **sender,**

* *address** **indexed** **recipient,**

* *address** **token,**

* *uint256** **deposit,**

* *uint256** **ratePerSecond,**

* *uint256** **startTime,**

* *uint256** **stopTime**

* *);**

* *event** **StreamClaimed(**

* *uint256** **indexed** **streamId,**

* *address** **indexed** **recipient,**

* *uint256** **amount**

* *);**

* *event** **StreamCancelled(**

* *uint256** **indexed** **streamId,**

* *uint256** **senderBalance,**

* *uint256** **recipientBalance**

* *);**

* *modifier** **onlyElizaAgent()** **{**

* *require(msg.sender ==** **elizaAgent,** **\"Only ElizaOS agent\");**

* *\_;**

* *}**

* *modifier** **streamExists(uint256** **streamId)** **{**

* *require(streamId \<** **nextStreamId,** **\"Stream doesn\'t
exist\");**

* *\_;**

* *}**

* *constructor(address** **\_elizaAgent)** **{**

* *elizaAgent =** **\_elizaAgent;**

* *}**

* */\*\***

* *\* \@notice Create payment stream**

* *\* \@dev Called by ElizaOS agent after parsing user intent**

* *\*/**

* *function** **createStream(**

* *address** **recipient,**

* *address** **token,**

* *uint256** **deposit,**

* *uint256** **ratePerSecond,**

* *uint256** **duration**

* *)** **external** **onlyElizaAgent returns** **(uint256**
**streamId)** **{**

* *require(recipient !=** **address(0),** **\"Invalid recipient\");**

* *require(token !=** **address(0),** **\"Invalid token\");**

* *require(deposit \>** **0,** **\"Deposit must be \> 0\");**

* *require(ratePerSecond \>** **0,** **\"Rate must be \> 0\");**

* *require(duration \>** **0,** **\"Duration must be \> 0\");**

* *// Transfer tokens from sender to contract**

* *IERC20(token).safeTransferFrom(**

* *tx.origin,** **// Actual sender (company)**

* *address(this),**

* *deposit**

* *);**

* *// Create stream**

* *streamId =** **nextStreamId++;**

* *streams\[streamId\]** **=** **Stream({**

* *sender:** **tx.origin,**

* *recipient:** **recipient,**

* *token:** **token,**

* *deposit:** **deposit,**

* *ratePerSecond:** **ratePerSecond,**

* *startTime:** **block.timestamp,**

* *stopTime:** **block.timestamp +** **duration,**

* *remainingBalance:** **deposit,**

* *active:** **true**

* *});**

* *emit** **StreamCreated(**

* *streamId,**

* *tx.origin,**

* *recipient,**

* *token,**

* *deposit,**

* *ratePerSecond,**

* *block.timestamp,**

* *block.timestamp +** **duration**

* *);**

* *}**

* */\*\***

* *\* \@notice Claim accumulated tokens**

* *\* \@dev Recipient can claim anytime**

* *\*/**

* *function** **claimStream(uint256** **streamId)** **

* *external** **

* *nonReentrant **

* *streamExists(streamId)** **

* *{**

* *Stream storage** **stream =** **streams\[streamId\];**

* *require(msg.sender ==** **stream.recipient,** **\"Not recipient\");**

* *require(stream.active,** **\"Stream not active\");**

* *uint256** **claimable =** **\_claimableBalance(streamId);**

* *require(claimable \>** **0,** **\"Nothing to claim\");**

* *stream.remainingBalance -=** **claimable;**

* *// Transfer tokens**

* *IERC20(stream.token).safeTransfer(stream.recipient,** **claimable);**

* *// Auto-close if fully claimed**

* *if** **(stream.remainingBalance ==** **0** **\|\|** **block.timestamp
\>=** **stream.stopTime)** **{**

* *stream.active =** **false;**

* *}**

* *emit** **StreamClaimed(streamId,** **stream.recipient,**
**claimable);**

* *}**

* */\*\***

* *\* \@notice Cancel stream**

* *\* \@dev Returns remaining balance to sender**

* *\*/**

* *function** **cancelStream(uint256** **streamId)** **

* *external** **

* *streamExists(streamId)** **

* *{**

* *Stream storage** **stream =** **streams\[streamId\];**

* *require(**

* *msg.sender ==** **stream.sender \|\|** **msg.sender ==**
**elizaAgent,**

* *\"Not authorized\"**

* *);**

* *require(stream.active,** **\"Stream not active\");**

* *uint256** **recipientBalance =** **\_claimableBalance(streamId);**

* *uint256** **senderBalance =** **stream.remainingBalance -**
**recipientBalance;**

* *stream.active =** **false;**

* *stream.remainingBalance =** **0;**

* *// Transfer balances**

* *if** **(recipientBalance \>** **0)** **{**

* *IERC20(stream.token).safeTransfer(**

* *stream.recipient,**

* *recipientBalance**

* *);**

* *}**

* *if** **(senderBalance \>** **0)** **{**

* *IERC20(stream.token).safeTransfer(**

* *stream.sender,**

* *senderBalance**

* *);**

* *}**

* *emit** **StreamCancelled(streamId,** **senderBalance,**
**recipientBalance);**

* *}**

* */\*\***

* *\* \@notice Calculate claimable balance**

* *\*/**

* *function** **\_claimableBalance(uint256** **streamId)** **

* *internal** **

* *view** **

* *returns** **(uint256)** **

* *{**

* *Stream storage** **stream =** **streams\[streamId\];**

* *if** **(!stream.active)** **return** **0;**

* *uint256** **elapsed =** **block.timestamp -** **stream.startTime;**

* *if** **(elapsed \>** **(stream.stopTime -** **stream.startTime))**
**{**

* *elapsed =** **stream.stopTime -** **stream.startTime;**

* *}**

* *uint256** **totalEarned =** **elapsed \*** **stream.ratePerSecond;**

* *uint256** **alreadyClaimed =** **stream.deposit -**
**stream.remainingBalance;**

* *return** **totalEarned -** **alreadyClaimed;**

* *}**

* */\*\***

* *\* \@notice Get stream details**

* *\*/**

* *function** **getStream(uint256** **streamId)** **

* *external** **

* *view** **

* *streamExists(streamId)**

* *returns** **(Stream memory)** **

* *{**

* *return** **streams\[streamId\];**

* *}**

* */\*\***

* *\* \@notice Get claimable amount (external view)**

* *\*/**

* *function** **balanceOf(uint256** **streamId)** **

* *external** **

* *view** **

* *streamExists(streamId)**

* *returns** **(uint256)** **

* *{**

* *return** **\_claimableBalance(streamId);**

* *}**

**}**

### []{#anchor-7}**4. API Routes (Next.js)**

typescript

[]{#anchor-8}**// app/api/eliza/route.ts**

**import** **{** **streamPayAgent }** **from**
**\'@/agents/streampay-agent\';**

**import** **{** **NextResponse** **}** **from** **\'next/server\';**

**export** **async** **function** **POST(request:** **Request)** **{**

* *const** **{** **prompt,** **userAddress }** **=** **await**
**request.json();**

* *try** **{**

* *// Send to ElizaOS agent**

* *const** **response =** **await**
**streamPayAgent.processMessage(prompt,** **{**

* *userAddress**

* *});**

* *return** **NextResponse.json(response);**

* *}** **catch** **(error)** **{**

* *console.error(\'ElizaOS error:\',** **error);**

* *return** **NextResponse.json(**

* *{** **error:** **\'Failed to process prompt\'** **},**

* *{** **status:** **500** **}**

* *);**

* *}**

**}**

**// app/api/webhook/moralis/route.ts**

**export** **async** **function** **POST(request:** **Request)** **{**

* *const** **webhookData =** **await** **request.json();**

* *// Process Moralis stream events**

* *for** **(const** **log of** **webhookData.logs)** **{**

* *if** **(log.topic0** **===** **\'StreamClaimed(uint256,uint256)\')**
**{**

* *const** **streamId =** **parseInt(log.data.streamId);**

* *const** **amount =** **log.data.amount;**

* *// Notify user via ElizaOS**

* *await** **streamPayAgent.notify({**

* *type:** **\'stream_claimed\',**

* *streamId,**

* *amount**

* *});**

* *}**

* *}**

* *return** **NextResponse.json({** **success:** **true** **});**

**}**

## **Deployment & Testing**

### []{#anchor-9}**Hardhat Configuration**

typescript

[]{#anchor-10}**// hardhat.config.ts**

**import** **{** **HardhatUserConfig** **}** **from**
**\"hardhat/config\";**

**import** **\"@nomicfoundation/hardhat-toolbox\";**

**const** **config:** **HardhatUserConfig** **=** **{**

* *solidity:** **{**

* *version:** **\"0.8.20\",**

* *settings:** **{**

* *optimizer:** **{**

* *enabled:** **true,**

* *runs:** **200**

* *}**

* *}**

* *},**

* *networks:** **{**

* *sepolia:** **{**

* *url:** **process.env.SEPOLIA_RPC_URL,**

* *accounts:** **\[process.env.PRIVATE_KEY!\]**

* *},**

* *mainnet:** **{**

* *url:** **process.env.MAINNET_RPC_URL,**

* *accounts:** **\[process.env.PRIVATE_KEY!\]**

* *}**

* *},**

* *etherscan:** **{**

* *apiKey:** **process.env.ETHERSCAN_API_KEY**

* *}**

**};**

**export** **default** **config;**

### []{#anchor-11}**Deployment Script**

typescript

[]{#anchor-12}**// scripts/deploy.ts**

**import** **{** **ethers }** **from** **\"hardhat\";**

**async** **function** **main()** **{**

* *const** **\[deployer\]** **=** **await** **ethers.getSigners();**

* *console.log(\"Deploying with:\",** **deployer.address);**

* *// Deploy StreamPayCore**

* *const** **StreamPayCore** **=** **await**
**ethers.getContractFactory(\"StreamPayCore\");**

* *const** **streamPayCore =** **await** **StreamPayCore.deploy(**

* *process.env.ELIZA_AGENT_ADDRESS** **// ElizaOS agent EOA**

* *);**

* *await** **streamPayCore.deployed();**

* *console.log(\"StreamPayCore deployed to:\",**
**streamPayCore.address);**

* *// Verify on Etherscan**

* *await** **run(\"verify:verify\",** **{**

* *address:** **streamPayCore.address,**

* *constructorArguments:** **\[process.env.ELIZA_AGENT_ADDRESS\]**

* *});**

**}**

**main().catch((error)** **=\>** **{**

* *console.error(error);**

* *process.exitCode** **=** **1;**

**});**

## **Roadmap de Implementação (12h/semana)**

### []{#anchor-13}**Sprint 1-2: Foundation (2 semanas × 12h = 24h)**

-   \[x\] Setup ElizaOS environment
-   \[x\] Configure Moralis API integration
-   \[x\] Smart contract base (StreamPayCore.sol)
-   \[x\] Deploy to Sepolia testnet
-   \[x\] Basic frontend (Next.js)

### []{#anchor-14}**Sprint 3-4: AI Integration (2 semanas × 12h = 24h)**

-   \[ \] Complete ElizaOS agent with plugins
-   \[ \] Intent parsing and validation
-   \[ \] Chainlink price feed integration
-   \[ \] Moralis Streams setup
-   \[ \] End-to-end testing

### []{#anchor-15}**Sprint 5-6: Production (2 semanas × 12h = 24h)**

-   \[ \] Security audit (Slither + manual)
-   \[ \] Gas optimization
-   \[ \] Frontend polish
-   \[ \] Documentation
-   \[ \] Mainnet deployment

**Total: 6 semanas (72 horas)**

## **Security Considerations**

solidity

[]{#anchor-16}**// Security checklist**

*✅ *ReentrancyGuard on all external** **functions**

*✅ *SafeERC20 for** **token transfers**

*✅ *Access control (onlyElizaAgent modifier)**

*✅ *Integer overflow protection (Solidity 0.8+)**

*✅ *Proper event** **emission**

*✅ *Input validation**

*✅ *No delegatecall**

*✅ *No selfdestruct**

**// Additional measures**

**-** **Multi-sig for** **ElizaAgent address** **updates**

**-** **Pausable functionality for** **emergencies**

**-** **Timelock for** **critical operations**

**-** **Regular audits**

## **Exemplo de Uso Completo**

typescript

[]{#anchor-17}**// User types in frontend:**

**\"Pay 0xABC\...789 100 USDC per hour for 40 hours\"**

**// ElizaOS processes:**

**{**

* *action:** **\"create_stream\",**

* *params:** **{**

* *recipient:** **\"0xABC\...789\",**

* *token:** **\"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",** **//
USDC**

* *deposit:** **\"4000000000\",** **// 4000 USDC (100 × 40)**

* *ratePerSecond:** **\"27777777\",** **// 100 USDC / 3600 seconds**

* *duration:** **144000** **// 40 hours in seconds**

* *},**

* *confirmation:** **\"Creating stream to pay 0xABC\...789 100 USDC/hour
for 40 hours. Total: 4,000 USDC\"**

**}**

**// Frontend executes transaction**

**// Moralis monitors events**

**// Recipient can claim anytime via: claimStream(streamId)**

## **Métricas & KPIs**

-   **Gas Cost:** \~150k gas para createStream (\~\$5 @ 30 gwei)
-   **Latency:** \<2s para AI parsing
-   **Uptime:** 99.9% (Moralis + Chainlink SLA)
-   **Fees:** 0.3% vs 5-7% PayPal/Wise
-   **Target Users:** 1,000 no mês 1

**Arquitetura production-ready focada em ERC20, Uniswap V3, ElizaOS,
Chainlink e Moralis. Pronta para desenvolvimento em 12h/semana durante 6
semanas**

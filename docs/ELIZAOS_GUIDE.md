# 🤖 ElizaOS Chatbot - Guia Completo

**Versão**: 1.0.1 | **Status**: ✅ Operacional | **Porta**: 3002

## 📖 Visão Geral

O ElizaOS é um agente inteligente integrado ao StreamPay AI que permite interações em linguagem natural para gerenciar streams de pagamento, realizar operações DeFi e consultar informações blockchain.

## 🚀 Como Iniciar

### Opção 1: Com todos os serviços
```bash
# Na raiz do projeto
npm run dev

# ElizaOS estará disponível em:
# http://localhost:3002
```

### Opção 2: Apenas ElizaOS
```bash
cd streampay-eliza
npm install
npm run dev

# Se a porta 3000 estiver ocupada, usará automaticamente 3002
```

## 💬 Comandos Disponíveis

### 📊 Streams de Pagamento

#### 1️⃣ Criar Stream
**Português:**
```
Criar stream de 1000 USDC para 0x1234...5678 por 30 dias
Criar stream de 500 DAI para 0xabcd...ef00 por 7 dias
```

**English:**
```
Create stream of 1000 USDC to 0x1234...5678 for 30 days
Create stream of 500 DAI to 0xabcd...ef00 for 7 days
```

**Parâmetros necessários:**
- Valor (amount)
- Token (USDC, DAI, USDT, WETH, ETH)
- Endereço destinatário (0x...)
- Duração (em dias, semanas ou meses)

#### 2️⃣ Resgatar Stream
**Português:**
```
Resgatar stream 0x7890...abcd
Claim stream 0x7890...abcd
```

**English:**
```
Claim stream 0x7890...abcd
```

**Parâmetros necessários:**
- Stream ID (endereço do contrato)

#### 3️⃣ Pausar Stream
**Português:**
```
Pausar stream 0x7890...abcd
```

**English:**
```
Pause stream 0x7890...abcd
```

#### 4️⃣ Cancelar Stream
**Português:**
```
Cancelar stream 0x7890...abcd
```

**English:**
```
Cancel stream 0x7890...abcd
```

#### 5️⃣ Ver Streams
**Português:**
```
Ver meus streams
Listar streams
Mostrar streams
```

**English:**
```
View my streams
List streams
Show my streams
```

### 💧 Liquidez & DeFi

#### 6️⃣ Adicionar Liquidez
**Português:**
```
Adicionar 1000 USDC e 500 DAI no pool
Add 2000 USDT e 1000 USDC ao pool
```

**English:**
```
Add 1000 USDC and 500 DAI to pool
Add 2000 USDT and 1000 USDC to pool
```

**Parâmetros necessários:**
- Valor do token 1
- Token 1 (USDC, DAI, USDT, WETH)
- Valor do token 2
- Token 2 (USDC, DAI, USDT, WETH)

#### 7️⃣ Trocar Tokens
**Português:**
```
Trocar 100 USDC por DAI
Swap 50 USDT por USDC
```

**English:**
```
Swap 100 USDC for DAI
Exchange 50 USDT for USDC
```

**Parâmetros necessários:**
- Valor
- Token de entrada
- Token de saída

### 📈 Informações

#### 8️⃣ Ver Saldo
**Português:**
```
Qual meu saldo de USDC?
Saldo USDC
Ver saldo de DAI
```

**English:**
```
What's my USDC balance?
Balance USDC
Check DAI balance
```

#### 9️⃣ Ver Preço
**Português:**
```
Qual o preço de ETH?
Preço ETH
Ver preço de BTC
```

**English:**
```
What's the price of ETH?
Price ETH
Check BTC price
```

### 🆘 Ajuda

Para ver todos os comandos disponíveis:
```
help
ajuda
comandos
```

## 🎯 Tokens Suportados

- **USDC**: USD Coin
- **DAI**: Dai Stablecoin
- **USDT**: Tether USD
- **WETH**: Wrapped Ether
- **ETH**: Ethereum

## ⏱️ Durações Suportadas

### Português:
- dias (ex: 30 dias)
- semanas (ex: 4 semanas)
- meses (ex: 6 meses)

### English:
- days (ex: 30 days)
- weeks (ex: 4 weeks)
- months (ex: 6 months)

## 🔧 Configuração Técnica

### Arquivos Principais

```
streampay-eliza/
├── src/
│   ├── agents/
│   │   ├── orchestrator.ts      # Lógica principal do agente
│   │   ├── intentParser.ts      # Análise de intenções
│   │   └── actionHandler.ts     # Executores de ações
│   ├── actions/
│   │   ├── createStream.ts      # Criar streams
│   │   ├── claimStream.ts       # Resgatar streams
│   │   ├── swapTokens.ts        # Troca de tokens
│   │   └── addLiquidity.ts      # Adicionar liquidez
│   └── index.ts                 # Ponto de entrada
├── dist/
│   └── index.js                 # Build compilado
└── .env                         # Configurações
```

### Variáveis de Ambiente

Crie um arquivo `.env` em `streampay-eliza/`:

```bash
# API Keys
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Database
PGLITE_DATA_DIR=/tmp/streampay-eliza-pglite

# Blockchain (opcional para desenvolvimento)
RPC_URL=https://sepolia.infura.io/v3/your_key
```

## 🧪 Testando o Chatbot

### Teste 1: Comando Help
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "help"}'
```

### Teste 2: Criar Stream
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "criar stream de 1000 USDC para 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb por 30 dias"}'
```

### Teste 3: Ver Streams
```bash
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "ver meus streams"}'
```

## 🎨 Interface Web

O ElizaOS também possui uma interface web disponível em:
```
http://localhost:3002
```

Recursos da UI:
- 💬 Chat interativo
- 📜 Histórico de mensagens
- 🎨 Design responsivo
- 🌐 Multi-idioma (PT/EN)

## 🔍 Debugging

### Ver logs em tempo real:
```bash
# Se iniciou com npm run dev
tail -f eliza.log

# Ou monitore o terminal onde iniciou o serviço
```

### Health Check:
```bash
curl http://localhost:3002/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-01-11T...",
  "agents": 1
}
```

## 📊 Arquitetura

```
User Input
    ↓
Intent Parser (Pattern Matching)
    ↓
Intent Validator (Check Parameters)
    ↓
Action Handler (Execute Operation)
    ↓
Backend API / Blockchain
    ↓
Response to User
```

### Fluxo de Processamento:

1. **Input**: Usuário envia mensagem
2. **Parsing**: Sistema identifica a intenção (CREATE_STREAM, CLAIM_STREAM, etc.)
3. **Validação**: Verifica se todos os parâmetros necessários estão presentes
4. **Execução**: Chama a ação apropriada
5. **Feedback**: Retorna resposta formatada ao usuário

## 💡 Dicas de Uso

### ✅ Boas Práticas:
- Use comandos completos com todos os parâmetros
- Endereços Ethereum devem começar com `0x`
- Valores devem ser números positivos
- Tokens devem ser em MAIÚSCULAS (USDC, DAI)

### ❌ Evite:
- Comandos incompletos sem parâmetros
- Endereços inválidos
- Valores negativos ou zero
- Tokens não suportados

## 🆘 Solução de Problemas

### Problema: ElizaOS não inicia
**Solução:**
```bash
# Verifique se a porta 3002 está livre
lsof -ti:3002

# Se estiver ocupada, mate o processo
lsof -ti:3002 | xargs kill -9

# Reinicie
cd streampay-eliza
npm run dev
```

### Problema: Erro "Não consegui entender"
**Solução:**
- Digite `help` para ver exemplos de comandos
- Verifique se incluiu todos os parâmetros necessários
- Use os exemplos fornecidos pelo sistema

### Problema: Erro de módulo não encontrado
**Solução:**
```bash
cd streampay-eliza
npm install
npm run build
npm run dev
```

## 📚 Recursos Adicionais

- [ElizaOS Documentation](https://github.com/elizaos/eliza)
- [StreamPay API Docs](http://localhost:3001/api-docs)
- [Backend README](backend/README.md)
- [Getting Started](GETTING_STARTED.md)

## 🤝 Contribuindo

Para adicionar novos comandos ao chatbot:

1. Defina o intent em `src/agents/intentParser.ts`
2. Crie a action em `src/actions/yourAction.ts`
3. Registre no handler em `src/agents/actionHandler.ts`
4. Adicione exemplos no help em `src/agents/orchestrator.ts`
5. Compile: `npm run build`
6. Teste: `npm run dev`

## 📄 Licença

Este projeto está sob a licença MIT. Veja [README.md](README.md) para mais detalhes.

---

**Última atualização**: 11 de janeiro de 2026
**Versão do ElizaOS**: 1.6.4
**Versão do StreamPay**: 1.0.1

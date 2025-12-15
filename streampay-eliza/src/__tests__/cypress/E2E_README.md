# E2E Tests - StreamPay AI

Este diretório contém testes end-to-end (E2E) para a plataforma StreamPay AI usando Cypress.

## 📋 Estrutura dos Testes

### Testes Principais

#### 1. **streampay-flows.cy.ts** - Fluxos Principais do StreamPay
Testes completos para os 4 fluxos críticos:

- **Stream Creation Flow** ✅
  - Navegação para criação de stream
  - Preenchimento do formulário (recipient, amount, duration)
  - Submissão e confirmação
  - Verificação no dashboard

- **Stream Claiming Flow** ✅
  - Navegação para streams recebidos
  - Busca de streams reclamáveis
  - Reclamação com confirmação
  - Atualização de saldo verificada

- **Liquidity Pool Flow** ✅
  - Navegação para seção de liquidez
  - Visualização de estatísticas (TVL, APY, Volume)
  - Adição de liquidez ao pool
  - Remoção de liquidez

- **Real-time Chat Flow** ✅
  - Navegação para chat
  - Envio de mensagens
  - Recebimento de mensagens via WebSocket
  - Indicador de digitação
  - Múltiplas mensagens na conversa

- **Integration Tests** ✅
  - Manutenção de sessão entre features
  - Sincronização de dados via WebSocket

#### 2. **user-workflow.cy.ts**
Testes de fluxo de usuário completo (onboarding, navegação, resposta de agente)

#### 3. **agent-chat.cy.ts**
Testes específicos da interface de chat com o agente

#### 4. **dashboard.cy.ts**
Testes do dashboard (carregamento, navegação, design responsivo, tratamento de erros)

## 🎯 Custom Commands (streampay-commands.ts)

### Comandos Disponíveis

```typescript
// Criar um stream
cy.createStream(
  recipientWallet: string,  // '0x123...'
  amount: string,           // '100.00'
  duration: number          // 30 (dias)
);

// Reclamar stream
cy.claimStream();

// Adicionar liquidez
cy.addLiquidity(amount: string);  // '10.00'

// Enviar mensagem de chat
cy.sendChatMessage(message: string);

// Esperar evento WebSocket
cy.waitForWebSocketEvent(eventType: string, timeout?: number);

// Obter saldo atual
cy.getBalance();

// Esperar conclusão de transação
cy.waitForTransaction(timeout?: number);
```

### Exemplos de Uso

```typescript
describe('Stream Creation', () => {
  it('should create and claim a stream', () => {
    // Criar stream
    cy.createStream('0xRecipient...', '100.00', 30);

    // Verificar sucesso
    cy.waitForTransaction();

    // Trocar para conta do recebedor
    cy.login('recipient', 'password');

    // Reclamar stream
    cy.claimStream();
    cy.waitForTransaction();

    // Verificar novo saldo
    cy.getBalance().then(balance => {
      expect(balance).to.include('100');
    });
  });

  it('should chat about streams', () => {
    cy.sendChatMessage('How do I create a stream?');
    cy.sendChatMessage('What are the fees?');
  });
});
```

## 🚀 Executando os Testes

### Modo Interativo (Cypress UI)

```bash
# Abrir Cypress Test Runner
npm run test:e2e

# Ou especificar um arquivo
npm run test:e2e -- streampay-flows
```

### Modo Headless (CI/CD)

```bash
# Executar todos os testes E2E
npm run test:e2e:headless

# Executar teste específico
npm run test:e2e:headless -- --spec="**streampay-flows.cy.ts"

# Com relatório
npm run test:e2e:headless -- --reporter spec
```

### Executar Teste Específico

```bash
# Stream Creation apenas
npm run test:e2e -- --grep "Stream Creation Flow"

# Chat apenas
npm run test:e2e -- --grep "Real-time Chat Flow"

# Integration tests
npm run test:e2e -- --grep "Integration"
```

## 📊 Configuração (cypress.config.ts)

```typescript
{
  baseUrl: 'http://localhost:3000',
  specPattern: 'src/__tests__/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  supportFile: 'src/__tests__/cypress/support/e2e.ts',
  defaultCommandTimeout: 10000,      // 10 segundos
  requestTimeout: 10000,             // Para requisições HTTP
  responseTimeout: 10000,            // Para respostas
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnFailure: true,
}
```

## 🔍 Estratégias de Seleção

Os testes usam múltiplas estratégias para encontrar elementos:

### 1. **data-testid** (Recomendado)
```html
<button data-testid="create-stream">Create Stream</button>
```

### 2. **Seletores por Conteúdo**
```typescript
cy.get('button:contains("Create")');
cy.contains('Stream');
```

### 3. **Atributos Comuns**
```typescript
cy.get('input[placeholder*="amount"]');
cy.get('a[href*="chat"]');
```

### 4. **Roles ARIA**
```typescript
cy.get('[role="dialog"]');
cy.get('[role="alert"]');
```

## ⚙️ Variáveis de Teste

```typescript
const TEST_USER_WALLET = 'test-wallet-123';
const TEST_RECIPIENT_WALLET = 'recipient-wallet-456';
const TEST_STREAM_AMOUNT = '100.00';
const TEST_DURATION_DAYS = 30;
```

## 🛠️ Hooks Disponíveis

```typescript
beforeEach(() => {
  cy.visit('/');           // Visita página inicial
  cy.wait(2000);           // Aguarda carregamento
  cy.login();              // Efetua login
});

afterEach(() => {
  cy.clearAppData();       // Limpa dados locais
});
```

## 📈 Eventos WebSocket Testados

Os testes verificam eventos em tempo real:

- ✅ `stream:created` - Stream criado
- ✅ `stream:claimed` - Stream reclamado
- ✅ `stream:updated` - Stream atualizado
- ✅ `pool:liquidity_added` - Liquidez adicionada
- ✅ `chat:message_received` - Mensagem recebida
- ✅ `chat:typing_indicator` - Indicador de digitação
- ✅ `price:updated` - Preço atualizado

## ✅ Checklist de Teste

### Antes de Rodar os Testes

- [ ] Backend está rodando em `http://localhost:3001`
- [ ] Frontend está rodando em `http://localhost:3000`
- [ ] WebSocket está ativo na porta `3002`
- [ ] Base de dados contém dados de teste
- [ ] Variáveis de ambiente estão configuradas

### Fluxo Esperado

```
1. Stream Creation
   ├─ Navegação para create
   ├─ Preenchimento do form
   ├─ Submissão
   └─ Verificação no dashboard

2. Stream Claiming
   ├─ Navegação para received
   ├─ Busca de stream reclamável
   ├─ Clique em claim
   ├─ Confirmação
   └─ Atualização de saldo

3. Liquidity Management
   ├─ Navegação para liquidity
   ├─ Visualização de stats
   ├─ Adição de liquidez
   ├─ Remoção de liquidez
   └─ Verificação de saldo

4. Chat em Tempo Real
   ├─ Navegação para chat
   ├─ Envio de mensagem
   ├─ Recebimento via WebSocket
   ├─ Indicador de digitação
   └─ Múltiplas mensagens

5. Integration
   ├─ Manutenção de sessão
   ├─ Sincronização entre tabs
   └─ Logout
```

## 🐛 Troubleshooting

### Testes Falhando

**Problema**: "Element not found"
```typescript
// Solução: Aumentar timeout
cy.get('[data-testid="element"]', { timeout: 15000 });
```

**Problema**: "Cypress failed to start"
```bash
# Solução: Reinstalar Cypress
npm install --save-dev cypress
npx cypress cache clear
```

**Problema**: "WebSocket connection timeout"
```typescript
// Solução: Aguardar WebSocket conectar
cy.wait(2000);
cy.waitForWebSocketEvent('connect', 5000);
```

### Testes Lentos

- Aumentar `defaultCommandTimeout` em cypress.config.ts
- Usar `cy.waitForApp()` para aguardar carregamento
- Verificar se o backend está respondendo rápido

## 📝 Melhores Práticas

### ✅ Fazer

```typescript
// Use data-testid quando possível
cy.get('[data-testid="stream-form"]');

// Aguarde elementos explicitamente
cy.get('[data-testid="loading"]').should('not.exist');

// Use custom commands para fluxos comuns
cy.createStream(wallet, amount, duration);

// Limpe dados entre testes
beforeEach(() => cy.login());
afterEach(() => cy.clearAppData());
```

### ❌ Não Fazer

```typescript
// Não use índices frágeis
cy.get('button').eq(3).click();  // ❌ Frágil

// Não use esperas arbitrárias
cy.wait(5000);  // ❌ Impreciso

// Não teste detalhes de implementação
cy.get('.component-internal-class');  // ❌ Quebra com refactoring

// Não deixe estado compartilhado entre testes
// ✅ Limpe dados após cada teste
```

## 🔄 Integração com CI/CD

### GitHub Actions

```yaml
- name: Run E2E Tests
  run: npm run test:e2e:headless
  
- name: Upload Videos
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: cypress-videos
    path: cypress/videos
```

## 📚 Recursos Adicionais

- [Cypress Documentation](https://docs.cypress.io)
- [Testing Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)
- [WebSocket Testing](https://docs.cypress.io/api/commands/intercept)

## 🎓 Scripts Disponíveis

```json
{
  "test:e2e": "cypress open",
  "test:e2e:headless": "cypress run",
  "test:e2e:report": "cypress run --reporter spec",
  "test:e2e:debug": "cypress run --headed --no-exit"
}
```

---

**Última Atualização**: Dec 14, 2024  
**Status**: ✅ Testes E2E Implementados

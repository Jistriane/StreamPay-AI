# Fase 3.4 - Monitoramento com Sentry ✅ COMPLETO

## Resumo da Implementação

Sistema completo de monitoramento, error tracking e alertas em tempo real usando Sentry integrado com AlertSystem customizado para Discord, webhooks e email.

### 📊 Componentes Implementados

#### 1. **Sentry Integration** (`backend/src/monitoring/sentry.ts`)

**Recursos:**
- Inicialização com DSN configurável
- Request/Response tracking
- Exception capture com contexto
- Breadcrumb tracking para debugging
- User context tracking
- Transaction/Performance monitoring
- Graceful shutdown

**Métodos:**
```typescript
initializeSentry(config)      // Inicializar Sentry
captureException(error)       // Capturar exceções
captureMessage(message)       // Capturar mensagens
setUserContext(user)          // Definir contexto de usuário
clearUserContext()            // Limpar contexto
addBreadcrumb(message)        // Adicionar breadcrumb
startTransaction(name)        // Iniciar transação
closeSentry()                 // Fechar Sentry
isSentryInitialized()         // Verificar inicialização
```

#### 2. **Alert System** (`backend/src/monitoring/alerts.ts`)

**Tipos de Alerta:**
```typescript
enum AlertType {
  WEBHOOK_FAILURE = "webhook_failure",
  CONTRACT_ERROR = "contract_error",
  WEBSOCKET_ERROR = "websocket_error",
  DATABASE_ERROR = "database_error",
  API_ERROR = "api_error",
  AUTHENTICATION_FAILURE = "auth_failure",
  RATE_LIMIT = "rate_limit",
  SYSTEM_HEALTH = "system_health",
  CUSTOM = "custom",
}
```

**Severidade:**
```typescript
enum AlertSeverity {
  LOW = "low",         // Informativo
  MEDIUM = "medium",   // Importante
  HIGH = "high",       // Crítico
  CRITICAL = "critical" // Emergência
}
```

**Canais de Entrega:**
- ✅ Webhook genérico
- ✅ Discord com embeds formatados
- ⏳ Email (placeholder ready)
- ✅ Sentry integration

#### 3. **Helper Methods para Alerts**

```typescript
alertSystem.alertWebhookFailure(url, error, retries)
alertSystem.alertContractError(contract, method, error)
alertSystem.alertWebSocketError(error, clientCount)
alertSystem.alertDatabaseError(error)
alertSystem.alertRateLimit(ip, endpoint, requests)
alertSystem.alertSystemHealth(metric, value, threshold)
```

### 🔧 Integração no Backend

#### `backend/src/index.ts`

```typescript
// 1. Inicializar Sentry (primeira coisa)
initializeSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// 2. Middleware de Sentry
app.use(sentryRequestHandler()); // Primeiro
// ... routes ...
app.use(sentryErrorHandler());   // Último (antes de error handler)

// 3. Global error handler
app.use((err, req, res, next) => {
  // ... handling ...
});

// 4. Graceful shutdown
process.on("SIGTERM", async () => {
  await closeSentry();
  // ... cleanup ...
});
```

### 📝 Configuração de Ambiente

#### `.env.example` (Adicionado)

```env
# ===== MONITORING & ALERTS =====
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
ALERT_WEBHOOK_URL=https://your-alert-webhook-url
ALERT_EMAIL=alerts@example.com
ALERT_SEVERITY_THRESHOLD=high
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR-WEBHOOK
```

#### `.env` (Configurado)

```env
SENTRY_DSN=
ALERT_WEBHOOK_URL=
ALERT_EMAIL=
ALERT_SEVERITY_THRESHOLD=high
DISCORD_WEBHOOK_URL=
```

### 📦 Dependências Adicionadas

```json
{
  "@sentry/node": "^7.85.0",
  "@sentry/tracing": "^7.85.0"
}
```

### 🔐 Fluxo de Tratamento de Erros

```
┌─────────────────────────────────────┐
│  1. Sentry Request Handler (entrada)│
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  2. Express Routes                  │
│     (capturas automáticas)          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  3. Error Occurs                    │
│     (webhook, contract, etc)        │
└────────────┬────────────────────────┘
             │
         ┌───┴────┬──────────┬────────────┐
         ▼        ▼          ▼            ▼
    ┌────────┬────────┬────────────┬──────────┐
    │ Sentry │ Alerts │ Breadcrumb │ Logging  │
    └────────┴────────┴────────────┴──────────┘
         │        │          │            │
         └───┬────┴──────┬───┴────┬───────┘
             │           │        │
        ┌────▼──┐  ┌─────▼──┐ ┌──▼─────┐
        │Webhook│  │Discord │ │  Email │
        └───────┘  └────────┘ └────────┘
```

### 🎯 Casos de Uso

#### 1. Webhook Failure Detection
```typescript
try {
  await sendWebhook(url, payload);
} catch (error) {
  await alertSystem.alertWebhookFailure(url, error.message, retryCount);
}
```

#### 2. Smart Contract Error
```typescript
try {
  await streamPayCore.createStream(...);
} catch (error) {
  await alertSystem.alertContractError("StreamPayCore", "createStream", error.message);
}
```

#### 3. WebSocket Connection Loss
```typescript
socket.on("error", (error) => {
  alertSystem.alertWebSocketError(error.message, activeClients);
});
```

#### 4. Database Connection Issue
```typescript
pool.on("error", (error) => {
  alertSystem.alertDatabaseError(error.message);
});
```

#### 5. Rate Limiting
```typescript
if (requestCount > LIMIT) {
  await alertSystem.alertRateLimit(ip, endpoint, requestCount);
}
```

### 📡 Configuração de Webhooks

#### Genérico
```bash
curl -X POST https://your-webhook-url \
  -H "Content-Type: application/json" \
  -d '{
    "type": "webhook_failure",
    "severity": "high",
    "title": "Webhook Failed",
    "message": "Failed to send webhook"
  }'
```

#### Discord
```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR-WEBHOOK-ID/YOUR-WEBHOOK-TOKEN
```

Formato automático de embeds com cores baseadas em severity.

### 🔍 Sentry Features

#### User Tracking
```typescript
// Quando usuário faz login
setUserContext({
  id: user.id,
  wallet: user.wallet,
  email: user.email,
  type: user.type
});

// Quando logout
clearUserContext();
```

#### Breadcrumb Trail
```typescript
addBreadcrumb("Stream created", "stream_event", "info", {
  streamId: "123",
  amount: "1000"
});
```

#### Performance Monitoring
```typescript
const transaction = startTransaction("createStream", "operation");
try {
  // ... operação ...
  transaction?.finish();
} catch (error) {
  transaction?.setStatus("error");
}
```

### 📊 Dashboard Sentry

**Links úteis:**
- Criar conta: https://sentry.io/
- Criar projeto Node.js
- Copiar DSN
- Configurar em `.env`

**Métricas disponíveis:**
- Total de erros
- Trends de erro
- Performance monitoring
- Release tracking
- User feedback

### 🧪 Teste Local

```bash
# Com Sentry desabilitado (padrão se DSN não configurada)
NODE_ENV=development npm run dev

# Com Sentry mockado (se DSN vazia, usa logging)
SENTRY_DSN=https://test@localhost/123 npm run dev
```

### ⚙️ Limpar Dados Sensíveis

Sentry automaticamente limpa:
- Senhas
- API Keys
- Tokens JWT
- Números de cartão
- Informações pessoais

### 📈 Threshold de Alertas

| Severidade | Padrão | Config |
|-----------|--------|--------|
| LOW | Não alerta | ALERT_SEVERITY_THRESHOLD=low |
| MEDIUM | Não alerta | ALERT_SEVERITY_THRESHOLD=medium |
| HIGH | Alerta | ALERT_SEVERITY_THRESHOLD=high |
| CRITICAL | Alerta | ALERT_SEVERITY_THRESHOLD=critical |

### 🚀 Deployment Checklist

- [ ] Criar conta Sentry
- [ ] Criar projeto Node.js no Sentry
- [ ] Copiar DSN do projeto
- [ ] Adicionar DSN ao `.env`
- [ ] Configurar Discord webhook (opcional)
- [ ] Testar alertas localmente
- [ ] Deploy para staging
- [ ] Validar Sentry dashboard
- [ ] Setup alertas no Sentry

### 📝 Monitoramento Contínuo

**O que monitorar:**

1. **Webhooks**
   - Taxa de entrega
   - Latência média
   - Retry counts

2. **Contratos**
   - Falhas de execução
   - Gas usage
   - Transações falhadas

3. **WebSocket**
   - Conexões ativas
   - Latência
   - Taxa de erro

4. **Database**
   - Conexões ativas
   - Query performance
   - Erros de conexão

5. **Performance**
   - CPU usage
   - Memory usage
   - Response time

### 🔗 Integração com Outras Fases

#### Webhooks (Fase 3.1)
```typescript
// Ambos Sentry e Alert System usados
try {
  await fireWebhook();
} catch (error) {
  captureException(error);
  await alertSystem.alertWebhookFailure(...);
}
```

#### WebSocket (Fase 3.2)
```typescript
// Monitorar desconexões
socket.on("disconnect", () => {
  addBreadcrumb("WebSocket disconnected", "websocket");
});
```

#### Smart Contracts (Fase 3.3)
```typescript
// Capturar erro de contrato
try {
  await contract.method();
} catch (error) {
  await alertSystem.alertContractError("Contract", "method", error.message);
}
```

### 📊 Status Final

✅ **Sentry Integration**: Completo
✅ **Alert System**: Completo
✅ **Discord Webhooks**: Implementado
✅ **Email Alerts**: Ready (placeholder)
✅ **Environment Config**: Completo
✅ **Graceful Shutdown**: Implementado
✅ **Error Handlers**: Integrado
⏳ **Staging Tests**: Pendentes
⏳ **Production Config**: Pendentes

---

**Data**: 14 de Dezembro de 2025
**Status**: 🟢 PRONTO PARA TESTES

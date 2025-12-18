# 🚀 StreamPay AI Backend - Middleware Quick Reference

## 🏃 Quick Start

```bash
# 1. Instalar dependências
cd backend && npm install

# 2. Configurar .env
DATABASE_URL=postgresql://...
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
JWT_SECRET=your-secret

# 3. Iniciar servidor
npm start

# 4. Verificar health
curl http://localhost:3001/health | jq .
```

---

## 📍 Novos Endpoints

| Endpoint | Método | Descrição | Rate Limit |
|----------|--------|-----------|-----------|
| `/health` | GET | Health check completo | ❌ Excluído |
| `/metrics` | GET | Prometheus metrics | ❌ Excluído |
| `/info` | GET | Info da aplicação | ❌ Excluído |

---

## 🔐 Rate Limiting

```
Global:        100 req / 15 min (por IP)
               ⚠️  Exclui: /health, /metrics

Auth:          5 req / 15 min
               🔒 Stricter, conta falhas
               ⚠️  Aplicado em: /api/auth/*

External API:  30 req / 1 min
               🌐 Aplicado em:
                  - /api/etherscan/*
                  - /api/moralis/*
                  - /api/infura/*
                  - /api/elizaos/*
```

### Rate Limit Response
```json
HTTP/1.1 429 Too Many Requests

{
  "message": "Muitas requisições deste IP, tente novamente mais tarde.",
  "retryAfter": 45
}
```

---

## 🔒 Security Headers

Automaticamente adicionados por Helmet:

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-XSS-Protection: 0
```

---

## 📊 Monitoring

### Health Status
```bash
curl http://localhost:3001/health | jq .

# Respostas possíveis:
# status: "ok"       (200 OK)
# status: "degraded" (503 Service Unavailable)
# status: "error"    (500 Internal Server Error)
```

### Prometheus Metrics
```bash
curl http://localhost:3001/metrics

# Formato:
# streampay_requests_total 42
# streampay_errors_total 2
# streampay_request_duration_ms 45
```

### Application Info
```bash
curl http://localhost:3001/info | jq .

{
  "name": "StreamPay AI Backend",
  "version": "1.0.0",
  "environment": "development",
  "uptime": 3600,
  "requestCount": 42,
  "errorCount": 2
}
```

---

## 🛡️ Proteções Implementadas

### SQL Injection
```bash
# ❌ Bloqueado automaticamente:
curl -X POST http://localhost:3001/api/auth/login \
  -d '{"password":"SELECT * FROM users"}'

# Resposta: 400 Bad Request
# { "error": "Invalid input detected" }
```

### XSS Prevention
```bash
# ❌ Tags HTML removidas automaticamente:
{
  "email": "<script>alert('xss')</script>",
  "name": "Test<img src=x>"
}

# Armazenado como: "alertxss", "Testimg src=x"
```

### CORS Validation
```bash
# ✅ Origens permitidas:
# - http://localhost:3000 (Frontend)
# - http://localhost:3003 (Frontend alt)
# - http://127.0.0.1:3000
# - http://127.0.0.1:3003

# ❌ Origens não permitidas:
# - https://malicious.com
# - https://attacker.com
```

---

## 🔍 Logging

### Request Logging
```
[HTTP Request] | {
  "requestId": "req-1765938940283",
  "method": "GET",
  "path": "/api/streams",
  "ip": "127.0.0.1"
}
```

### Response Logging
```
[HTTP Response] | {
  "requestId": "req-1765938940283",
  "method": "GET",
  "path": "/api/streams",
  "status": 200,
  "duration": 45
}
```

### Error Logging
```
[HTTP Error] | {
  "requestId": "req-1765938940283",
  "error": "Database connection failed",
  "stack": "at Database.connect ..."
}
```

### Security Event Logging
```
[SECURITY EVENT] | {
  "eventType": "sql_injection_attempt",
  "details": "Potential SQL injection detected",
  "method": "POST",
  "path": "/api/auth/login",
  "ip": "127.0.0.1"
}
```

---

## 🧪 Testes

### Executar Todos os Testes
```bash
cd backend
npm test

# Resultado esperado:
# Tests: 39 passed, 12 skipped, 0 failed
```

### Testar Apenas um Suite
```bash
npm test -- auth.test.ts
npm test -- etherscan.integration.test.ts
```

### Testar com Coverage
```bash
npm test -- --coverage
```

---

## 🐛 Troubleshooting

### Rate Limit não está funcionando

**Problema:** Requisições não são limitadas

**Solução:**
```bash
# 1. Verificar se o middleware está registrado
grep -n "security.globalRateLimit()" backend/src/server.ts

# 2. Verificar se a rota está excluída
grep -n "skip:" backend/src/middleware/security.ts

# 3. Rate limit é por IP, então localhost sempre funciona
# Use VPN ou proxy para testar com outros IPs
```

### Headers de segurança não aparecem

**Problema:** curl -I não mostra X-Frame-Options, etc.

**Solução:**
```bash
# 1. Verificar se Helmet está ativo
grep -n "helmet()" backend/src/server.ts

# 2. Helmet deve ser o primeiro middleware
# Deve estar antes de app.use(cors(...))

# 3. Reiniciar servidor
npm start
```

### Health check retorna "error"

**Problema:** GET /health retorna 503 ou 500

**Solução:**
```bash
# 1. Verificar se DATABASE_URL está configurado
echo $DATABASE_URL

# 2. Verificar se banco de dados está rodando
psql -U postgres -d postgres -c "SELECT 1"

# 3. Verificar se RPC_URL está válida
curl https://ethereum-sepolia-rpc.publicnode.com

# 4. Observar logs
npm start  # Sem redirecionamento para ver logs
```

### Logs não aparecem

**Problema:** console.log não aparece

**Solução:**
```bash
# 1. Logs são escritos via logger.info(), logger.error()
# Não use console.log em código novo

# 2. Para debugar, use:
console.log('[DEBUG]', variável)

# 3. Em produção, configure Winston para arquivo:
# backend/src/utils/logger.ts
```

---

## 📚 Documentação Completa

- `MIDDLEWARE_INTEGRATION_SUMMARY.md` - Detalhes técnicos
- `MIDDLEWARE_TESTING_GUIDE.md` - Como testar
- `TECHNICAL_REPORT_FINAL.md` - Relatório final
- `BEFORE_AFTER_COMPARISON.md` - Comparação de estado
- `API.md` - Documentação de endpoints

---

## 🔧 Arquivos Principais

```
backend/src/
├─ middleware/
│  ├─ observability.ts   (150 linhas - Health + Metrics + Logging)
│  ├─ security.ts        (130 linhas - Helmet + Rate Limit + Sanitization)
│  ├─ auth.ts            (Existente - JWT)
│  └─ validation.ts      (Existente - Zod schema)
├─ server.ts             (Modificado - Middlewares integrados)
├─ routes/
│  ├─ auth.ts
│  ├─ streams.ts
│  ├─ pools.ts
│  ├─ 2fa.ts
│  └─ external/
│     ├─ etherscan.ts
│     ├─ moralis.ts
│     ├─ infura.ts
│     └─ elizaos.ts
└─ services/
   └─ external/
      ├─ etherscan.service.ts
      ├─ moralis.service.ts
      ├─ infura.service.ts
      └─ elizaos.service.ts
```

---

## ✅ Checklist de Verificação

- [ ] Backend está rodando: `npm start`
- [ ] Health check responde: `curl http://localhost:3001/health`
- [ ] Métricas disponíveis: `curl http://localhost:3001/metrics`
- [ ] Testes passam: `npm test` (39 passing)
- [ ] Rate limiting funciona: teste com 101 requisições
- [ ] Headers de segurança presentes: `curl -I http://localhost:3001/health`
- [ ] Logging estruturado ativo: check console output
- [ ] SQL injection bloqueado: teste com payload no body

---

## 📞 Suporte Rápido

**Alguém do time precisa de:**

| Precisa | Faça |
|---------|------|
| Health da app | `curl http://localhost:3001/health` |
| Métricas Prometheus | `curl http://localhost:3001/metrics` |
| Info da app | `curl http://localhost:3001/info` |
| Ver logs | `tail -f /tmp/backend.log` |
| Testar rate limit | Ver seção "Testes" acima |
| Entender segurança | Ler `BEFORE_AFTER_COMPARISON.md` |
| Ajuda geral | Ler `MIDDLEWARE_TESTING_GUIDE.md` |

---

**Última atualização:** 17 de Dezembro de 2025  
**Status:** ✅ Production Ready


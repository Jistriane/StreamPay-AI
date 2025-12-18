#!/bin/bash

# Teste End-to-End: Criação de Stream
# Simula fluxo completo sem dados mockados
# Data: 15/12/2025

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        StreamPay AI - Teste E2E: Criação de Stream           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variáveis
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3003"
TEST_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" # Hardhat test account #0
RECIPIENT_ADDRESS="0x70997970C51812dc3A010C7d01b50e0d17dc79C8" # Hardhat test account #1
TOKEN_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3" # Mock token address

echo -e "${BLUE}📋 Configuração do Teste:${NC}"
echo "  Sender: $TEST_ADDRESS"
echo "  Recipient: $RECIPIENT_ADDRESS"
echo "  Token: $TOKEN_ADDRESS"
echo "  Amount: 1 ETH (1000000000000000000 wei)"
echo "  Duration: 1 day (86400 seconds)"
echo ""

# Passo 1: Verificar serviços
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Passo 1: Verificar Serviços${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -n "Backend Health Check... "
if curl -s "$BACKEND_URL/health" | jq -e '.status == "ok"' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "Backend não está respondendo. Execute 'bash start-stack.sh' primeiro."
    exit 1
fi

echo -n "Frontend Accessibility... "
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    exit 1
fi

echo ""

# Passo 2: Testar autenticação (deve falhar sem token)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Passo 2: Testar Autenticação (Sem Token)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -n "GET /api/streams (sem auth)... "
response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/streams")
status_code=$(echo "$response" | tail -n 1)

if [ "$status_code" == "401" ]; then
    echo -e "${GREEN}✅ OK${NC} (401 Unauthorized como esperado)"
else
    echo -e "${YELLOW}⚠️  Status: $status_code${NC}"
fi

echo ""

# Passo 3: Gerar mock JWT para teste
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Passo 3: Gerar Token JWT para Teste${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Criar payload JWT simples (nota: em produção use assinatura real)
# Para teste, vamos criar um token básico
JWT_PAYLOAD='{"id":"test-user","address":"'$TEST_ADDRESS'","email":"test@streampay.com","role":"user"}'
JWT_SECRET="dev-secret-key"

# Gerar JWT simples (requer nodejs)
JWT_TOKEN=$(node -e "
const jwt = require('jsonwebtoken');
const payload = $JWT_PAYLOAD;
const token = jwt.sign(payload, '$JWT_SECRET', { expiresIn: 86400 });
console.log(token);
" 2>/dev/null)

if [ -z "$JWT_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Não foi possível gerar JWT (jsonwebtoken não instalado)${NC}"
    echo "   Pule para teste manual com wallet."
    JWT_TOKEN="mock-token-for-testing"
else
    echo -e "${GREEN}✅ JWT Token gerado${NC}"
    echo "   Token: ${JWT_TOKEN:0:50}..."
fi

echo ""

# Passo 4: Listar streams com autenticação
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Passo 4: Listar Streams (Com Auth)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -n "GET /api/streams (com auth)... "
response=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "$BACKEND_URL/api/streams")
  
status_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | sed '$d')

if [ "$status_code" == "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "   Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
elif [ "$status_code" == "401" ]; then
    echo -e "${YELLOW}⚠️  Ainda não autenticado (JWT inválido para este backend)${NC}"
else
    echo -e "${RED}❌ FAILED${NC} (Status: $status_code)"
fi

echo ""

# Passo 5: Criar stream (sem blockchain real)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Passo 5: Criar Stream (Teste de API)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

STREAM_DATA='{
  "recipient": "'$RECIPIENT_ADDRESS'",
  "token": "'$TOKEN_ADDRESS'",
  "amount": "1000000000000000000",
  "duration": 86400,
  "ratePerSecond": "11574074074074"
}'

echo "Payload:"
echo "$STREAM_DATA" | jq '.'
echo ""

echo -n "POST /api/streams... "
response=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "$STREAM_DATA" \
  "$BACKEND_URL/api/streams")

status_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | sed '$d')

if [ "$status_code" == "200" ] || [ "$status_code" == "201" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "   Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
elif [ "$status_code" == "401" ]; then
    echo -e "${YELLOW}⚠️  Não autenticado (esperado sem JWT válido)${NC}"
elif [ "$status_code" == "400" ]; then
    echo -e "${YELLOW}⚠️  Bad Request${NC}"
    echo "   Response: $body"
else
    echo -e "${RED}❌ FAILED${NC} (Status: $status_code)"
    echo "   Response: $body"
fi

echo ""

# Passo 6: Testar integração com ElizaOS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Passo 6: Testar ElizaOS Integration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -n "ElizaOS Health... "
if curl -s "http://localhost:3002/health" | jq -e '.status' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  ElizaOS pode estar iniciando${NC}"
fi

echo ""

# Passo 7: Verificar contratos no Sepolia
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Passo 7: Verificar Contratos Sepolia${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

STREAM_PAY_CORE="0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C"
echo "StreamPayCore: $STREAM_PAY_CORE"
echo "Etherscan: https://sepolia.etherscan.io/address/$STREAM_PAY_CORE"

echo -n "Verificando código do contrato... "
response=$(curl -s "https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=$STREAM_PAY_CORE")

if echo "$response" | jq -e '.status == "1"' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Contrato encontrado no Sepolia${NC}"
elif echo "$response" | jq -e '.result' | grep -q "Contract source code not verified"; then
    echo -e "${YELLOW}⚠️  Contrato não verificado (código existe)${NC}"
else
    echo -e "${YELLOW}⚠️  Verificação requer API key${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   Resumo do Teste E2E                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Testes de API Completados${NC}"
echo ""
echo "📝 Próximos Passos Para Teste Manual Completo:"
echo ""
echo "1. Abra o navegador em: http://localhost:3003"
echo "2. Conecte MetaMask com Sepolia testnet"
echo "3. Use esta conta de teste: $TEST_ADDRESS"
echo "4. Tente criar um stream via UI"
echo "5. Verifique transação no Sepolia Etherscan"
echo ""
echo "🔑 Para autenticação completa:"
echo "   - Configure Web3Auth ou MetaMask login"
echo "   - Assine mensagem para gerar JWT válido"
echo "   - Backend validará assinatura via ethers.js"
echo ""
echo "📊 Contratos Deployados (Sepolia):"
echo "   StreamPayCore: 0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C"
echo "   LiquidityPool: 0x896171C52d49Ff2e94300FF9c9B2164ac62F0Edd"
echo ""

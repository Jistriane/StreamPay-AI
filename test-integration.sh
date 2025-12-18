#!/bin/bash

# Script de Teste de Integração StreamPay AI
# Data: 15/12/2025

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     StreamPay AI - Teste de Integração Completa              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>&1)
    
    if [ "$response" == "$expected" ]; then
        echo -e "${GREEN}✅ OK${NC} (Status: $response)"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected, Got: $response)"
        return 1
    fi
}

# Função para testar JSON response
test_json_endpoint() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name... "
    response=$(curl -s --connect-timeout 5 "$url" 2>&1)
    
    if echo "$response" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        echo "  Response: $(echo $response | jq -c .)"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "  Response: $response"
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  BACKEND TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_json_endpoint "Backend Health" "http://localhost:3001/health"
test_endpoint "Backend Root" "http://localhost:3001/" "200"
test_endpoint "Backend API" "http://localhost:3001/api" "404"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  FRONTEND TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint "Frontend Home" "http://localhost:3003/" "200"
test_endpoint "Frontend Health" "http://localhost:3003/api/health" "404"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  ELIZAOS TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_json_endpoint "ElizaOS Health" "http://localhost:3002/health"
test_endpoint "ElizaOS Root" "http://localhost:3002/" "200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  DATABASE CONNECTION TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -n "Testing PostgreSQL... "
if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  Not running or not accessible${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  SMART CONTRACT CONNECTION TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -n "Testing Sepolia RPC... "
sepolia_response=$(curl -s -X POST https://sepolia.infura.io/v3/YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>&1)

if echo "$sepolia_response" | grep -q "0xaa36a7"; then
    echo -e "${GREEN}✅ OK${NC} (Chain ID: 11155111)"
else
    echo -e "${YELLOW}⚠️  Requires valid Infura key${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  API INTEGRATION TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test: Create Stream (should fail without auth)
echo -n "Testing Stream Creation (no auth)... "
stream_response=$(curl -s -X POST http://localhost:3001/api/streams \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "token": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "amount": "1000000000000000000",
    "duration": 86400,
    "ratePerSecond": "1000000000000000000"
  }' 2>&1)

if echo "$stream_response" | grep -q "401\|Not authenticated\|Unauthorized"; then
    echo -e "${GREEN}✅ OK${NC} (Auth required as expected)"
else
    echo -e "${YELLOW}⚠️  Unexpected response${NC}"
    echo "  Response: $(echo $stream_response | head -c 100)"
fi

# Test: Get Streams (should fail without auth)
echo -n "Testing Get Streams (no auth)... "
get_response=$(curl -s http://localhost:3001/api/streams 2>&1)

if echo "$get_response" | grep -q "401\|Not authenticated\|Unauthorized"; then
    echo -e "${GREEN}✅ OK${NC} (Auth required as expected)"
else
    echo -e "${YELLOW}⚠️  Unexpected response${NC}"
    echo "  Response: $(echo $get_response | head -c 100)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  ENVIRONMENT VARIABLES CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_env_file() {
    local file=$1
    local name=$2
    
    echo -n "Checking $name... "
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo -e "${GREEN}✅ Exists${NC} ($lines lines)"
    else
        echo -e "${RED}❌ Missing${NC}"
    fi
}

check_env_file "backend/.env" "Backend .env"
check_env_file "frontend/.env" "Frontend .env"
check_env_file "streampay-eliza/.env" "ElizaOS .env"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Test Summary                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Para testes manuais completos:"
echo "  1. Abra http://localhost:3003 no navegador"
echo "  2. Conecte sua wallet MetaMask (Sepolia testnet)"
echo "  3. Tente criar um stream"
echo ""
echo "Para logs detalhados:"
echo "  Backend:  tail -f /tmp/backend_test.log"
echo "  Frontend: tail -f /tmp/frontend_test.log"
echo "  ElizaOS:  tail -f /tmp/eliza_test.log"
echo ""

#!/bin/bash

# Script para iniciar StreamPay AI Stack para testes
# Data: 15/12/2025

echo "🚀 Iniciando StreamPay AI Stack para testes..."
echo ""

# Função para verificar se porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Porta $port já está em uso"
        return 1
    fi
    return 0
}

# Função para esperar serviço
wait_for_service() {
    local name=$1
    local url=$2
    local max_attempts=30
    local attempt=0
    
    echo -n "Esperando $name iniciar"
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo " ✅"
            return 0
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done
    echo " ❌ Timeout"
    return 1
}

# Parar serviços existentes
echo "🛑 Parando serviços existentes..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "next dev" 2>/dev/null
pkill -f "ts-node" 2>/dev/null
pkill -f "elizaos" 2>/dev/null

# Liberar portas específicas
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
lsof -ti:3003 | xargs kill -9 2>/dev/null
sleep 3

echo "✅ Portas 3001, 3002, 3003 liberadas"

# Limpar logs anteriores
rm -f /tmp/backend_test.log /tmp/frontend_test.log /tmp/eliza_test.log

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Iniciando Backend (Porta 3001)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI/backend"
npm run dev > /tmp/backend_test.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

if wait_for_service "Backend" "http://localhost:3001/health"; then
    echo "✅ Backend está rodando em http://localhost:3001"
else
    echo "❌ Backend falhou ao iniciar"
    echo "Últimas linhas do log:"
    tail -20 /tmp/backend_test.log
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Iniciando Frontend (Porta 3003)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI/frontend"
npm run dev > /tmp/frontend_test.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

if wait_for_service "Frontend" "http://localhost:3003"; then
    echo "✅ Frontend está rodando em http://localhost:3003"
else
    echo "❌ Frontend falhou ao iniciar"
    echo "Últimas linhas do log:"
    tail -20 /tmp/frontend_test.log
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Iniciando ElizaOS (Porta 3002)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "/home/jistriane/Documentos/StreamPay AI/StreamPay-AI/streampay-eliza"
npm run dev > /tmp/eliza_test.log 2>&1 &
ELIZA_PID=$!
echo "ElizaOS PID: $ELIZA_PID"

if wait_for_service "ElizaOS" "http://localhost:3002/health"; then
    echo "✅ ElizaOS está rodando em http://localhost:3002"
else
    echo "⚠️  ElizaOS pode demorar mais para iniciar (continuando...)"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              StreamPay AI Stack Iniciada!                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Status dos Serviços:"
echo "  Backend:  http://localhost:3001 (PID: $BACKEND_PID)"
echo "  Frontend: http://localhost:3003 (PID: $FRONTEND_PID)"
echo "  ElizaOS:  http://localhost:3002 (PID: $ELIZA_PID)"
echo ""
echo "📝 Logs disponíveis em:"
echo "  Backend:  /tmp/backend_test.log"
echo "  Frontend: /tmp/frontend_test.log"
echo "  ElizaOS:  /tmp/eliza_test.log"
echo ""
echo "🧪 Para executar testes de integração:"
echo "  bash test-integration.sh"
echo ""
echo "🛑 Para parar todos os serviços:"
echo "  pkill -f 'npm run dev'"
echo ""
echo "Pressione Ctrl+C para parar todos os serviços..."
echo ""

# Manter script rodando
trap "echo ''; echo '🛑 Parando serviços...'; kill $BACKEND_PID $FRONTEND_PID $ELIZA_PID 2>/dev/null; exit 0" INT TERM

wait

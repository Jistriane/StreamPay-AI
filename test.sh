#!/bin/bash

# 🧪 Script de Testes Integrados - StreamPay AI
# Executa testes de frontend + backend

set -e

REPO_DIR="/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1"
FRONTEND_DIR="$REPO_DIR/frontend"
BACKEND_DIR="$REPO_DIR/backend"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  🧪 Testes Integrados - StreamPay AI                         ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
}

print_section() {
    echo -e "${YELLOW}[$1] $2${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

TEST_TYPE="${1:-all}" # all, frontend, backend, integration

print_header
echo ""

FAILED=0

# Frontend Tests
if [ "$TEST_TYPE" != "backend" ] && [ "$TEST_TYPE" != "integration" ]; then
    print_section "1/3" "Testes Frontend..."
    cd "$FRONTEND_DIR"
    if npm test --passWithNoTests 2>&1 | grep -q "FAIL"; then
        print_error "Frontend tests falharam"
        FAILED=1
    else
        print_success "Frontend tests passed"
    fi
    echo ""
fi

# Backend Tests
if [ "$TEST_TYPE" != "frontend" ] && [ "$TEST_TYPE" != "integration" ]; then
    print_section "2/3" "Testes Backend..."
    cd "$BACKEND_DIR"
    if npm test --passWithNoTests 2>&1 | grep -q "FAIL"; then
        print_error "Backend tests falharam"
        FAILED=1
    else
        print_success "Backend tests passed"
    fi
    echo ""
fi

# Integration Tests
if [ "$TEST_TYPE" = "integration" ] || [ "$TEST_TYPE" = "all" ]; then
    print_section "3/3" "Testes de Integração..."
    cd "$BACKEND_DIR"
    if npm test -- integration 2>&1 | grep -q "FAIL"; then
        print_error "Integration tests falharam"
        FAILED=1
    else
        print_success "Integration tests passed"
    fi
    echo ""
fi

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Todos os testes passaram!                                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ Alguns testes falharam                                     ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi

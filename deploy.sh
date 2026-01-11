#!/bin/bash

# 🚀 Script de Deploy Automático - StreamPay AI (Mainnet)
# Este script faz deployment seguro de Frontend + Backend

set -e

# Configuração
REPO_DIR="/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1"
FRONTEND_DIR="$REPO_DIR/frontend"
BACKEND_DIR="$REPO_DIR/backend"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Funções auxiliares
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  🚀 Deploy Automático - StreamPay AI (Mainnet)               ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Modo de operação
DEPLOY_MODE="${1:-both}" # frontend, backend, ou both (padrão)

print_header

# 1. Verificar Git
print_section "1/6" "Verificando configuração Git..."
cd "$REPO_DIR"
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Não é um repositório Git"
    exit 1
fi
print_success "Git configurado"
echo ""

# 2. Verificar branch
print_section "2/6" "Verificando branch..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_info "Você está na branch '$CURRENT_BRANCH'"
    read -p "Deseja continuar? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_error "Deploy cancelado"
        exit 1
    fi
fi
print_success "Branch: $CURRENT_BRANCH"
echo ""

# 3. Validar builds
print_section "3/6" "Validando builds..."

if [ "$DEPLOY_MODE" != "backend" ]; then
    print_info "Validando frontend..."
    cd "$FRONTEND_DIR"
    if ! npm run build > /tmp/frontend_build.log 2>&1; then
        print_error "Erro no build do frontend!"
        tail -20 /tmp/frontend_build.log
        exit 1
    fi
    print_success "Frontend build OK"
fi

if [ "$DEPLOY_MODE" != "frontend" ]; then
    print_info "Validando backend..."
    cd "$BACKEND_DIR"
    if ! npm run build > /tmp/backend_build.log 2>&1; then
        print_error "Erro no build do backend!"
        tail -20 /tmp/backend_build.log
        exit 1
    fi
    print_success "Backend build OK"
fi
echo ""

# 4. Verificar mudanças
print_section "4/6" "Verificando mudanças..."
cd "$REPO_DIR"
if [ -z "$(git status --porcelain)" ]; then
    print_info "Nenhuma mudança detectada"
    print_info "Fazendo commit vazio para acionar deploy..."
    git commit --allow-empty -m "trigger: automated mainnet deployment" 2>/dev/null || true
else
    echo -e "${BLUE}Mudanças detectadas:${NC}"
    git status --short
    read -p "Fazer commit destas mudanças? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git add -A
        git commit -m "feat: mainnet deployment update" || true
    else
        print_error "Deploy cancelado"
        exit 1
    fi
fi
print_success "Preparado para push"
echo ""

# 5. Validar Vercel login
print_section "5/6" "Verificando Vercel..."
if ! vercel --version > /dev/null 2>&1; then
    print_error "Vercel CLI não encontrado"
    echo "Instale com: npm install -g vercel"
    exit 1
fi
print_success "Vercel CLI está pronto"
echo ""

# 6. Push para main (aciona GitHub Actions)
print_section "6/6" "Enviando para GitHub..."
print_info "Isso vai acionar o GitHub Actions automaticamente"
if ! git push origin main; then
    print_error "Erro ao fazer push"
    exit 1
fi

# Sucesso!
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Deploy Acionado com Sucesso!                              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 Monitore o deploy em:${NC}"
echo -e "   • GitHub Actions: ${BLUE}https://github.com/Jistriane/StreamPay-AI/actions${NC}"
echo -e "   • Vercel Dashboard: ${BLUE}https://vercel.com/dashboard${NC}"
echo -e "   • Terminal: ${BLUE}vercel logs --follow${NC}"
echo ""

echo -e "${BLUE}📝 Serviços a serem deployados:${NC}"
case $DEPLOY_MODE in
    frontend)
        echo "   • Frontend (Next.js) → https://stream-pay-ai.vercel.app"
        ;;
    backend)
        echo "   • Backend (Express) → https://stream-pay-ai.vercel.app"
        ;;
    both|*)
        echo "   • Frontend (Next.js) → https://stream-pay-ai.vercel.app"
        echo "   • Backend (Express) → https://stream-pay-ai.vercel.app"
        ;;
esac
echo ""

echo -e "${YELLOW}⏱️  Tempo estimado: 2-5 minutos${NC}"
echo -e "${YELLOW}📧 Você receberá notificações do GitHub${NC}"
echo ""

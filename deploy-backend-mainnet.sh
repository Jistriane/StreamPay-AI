#!/bin/bash

# 🚀 Script de Deploy Automático para Backend Mainnet StreamPay AI
# Este script faz deployment seguro sem alterar código

set -e

BACKEND_DIR="/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1/backend"
REPO_DIR="/home/jistriane/Documentos/StreamPay AI/StreamPay-AI-1"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🚀 Deploy Automático Backend - StreamPay AI (Mainnet)      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Verificar Git
echo -e "${YELLOW}[1/5] Verificando configuração Git...${NC}"
cd "$REPO_DIR"
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Não é um repositório Git${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git configurado corretamente${NC}"
echo ""

# 2. Verificar branch
echo -e "${YELLOW}[2/5] Verificando branch...${NC}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Você está na branch '$CURRENT_BRANCH'${NC}"
    echo -e "${YELLOW}ℹ️  Deploy automático só ocorre em 'main'${NC}"
    read -p "Deseja continuar? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${RED}Cancelado${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Branch: $CURRENT_BRANCH${NC}"
echo ""

# 3. Validar build do backend
echo -e "${YELLOW}[3/5] Validando build backend (segurança)...${NC}"
cd "$BACKEND_DIR"
npm run build > /tmp/backend_build.log 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build do backend!${NC}"
    echo -e "${RED}Logs:${NC}"
    tail -20 /tmp/backend_build.log
    exit 1
fi
echo -e "${GREEN}✅ Build backend validado com sucesso${NC}"
echo ""

# 4. Verificar mudanças
echo -e "${YELLOW}[4/5] Verificando mudanças...${NC}"
cd "$REPO_DIR"
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}ℹ️  Nenhuma mudança detectada${NC}"
    echo -e "${YELLOW}ℹ️  Fazendo commit vazio para acionar deploy...${NC}"
    git commit --allow-empty -m "trigger: automated backend mainnet deployment" 2>/dev/null || true
else
    echo -e "${BLUE}Mudanças detectadas:${NC}"
    git status --short
    read -p "Fazer commit destas mudanças? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git add -A
        git commit -m "feat: backend update for mainnet deployment" || true
    else
        echo -e "${YELLOW}Cancelado${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Preparado para push${NC}"
echo ""

# 5. Push para main (aciona GitHub Actions)
echo -e "${YELLOW}[5/5] Enviando para GitHub (aciona deploy automático)...${NC}"
echo -e "${BLUE}ℹ️  Isso vai acionar o GitHub Actions automaticamente${NC}"
git push origin main

# Sucesso!
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Deploy Backend Acionado com Sucesso!                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Links úteis
echo -e "${BLUE}📊 Monitore o deploy em:${NC}"
echo -e "   • GitHub Actions: ${BLUE}https://github.com/Jistriane/StreamPay-AI/actions${NC}"
echo -e "   • Vercel Dashboard: ${BLUE}https://vercel.com/dashboard${NC}"
echo -e "   • Ver logs: ${BLUE}vercel logs${NC}"
echo ""

echo -e "${BLUE}ℹ️  Detalhes:${NC}"
echo "   • Rede: Polygon Mainnet (Chain ID: 137)"
echo "   • Ambiente: Production"
echo "   • Workflow: GitHub Actions"
echo ""

echo -e "${YELLOW}⏱️  Tempo estimado de deploy: 2-5 minutos${NC}"
echo -e "${YELLOW}📧 Você receberá notificações do GitHub quando o deploy terminar${NC}"
echo ""

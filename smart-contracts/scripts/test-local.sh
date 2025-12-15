#!/bin/bash
# scripts/test-local.sh
# Script para compilar, deployer e testar contratos localmente

set -e

echo "🔧 StreamPay Smart Contracts - Local Testing"
echo "════════════════════════════════════════════════════════════════"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}📦 Instalando dependências...${NC}"
  npm install
fi

# 2. Compile contracts
echo -e "\n${BLUE}🔨 Compilando contratos...${NC}"
npx hardhat compile

# 3. Run tests
echo -e "\n${BLUE}🧪 Executando testes unitários...${NC}"
npx hardhat test

# 4. Start local node (optional)
if [ "$1" == "--node" ]; then
  echo -e "\n${BLUE}🚀 Iniciando nó local Hardhat...${NC}"
  echo -e "${YELLOW}Execute em outro terminal:${NC}"
  echo -e "${YELLOW}  npx hardhat run scripts/deploy.js --network localhost${NC}"
  npx hardhat node
else
  # 5. Deploy to local hardhat network
  echo -e "\n${BLUE}🚀 Deployando contratos na rede local...${NC}"
  npx hardhat run scripts/deploy.js --network hardhat

  # 6. Display contract sizes
  echo -e "\n${BLUE}📊 Tamanho dos Contratos:${NC}"
  npx hardhat size-contracts 2>/dev/null || echo "Size plugin não instalado"
fi

echo -e "\n${GREEN}✨ Teste local concluído com sucesso!${NC}"
echo ""

#!/bin/bash
# scripts/deploy-mumbai.sh
# Script para deployer contratos no Polygon Mumbai testnet

set -e

echo "🚀 StreamPay Smart Contracts - Polygon Mumbai Deployment"
echo "════════════════════════════════════════════════════════════════"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check environment variables
if [ -z "$POLYGON_MUMBAI_PRIVATE_KEY" ]; then
  echo -e "${RED}❌ ERRO: POLYGON_MUMBAI_PRIVATE_KEY não está definida!${NC}"
  echo -e "${YELLOW}Configure no .env:${NC}"
  echo -e "${YELLOW}  POLYGON_MUMBAI_PRIVATE_KEY=sua_chave_privada${NC}"
  exit 1
fi

if [ -z "$POLYGONSCAN_API_KEY" ]; then
  echo -e "${YELLOW}⚠️ AVISO: POLYGONSCAN_API_KEY não está definida (verificação não será possível)${NC}"
fi

# 1. Check balance
echo -e "\n${BLUE}💰 Verificando saldo da conta...${NC}"
npx hardhat run scripts/check-balance.js --network polygon_mumbai

# 2. Compile
echo -e "\n${BLUE}🔨 Compilando contratos...${NC}"
npx hardhat compile

# 3. Deploy
echo -e "\n${BLUE}🚀 Deployando contratos no Mumbai...${NC}"
npx hardhat run scripts/deploy.js --network polygon_mumbai

# 4. Verify contracts (optional)
read -p "Deseja verificar os contratos no PolygonScan? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo -e "\n${BLUE}🔍 Verificando contratos...${NC}"
  npx hardhat run scripts/verify-contracts.js --network polygon_mumbai
fi

echo -e "\n${GREEN}✨ Deployment no Mumbai concluído!${NC}"
echo -e "${YELLOW}Próximos passos:${NC}"
echo -e "  1. Copie os endereços dos contratos"
echo -e "  2. Atualize o arquivo .env no backend"
echo -e "  3. Atualize os endereços no frontend"
echo ""

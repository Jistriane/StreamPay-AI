#!/bin/bash
# Script para configurar rapidamente o ambiente de testnet Sepolia

echo "🔧 Configurando ambiente para Sepolia testnet..."

# Criar .env se não existir
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado"
fi

# Endereços padrão para Sepolia
export TOKEN_ADDRESS="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"  # USDC Sepolia
export UNISWAP_POSITION_MANAGER="0x1238536071E1c677A632429e3655c799b22cDA52"
export UNISWAP_FACTORY="0x0227628f3F023bb0B980b67D528571c95c6DaC1c"
export USE_MOCK="false"

echo "📋 Variáveis configuradas:"
echo "  TOKEN_ADDRESS=$TOKEN_ADDRESS (USDC Sepolia)"
echo "  UNISWAP_POSITION_MANAGER=$UNISWAP_POSITION_MANAGER"
echo "  UNISWAP_FACTORY=$UNISWAP_FACTORY"
echo "  USE_MOCK=$USE_MOCK"
echo ""

# Verificar se private key está configurada
if ! grep -q "SEPOLIA_PRIVATE_KEY=e84bd6fe9332b78caeaba536a2f2ba9033e9cabdf8f86cad8a627545a1750904" .env && \
   ! grep -q "SEPOLIA_PRIVATE_KEY=your-sepolia-private-key" .env; then
    echo "⚠️  ATENÇÃO: Configure SEPOLIA_PRIVATE_KEY no arquivo .env"
    echo "   Substitua 'your-sepolia-private-key' pela sua chave privada"
else
    echo "✅ SEPOLIA_PRIVATE_KEY encontrada"
fi

echo ""
echo "📝 Próximos passos:"
echo "  1. Edite .env e adicione sua SEPOLIA_PRIVATE_KEY"
echo "  2. Verifique se tem ETH Sepolia (faucet: https://sepoliafaucet.com)"
echo "  3. Execute: npm run test:fork  # testar em fork local"
echo "  4. Execute: npm run deploy:sepolia  # deploy real"
echo ""

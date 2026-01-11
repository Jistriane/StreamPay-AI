#!/bin/bash

# StreamPay Frontend - Vercel Deployment Setup Script
# This script configures and deploys the frontend to Vercel for mainnet

set -e

echo "🚀 StreamPay Frontend - Vercel Deployment Setup"
echo "================================================\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

# Step 1: Authentication
echo "🔑 Step 1: Vercel Authentication"
echo "Please login to your Vercel account..."
vercel login

# Step 2: Project Setup
echo ""
echo "📁 Step 2: Vercel Project Setup"
echo "Linking your project to Vercel..."

vercel link

# Export project IDs from Vercel config
if [ -f .vercel/project.json ]; then
    export VERCEL_PROJECT_ID=$(jq -r '.projectId' .vercel/project.json)
    export VERCEL_ORG_ID=$(jq -r '.orgId' .vercel/project.json)
    echo "✅ Project linked successfully!"
fi

# Step 3: Environment Variables
echo ""
echo "🔐 Step 3: Configure Environment Variables"
echo "Select network for environment:"
echo "1) Polygon Mainnet (Production)"
echo "2) Sepolia Testnet (Development)"
read -p "Choice [1]: " network_choice
network_choice=${network_choice:-1}

if [ "$network_choice" = "1" ]; then
    echo "🌐 Configuring for Polygon Mainnet..."
    CHAIN_ID=137
    BACKEND_URL="https://api.streampay.io"
    ELIZA_URL="https://agent.streampay.io"
    STREAM_PAY_CORE="0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD"
    LIQUIDITY_POOL="0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c"
    POOL_MANAGER="0xae185cA95D0b626a554b0612777350CE3DE06bB9"
    SWAP_ROUTER="0x07AfFa6C58999Ac0c98237d10476983A573eD368"
    TOKEN_ADDRESS="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
else
    echo "🧪 Configuring for Sepolia Testnet..."
    CHAIN_ID=11155111
    BACKEND_URL="http://localhost:3001"
    ELIZA_URL="http://localhost:3000"
    STREAM_PAY_CORE="0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C"
    LIQUIDITY_POOL="0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd"
    POOL_MANAGER="0x0F71393348E7b021E64e7787956fB1e7682AB4A8"
    SWAP_ROUTER="0x9f3d42feC59d6742CC8dC096265Aa27340C1446F"
    TOKEN_ADDRESS="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
fi

read -p "Enter WalletConnect Project ID: " wallet_connect_id

echo ""
echo "📝 Setting environment variables in Vercel..."

# Create .env.production.local for local testing
cat > frontend/.env.production.local <<EOF
NEXT_PUBLIC_CHAIN_ID=$CHAIN_ID
NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL
NEXT_PUBLIC_ELIZA_URL=$ELIZA_URL
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=$wallet_connect_id
NEXT_PUBLIC_STREAM_PAY_CORE_ADDRESS=$STREAM_PAY_CORE
NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS=$LIQUIDITY_POOL
NEXT_PUBLIC_POOL_MANAGER_ADDRESS=$POOL_MANAGER
NEXT_PUBLIC_SWAP_ROUTER_ADDRESS=$SWAP_ROUTER
NEXT_PUBLIC_TOKEN_ADDRESS=$TOKEN_ADDRESS
EOF

echo "✅ Local .env.production.local created"

# Add to Vercel project
echo "Adding variables to Vercel project..."
vercel env add NEXT_PUBLIC_CHAIN_ID production <<< "$CHAIN_ID"
vercel env add NEXT_PUBLIC_BACKEND_URL production <<< "$BACKEND_URL"
vercel env add NEXT_PUBLIC_ELIZA_URL production <<< "$ELIZA_URL"
vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID production <<< "$wallet_connect_id"
vercel env add NEXT_PUBLIC_STREAM_PAY_CORE_ADDRESS production <<< "$STREAM_PAY_CORE"
vercel env add NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS production <<< "$LIQUIDITY_POOL"
vercel env add NEXT_PUBLIC_POOL_MANAGER_ADDRESS production <<< "$POOL_MANAGER"
vercel env add NEXT_PUBLIC_SWAP_ROUTER_ADDRESS production <<< "$SWAP_ROUTER"
vercel env add NEXT_PUBLIC_TOKEN_ADDRESS production <<< "$TOKEN_ADDRESS"

echo "✅ Environment variables added to Vercel"

# Step 4: GitHub Actions Setup
echo ""
echo "🤖 Step 4: GitHub Actions Setup (Manual)"
echo "You need to add these secrets manually to GitHub:"
echo "   Repository → Settings → Secrets and variables → Actions"
echo ""

# Try to extract project info
if [ -f .vercel/project.json ]; then
    VERCEL_ORG_ID=$(jq -r '.orgId' .vercel/project.json)
    VERCEL_PROJECT_ID=$(jq -r '.projectId' .vercel/project.json)
    echo "   VERCEL_ORG_ID=$VERCEL_ORG_ID"
    echo "   VERCEL_PROJECT_ID=$VERCEL_PROJECT_ID"
    echo ""
fi

read -p "Have you added VERCEL_TOKEN to GitHub secrets? (y/n) [y]: " github_setup
github_setup=${github_setup:-y}

if [ "$github_setup" != "y" ]; then
    echo "⚠️  Please add VERCEL_TOKEN first:"
    echo "   1. Go to https://vercel.com/account/tokens"
    echo "   2. Create a new token"
    echo "   3. Add it to GitHub as VERCEL_TOKEN secret"
    echo "   Then re-run this script"
    exit 1
fi

# Step 5: Deploy
echo ""
echo "🚀 Step 5: Initial Deploy to Production"
read -p "Deploy to production now? (y/n) [y]: " deploy_now
deploy_now=${deploy_now:-y}

if [ "$deploy_now" = "y" ]; then
    echo "🔨 Building and deploying to Vercel production..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment complete!"
        echo "🌐 Visit your deployment at your Vercel project dashboard"
    else
        echo "❌ Deployment failed. Check the logs above."
        exit 1
    fi
else
    echo "⏭️  Skipping initial deploy."
    echo "To deploy later, run: vercel --prod"
fi

echo ""
echo "📚 Next steps:"
echo "1. ✅ Frontend configured for mainnet (Chain ID: 137)"
echo "2. ✅ Environment variables set in Vercel"
echo "3. ⚠️  MANUAL: Add GitHub secrets for automated CI/CD"
echo "   - Go to: GitHub → Repository → Settings → Secrets and variables → Actions"
echo "   - Add VERCEL_TOKEN from https://vercel.com/account/tokens"
echo "   - Add VERCEL_ORG_ID and VERCEL_PROJECT_ID"
echo "4. 📝 Update backend URL if needed (currently: $BACKEND_URL)"
echo "5. 🎯 Push code to main branch → automatic deployment starts"
echo ""
echo "📖 Full guide: cat VERCEL_DEPLOYMENT.md"
echo ""
echo "✨ Setup complete!"

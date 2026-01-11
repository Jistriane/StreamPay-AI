// scripts/deploy-poolmanager.js
// Deploy específico do PoolManager para Polygon Mainnet
import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("🚀 Iniciando deployment do PoolManager na Polygon Mainnet...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deployando com conta: ${deployer.address}`);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Saldo: ${hre.ethers.formatEther(balance)} MATIC\n`);

  // Verificar rede
  const network = await deployer.provider.getNetwork();
  console.log(`🌐 Network: ${hre.network.name} (Chain ID: ${network.chainId})`);
  
  if (network.chainId !== 137n) {
    throw new Error(`❌ Esta script deve ser executado na Polygon Mainnet (Chain ID 137). Chain ID atual: ${network.chainId}`);
  }

  // Endereços do Uniswap V3 na Polygon Mainnet
  const UNISWAP_POSITION_MANAGER = process.env.UNISWAP_POSITION_MANAGER;
  const UNISWAP_FACTORY = process.env.UNISWAP_FACTORY;

  if (!UNISWAP_POSITION_MANAGER || !UNISWAP_FACTORY) {
    throw new Error("❌ UNISWAP_POSITION_MANAGER e UNISWAP_FACTORY devem estar definidos no .env");
  }

  // Normalizar endereços com checksum correto
  const positionManager = hre.ethers.getAddress(UNISWAP_POSITION_MANAGER.toLowerCase());
  const factory = hre.ethers.getAddress(UNISWAP_FACTORY.toLowerCase());

  console.log(`\n📋 Configuração Uniswap V3:`);
  console.log(`   Position Manager: ${positionManager}`);
  console.log(`   Factory: ${factory}\n`);

  try {
    // Deploy PoolManager
    console.log("🔨 Deployando PoolManager...");
    const PoolManager = await hre.ethers.getContractFactory("PoolManager");
    const poolManager = await PoolManager.deploy(positionManager, factory);
    
    console.log("⏳ Aguardando confirmação...");
    await poolManager.waitForDeployment();
    
    const poolManagerAddress = await poolManager.getAddress();
    console.log(`\n✅ PoolManager deployado com sucesso!`);
    console.log(`📍 Endereço: ${poolManagerAddress}`);
    console.log(`🔍 Polygonscan: https://polygonscan.com/address/${poolManagerAddress}\n`);

    // Aguardar algumas confirmações antes de verificar
    console.log("⏳ Aguardando 5 blocos para verificação...");
    await poolManager.deploymentTransaction().wait(5);

    // Save deployment info
    const deploymentInfo = {
      network: "polygon_mainnet",
      chainId: Number(network.chainId),
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contract: {
        name: "PoolManager",
        address: poolManagerAddress,
        constructorArgs: [positionManager, factory],
      },
      uniswap: {
        positionManager: positionManager,
        factory: factory,
      },
    };

    // Save to file
    const deploymentPath = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentPath)) {
      fs.mkdirSync(deploymentPath, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `polygon-poolmanager-${timestamp}.json`;
    const filepath = path.join(deploymentPath, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Informações de deployment salvas em: ${filename}\n`);

    // Verificar contrato no Polygonscan
    if (process.env.POLYGONSCAN_API_KEY) {
      try {
        console.log("🔍 Verificando contrato no Polygonscan...");
        await hre.run("verify:verify", {
          address: poolManagerAddress,
          constructorArguments: [positionManager, factory],
        });
        console.log("✅ Contrato verificado com sucesso!\n");
      } catch (error) {
        console.log(`⚠️  Erro na verificação: ${error.message}`);
        console.log("   Você pode verificar manualmente depois em https://polygonscan.com\n");
      }
    }

    // Instruções para atualizar .env
    console.log("=" .repeat(70));
    console.log("📋 PRÓXIMOS PASSOS:");
    console.log("=" .repeat(70));
    console.log("\n1️⃣ Atualize o arquivo backend/.env.polygon:");
    console.log(`   POOL_MANAGER_ADDRESS=${poolManagerAddress}`);
    console.log("\n2️⃣ Se necessário, atualize também o frontend/.env:");
    console.log(`   NEXT_PUBLIC_POOL_MANAGER_ADDRESS=${poolManagerAddress}`);
    console.log("\n3️⃣ Verifique o contrato no Polygonscan:");
    console.log(`   https://polygonscan.com/address/${poolManagerAddress}`);
    console.log("\n" + "=" .repeat(70) + "\n");

    return {
      poolManager: poolManagerAddress,
      deployer: deployer.address,
      network: hre.network.name,
    };

  } catch (error) {
    console.error("\n❌ Erro durante o deployment:");
    console.error(error);
    throw error;
  }
}

// Execute o script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

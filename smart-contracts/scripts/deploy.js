// scripts/deploy.js
import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("🚀 Iniciando deployment de contratos inteligentes...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deployando com conta: ${deployer.address}`);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Saldo: ${hre.ethers.formatEther(balance)} ETH\n`);

  const deployedContracts = {};

  // Flags e endereços externos
  const USE_MOCK = process.env.USE_MOCK === "true";
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
  const UNISWAP_POSITION_MANAGER = process.env.UNISWAP_POSITION_MANAGER;
  const UNISWAP_FACTORY = process.env.UNISWAP_FACTORY;

  try {
    let erc20Address = TOKEN_ADDRESS;

    if (USE_MOCK) {
      console.log("1️⃣ Deployando ERC20Mock (modo mock ativado)...");
      const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
      const erc20 = await ERC20Mock.deploy();
      await erc20.waitForDeployment();
      erc20Address = await erc20.getAddress();
      deployedContracts.ERC20Mock = erc20Address;
      console.log(`✅ ERC20Mock implantado em: ${erc20Address}\n`);
    } else {
      if (!TOKEN_ADDRESS) {
        throw new Error("TOKEN_ADDRESS ausente. Defina TOKEN_ADDRESS para usar token real.");
      }
      console.log(`1️⃣ Usando token real em: ${TOKEN_ADDRESS}`);
    }

    // 2. Deploy StreamPayCore
    console.log("2️⃣ Deployando StreamPayCore...");
    const StreamPayCore = await hre.ethers.getContractFactory("StreamPayCore");
    const streamPayCore = await StreamPayCore.deploy();
    await streamPayCore.waitForDeployment();
    const streamPayCoreAddress = await streamPayCore.getAddress();
    deployedContracts.StreamPayCore = streamPayCoreAddress;
    console.log(`✅ StreamPayCore implantado em: ${streamPayCoreAddress}\n`);

    // 3. Deploy LiquidityPool
    console.log("3️⃣ Deployando LiquidityPool...");
    const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
    const liquidityPool = await LiquidityPool.deploy();
    await liquidityPool.waitForDeployment();
    const liquidityPoolAddress = await liquidityPool.getAddress();
    deployedContracts.LiquidityPool = liquidityPoolAddress;
    console.log(`✅ LiquidityPool implantado em: ${liquidityPoolAddress}\n`);

    // 4. Deploy PoolManager
    console.log("4️⃣ Deployando PoolManager...");
    if (!UNISWAP_POSITION_MANAGER || !UNISWAP_FACTORY) {
      throw new Error("UNISWAP_POSITION_MANAGER e UNISWAP_FACTORY são obrigatórios para PoolManager.");
    }
    const PoolManager = await hre.ethers.getContractFactory("PoolManager");
    const poolManager = await PoolManager.deploy(UNISWAP_POSITION_MANAGER, UNISWAP_FACTORY);
    await poolManager.waitForDeployment();
    const poolManagerAddress = await poolManager.getAddress();
    deployedContracts.PoolManager = poolManagerAddress;
    console.log(`✅ PoolManager implantado em: ${poolManagerAddress}\n`);

    // 5. Deploy SwapRouter
    console.log("5️⃣ Deployando SwapRouter...");
    const SwapRouter = await hre.ethers.getContractFactory("SwapRouter");
    const swapRouter = await SwapRouter.deploy(liquidityPoolAddress);
    await swapRouter.waitForDeployment();
    const swapRouterAddress = await swapRouter.getAddress();
    deployedContracts.SwapRouter = swapRouterAddress;
    console.log(`✅ SwapRouter implantado em: ${swapRouterAddress}\n`);

    // Save deployment addresses
    const deploymentInfo = {
      network: hre.network.name,
      chainId: Number((await deployer.provider.getNetwork()).chainId),
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
    };

    const deploymentPath = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentPath)) {
      fs.mkdirSync(deploymentPath, { recursive: true });
    }

    const filename = path.join(deploymentPath, `${hre.network.name}-${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📦 Deployment info salvo em: ${filename}\n`);

    // Also update .env.example
    updateEnvFile(deployedContracts);

    console.log("✨ ═══════════════════════════════════════════════════════════");
    console.log("✨ DEPLOYMENT CONCLUÍDO COM SUCESSO!");
    console.log("✨ ═══════════════════════════════════════════════════════════\n");

    console.log("📋 Endereços dos Contratos:");
    if (USE_MOCK) {
      console.log(`   ERC20Mock:      ${deployedContracts.ERC20Mock}`);
    }
    if (!USE_MOCK) {
      console.log(`   Token (real):   ${erc20Address}`);
    }
    console.log(`   StreamPayCore:  ${deployedContracts.StreamPayCore}`);
    console.log(`   LiquidityPool:  ${deployedContracts.LiquidityPool}`);
    console.log(`   PoolManager:    ${deployedContracts.PoolManager}`);
    console.log(`   SwapRouter:     ${deployedContracts.SwapRouter}`);
    console.log("\n");

    return deployedContracts;
  } catch (error) {
    console.error("❌ Erro durante deployment:", error);
    process.exit(1);
  }
}

function updateEnvFile(contracts) {
  try {
    const envPath = path.join(__dirname, "../.env.example");
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, "utf8");

      // Update contract addresses
      content = content.replace(
        /ERC20_MOCK_ADDRESS=.*/,
        `ERC20_MOCK_ADDRESS=${contracts.ERC20Mock}`
      );
      content = content.replace(
        /STREAM_PAY_CORE_ADDRESS=.*/,
        `STREAM_PAY_CORE_ADDRESS=${contracts.StreamPayCore}`
      );
      content = content.replace(
        /LIQUIDITY_POOL_ADDRESS=.*/,
        `LIQUIDITY_POOL_ADDRESS=${contracts.LiquidityPool}`
      );
      content = content.replace(
        /POOL_MANAGER_ADDRESS=.*/,
        `POOL_MANAGER_ADDRESS=${contracts.PoolManager}`
      );
      content = content.replace(
        /SWAP_ROUTER_ADDRESS=.*/,
        `SWAP_ROUTER_ADDRESS=${contracts.SwapRouter}`
      );

      fs.writeFileSync(envPath, content);
      console.log("✅ Arquivo .env.example atualizado!\n");
    }
  } catch (error) {
    console.warn("⚠️ Não foi possível atualizar .env.example:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

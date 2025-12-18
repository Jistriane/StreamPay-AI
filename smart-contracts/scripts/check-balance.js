// scripts/check-balance.js
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);
  
  console.log(`\n📝 Endereço: ${deployer.address}`);
  console.log(`💰 Saldo: ${hre.ethers.formatEther(balance)} ETH`);
  
  // Get network info
  const network = await deployer.provider.getNetwork();
  console.log(`🌐 Rede: ${hre.network.name} (Chain ID: ${network.chainId})`);
  
  // Check if balance is sufficient
  const minBalance = hre.ethers.parseEther("0.1");
  if (balance < minBalance) {
    console.log(`\n⚠️ AVISO: Saldo baixo! Mínimo recomendado: 0.1 ETH`);
    console.log(`Faucet: https://faucet.polygon.technology/`);
  } else {
    console.log(`\n✅ Saldo suficiente para deployment`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import hardhat from "hardhat";
const { ethers } = hardhat as any;
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  console.log("🚀 Deploying StreamPayCore");
  console.log("👤 Deployer:", deployer.address);
  console.log("🌐 ChainId:", Number(network.chainId));

  const Core = await ethers.getContractFactory("StreamPayCore");
  const core = await Core.deploy();
  await core.waitForDeployment();
  const address = await core.getAddress();

  console.log("✅ StreamPayCore deployed at:", address);

  // Persist deployment info
  const ts = Date.now();
  const outDir = path.join(process.cwd(), "deployments");
  const outFile = path.join(outDir, `${network.name || "network"}-streampaycore-${ts}.json`);
  const payload = {
    network: network.name,
    chainId: Number(network.chainId),
    contract: "StreamPayCore",
    address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));
  console.log("📝 Saved deployment:", outFile);
}

main().catch((err) => {
  console.error("❌ Deploy failed:", err);
  process.exit(1);
});

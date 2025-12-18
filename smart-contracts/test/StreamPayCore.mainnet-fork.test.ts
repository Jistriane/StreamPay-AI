import { expect } from "chai";
import hardhat from "hardhat";

const { ethers, network } = hardhat;

// Teste opcional que usa fork da mainnet para validar fluxo real com USDC
// Requer envs: FORKING=true e MAINNET_RPC_URL configurado
const FORK_ENABLED = process.env.FORKING === "true" && !!process.env.MAINNET_RPC_URL;

// Endereços mainnet (dados reais)
const USDC_MAINNET = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_WHALE = "0x28C6c06298d514Db089934071355E5743bf21d60"; // Binance 14

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
  "function decimals() view returns (uint8)",
];

type SimpleERC20 = {
  balanceOf: (addr: string) => Promise<bigint>;
  transfer: (to: string, amt: bigint) => Promise<any>;
  approve: (to: string, amt: bigint) => Promise<any>;
  decimals: () => Promise<number>;
};

(FORK_ENABLED ? describe : describe.skip)("StreamPayCore - mainnet fork (USDC)", function () {
  this.timeout(300_000);

  it("cria stream real com USDC e permite claim", async function () {
    const [deployer, recipient] = await ethers.getSigners();

    // Garantir saldo de ETH para o whale (necessário para transfer/approve)
    const richEth = "0x3635C9ADC5DEA00000"; // 1000 ETH em hex
    await network.provider.send("hardhat_setBalance", [USDC_WHALE, richEth]);

    const whale = await ethers.getImpersonatedSigner(USDC_WHALE);
    const usdc = new ethers.Contract(USDC_MAINNET, ERC20_ABI, whale) as unknown as SimpleERC20;

    const decimals = await usdc.decimals();
    expect(decimals).to.equal(6);

    const amount = 1_000_000n; // 1 USDC (6 decimals)
    // Transfere 10 USDC para o deployer
    const fundAmount = 10n * amount;
    await usdc.transfer(deployer.address, fundAmount);

    // Deploy contrato
    const StreamPayCore = await ethers.getContractFactory("StreamPayCore");
    const core = await StreamPayCore.deploy();
    await core.waitForDeployment();

    // Approve USDC e cria stream de 5 USDC por 5 horas (3600*5)
    const ratePerSecond =  (5n * amount) / 18_000n; // 5 USDC / 5h
    const duration = 18_000; // 5 horas em segundos

    await usdc.connect(deployer).approve(core.target as string, fundAmount);

    const tx = await core
      .connect(deployer)
      .createStream(recipient.address, USDC_MAINNET, fundAmount, ratePerSecond, duration);

    await expect(tx).to.emit(core, "StreamCreated");

    // Avança 1 hora para acumular saldo
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    const claimable = await core.availableToClaim(0);
    expect(claimable).to.be.greaterThan(0n);

    // Recipient faz claim
    const coreAsRecipient = core.connect(recipient);
    const before = await usdc.balanceOf(recipient.address);
    await coreAsRecipient.claim(0);
    const after = await usdc.balanceOf(recipient.address);
    expect(after).to.be.greaterThan(before);
  });
});

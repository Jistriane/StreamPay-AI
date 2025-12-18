import { expect } from "chai";
import hardhat from "hardhat";

const { ethers, network } = hardhat;

// Teste de integração em fork de testnet (ex.: Sepolia) com token real e conta real (whale)
// Requer variáveis de ambiente:
//   FORKING=true
//   TESTNET_RPC_URL=<rpc da testnet para forking>
//   TESTNET_TOKEN_ADDRESS=<token real na testnet>
//   TESTNET_TOKEN_WHALE=<conta com saldo desse token>
// Opcional: STREAM_DURATION_SECONDS (default 3600)
const FORK_ENABLED =
  process.env.FORKING === "true" &&
  !!process.env.TESTNET_RPC_URL &&
  !!process.env.TESTNET_TOKEN_ADDRESS &&
  !!process.env.TESTNET_TOKEN_WHALE;

const TOKEN = process.env.TESTNET_TOKEN_ADDRESS || "";
const TOKEN_WHALE = process.env.TESTNET_TOKEN_WHALE || "";
const STREAM_DURATION = parseInt(process.env.STREAM_DURATION_SECONDS || "3600", 10);

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

(FORK_ENABLED ? describe : describe.skip)("StreamPayCore - fork testnet (token real)", function () {
  this.timeout(300_000);

  it("cria stream com token real e permite claim", async function () {
    const [deployer, recipient] = await ethers.getSigners();

    // Garantir ETH para o whale (cobre gas em operações de token)
    const richEth = "0x52B7D2DCC80CD2E4000000"; // 10,000 ETH em hex
    await network.provider.send("hardhat_setBalance", [TOKEN_WHALE, richEth]);

    const whale = await ethers.getImpersonatedSigner(TOKEN_WHALE);
    const token = new ethers.Contract(TOKEN, ERC20_ABI, whale) as unknown as SimpleERC20;

    const decimals = await token.decimals();
    const unit = 10n ** BigInt(decimals);
    const totalTransfer = 10n * unit; // transfere 10 unidades do token para o deployer

    await token.transfer(deployer.address, totalTransfer);

    // Deploy contrato
    const StreamPayCore = await ethers.getContractFactory("StreamPayCore");
    const core = await StreamPayCore.deploy();
    await core.waitForDeployment();

    // Approve e cria stream de 5 tokens ao longo da duração configurada
    const deposit = totalTransfer;
    const ratePerSecond = (5n * unit) / BigInt(STREAM_DURATION);
    await token
      .connect(deployer)
      .approve(core.target as string, deposit);

    const tx = await core
      .connect(deployer)
      .createStream(recipient.address, TOKEN, deposit, ratePerSecond, STREAM_DURATION);

    await expect(tx).to.emit(core, "StreamCreated");

    // Avança 10% do tempo para acumular saldo
    const advance = Math.max(1, Math.floor(STREAM_DURATION / 10));
    await network.provider.send("evm_increaseTime", [advance]);
    await network.provider.send("evm_mine");

    const claimable = await core.availableToClaim(0);
    expect(claimable).to.be.greaterThan(0n);

    const tokenAsRecipient = token as any as SimpleERC20;
    const before = await tokenAsRecipient.balanceOf(recipient.address);
    await core.connect(recipient).claim(0);
    const after = await tokenAsRecipient.balanceOf(recipient.address);
    expect(after).to.be.greaterThan(before);
  });
});

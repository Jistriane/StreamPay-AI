// Integração backend com smart contract StreamPayCore via ethers.js
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
let privateKey = process.env.PRIVATE_KEY;
if (!privateKey || privateKey.length !== 66 || !privateKey.startsWith("0x")) {
  // Chave privada de teste (NÃO USAR EM PRODUÇÃO)
  privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";
  console.warn("[StreamPay] PRIVATE_KEY não definida ou inválida. Usando chave de teste. Configure uma chave privada válida em produção.");
}
const wallet = new ethers.Wallet(privateKey, provider);

const StreamPayCoreABI = [
  // ABI mínima para createStream e claimStream
  "function createStream(address recipient, address token, uint256 ratePerSecond, uint256 duration) external",
  "function claimStream(uint256 streamId) external",
  "event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient, address token, uint256 ratePerSecond, uint256 duration)",
  "event StreamClaimed(uint256 indexed streamId, address indexed recipient, uint256 amount)"
];

export function getContract(address: string) {
  return new ethers.Contract(address, StreamPayCoreABI, wallet);
}

export async function createStreamOnChain(contractAddress: string, params: any) {
  const contract = getContract(contractAddress);
  const tx = await contract.createStream(
    params.recipient,
    params.token,
    params.ratePerSecond,
    params.duration
  );
  await tx.wait();
  return tx.hash;
}

export async function claimStreamOnChain(contractAddress: string, streamId: number) {
  const contract = getContract(contractAddress);
  const tx = await contract.claimStream(streamId);
  await tx.wait();
  return tx.hash;
}

// Monitoramento de eventos do contrato StreamPayCore
import { ethers } from "ethers";
import { saveStreamCreated, saveStreamClaimed, migrateEvents } from "./db";
import { sendNotification } from "./notify";
import { getContractAddress, getNetworkConfig } from "./config/contracts";

const networkConfig = getNetworkConfig('sepolia');
const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
const contractAddress = getContractAddress('StreamPayCore', 'sepolia');

const StreamPayCoreABI = [
  "event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient, address token, uint256 ratePerSecond, uint256 duration)",
  "event StreamClaimed(uint256 indexed streamId, address indexed recipient, uint256 amount)"
];


migrateEvents();
const contract = new ethers.Contract(contractAddress, StreamPayCoreABI, provider);

export function listenStreamEvents(onCreated?: Function, onClaimed?: Function) {
  contract.on("StreamCreated", async (streamId: bigint, sender: string, recipient: string, token: string, ratePerSecond: bigint, duration: bigint) => {
    const event = { streamId, sender, recipient, token, ratePerSecond, duration };
    await saveStreamCreated(event);
    // Notificação mock: enviar e-mail ao destinatário
    // O e-mail do destinatário deve ser buscado do banco ou cadastro real
    // Exemplo: const email = await getUserEmail(recipient);
    // await sendNotification(email, ...)
    if (onCreated) onCreated(event);
  });
  contract.on("StreamClaimed", async (streamId: bigint, recipient: string, amount: bigint) => {
    const event = { streamId, recipient, amount };
    await saveStreamClaimed(event);
    // Notificação mock: enviar e-mail ao destinatário
    // O e-mail do destinatário deve ser buscado do banco ou cadastro real
    // Exemplo: const email = await getUserEmail(recipient);
    // await sendNotification(email, ...)
    if (onClaimed) onClaimed(event);
  });
}

// Exemplo de uso:
// listenStreamEvents(
//   (data) => console.log("Novo stream criado:", data),
//   (data) => console.log("Stream claim:", data)
// );

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenStreamEvents = listenStreamEvents;
// Monitoramento de eventos do contrato StreamPayCore
const ethers_1 = require("ethers");
const db_1 = require("./db");
const contracts_1 = require("./config/contracts");
const networkConfig = (0, contracts_1.getNetworkConfig)('polygon');
const provider = new ethers_1.ethers.JsonRpcProvider(networkConfig.rpcUrl);
const contractAddress = (0, contracts_1.getContractAddress)('StreamPayCore', 'polygon');
const StreamPayCoreABI = [
    "event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient, address token, uint256 ratePerSecond, uint256 duration)",
    "event StreamClaimed(uint256 indexed streamId, address indexed recipient, uint256 amount)"
];
(0, db_1.migrateEvents)();
const contract = new ethers_1.ethers.Contract(contractAddress, StreamPayCoreABI, provider);
function listenStreamEvents(onCreated, onClaimed) {
    contract.on("StreamCreated", async (streamId, sender, recipient, token, ratePerSecond, duration) => {
        const event = { streamId, sender, recipient, token, ratePerSecond, duration };
        await (0, db_1.saveStreamCreated)(event);
        // Notificação mock: enviar e-mail ao destinatário
        // O e-mail do destinatário deve ser buscado do banco ou cadastro real
        // Exemplo: const email = await getUserEmail(recipient);
        // await sendNotification(email, ...)
        if (onCreated)
            onCreated(event);
    });
    contract.on("StreamClaimed", async (streamId, recipient, amount) => {
        const event = { streamId, recipient, amount };
        await (0, db_1.saveStreamClaimed)(event);
        // Notificação mock: enviar e-mail ao destinatário
        // O e-mail do destinatário deve ser buscado do banco ou cadastro real
        // Exemplo: const email = await getUserEmail(recipient);
        // await sendNotification(email, ...)
        if (onClaimed)
            onClaimed(event);
    });
}
// Exemplo de uso:
// listenStreamEvents(
//   (data) => console.log("Novo stream criado:", data),
//   (data) => console.log("Stream claim:", data)
// );

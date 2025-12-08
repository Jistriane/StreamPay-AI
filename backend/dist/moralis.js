"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolAddress = getPoolAddress;
exports.getWalletTokenBalances = getWalletTokenBalances;
exports.getWalletTransactions = getWalletTransactions;
// Integração Moralis para dados Web3
const moralis_1 = __importDefault(require("moralis"));
moralis_1.default.start({ apiKey: process.env.MORALIS_API_KEY });
async function getPoolAddress(token0, token1) {
    const response = await moralis_1.default.EvmApi.defi.getPairAddress({
        chain: "0x1",
        token0Address: token0,
        token1Address: token1,
        exchange: "uniswapv3"
    });
    return response.result?.pairAddress || null;
}
async function getWalletTokenBalances(address, tokens) {
    const response = await moralis_1.default.EvmApi.token.getWalletTokenBalances({
        chain: "0x1",
        address,
        tokenAddresses: tokens
    });
    return response.result || [];
}
async function getWalletTransactions(address) {
    const response = await moralis_1.default.EvmApi.transaction.getWalletTransactions({
        chain: "0x1",
        address
    });
    return response.result || [];
}

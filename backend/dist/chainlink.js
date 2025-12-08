"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceFeed = getPriceFeed;
// Integração Chainlink para feeds de preço
const ethers_1 = require("ethers");
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
const FEEDS = {
    "ETH/USD": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    "USDC/USD": "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6"
};
async function getPriceFeed(pair) {
    const feedAddress = FEEDS[pair];
    if (!feedAddress)
        return null;
    const feed = new ethers_1.ethers.Contract(feedAddress, [
        "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)"
    ], provider);
    const [, price, , timestamp] = await feed.latestRoundData();
    return {
        price: price.toString(),
        timestamp: timestamp.toString(),
        pair
    };
}

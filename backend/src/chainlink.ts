// Integração Chainlink para feeds de preço
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

const FEEDS: Record<string, string> = {
  "ETH/USD": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  "USDC/USD": "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6"
};

export async function getPriceFeed(pair: string) {
  const feedAddress = FEEDS[pair];
  if (!feedAddress) return null;
  const feed = new ethers.Contract(feedAddress, [
    "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)"
  ], provider);
  const [, price, , timestamp] = await feed.latestRoundData();
  return {
    price: price.toString(),
    timestamp: timestamp.toString(),
    pair
  };
}

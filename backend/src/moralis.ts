// Integração Moralis para dados Web3
import Moralis from "moralis";

Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

export async function getPoolAddress(token0: string, token1: string) {
  const response = await Moralis.EvmApi.defi.getPairAddress({
    chain: "0x1",
    token0Address: token0,
    token1Address: token1,
    exchange: "uniswapv3"
  });
  return response.result?.pairAddress || null;
}

export async function getWalletTokenBalances(address: string, tokens: string[]) {
  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: "0x1",
    address,
    tokenAddresses: tokens
  });
  return response.result || [];
}

export async function getWalletTransactions(address: string) {
  const response = await Moralis.EvmApi.transaction.getWalletTransactions({
    chain: "0x1",
    address
  });
  return response.result || [];
}

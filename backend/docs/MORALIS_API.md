# Moralis Endpoints in StreamPay AI

## Balance Lookup

- `GET /api/moralis-balance/:address`: Fetches the balance of an address.

## ERC20 Tokens Lookup

- `GET /api/moralis-erc20/:address`: Fetches ERC20 tokens for an address.

## History Lookup

- `GET /api/moralis-txs/:address`: Fetches the transaction history of an address.

## NFT Lookup

- `GET /api/moralis-nfts/:address`: Fetches NFTs for an address.

## Automated Tests

File: `moralis.integration.test.ts`
- Tests balance, ERC20 tokens, and transaction history.

File: `moralis.nft.integration.test.ts`
- Tests NFT queries.

## Recommendations

- Use the endpoints for validation, auditing, and automation flows.
- Expand as the project needs evolve.

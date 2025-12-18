# Etherscan Endpoints in StreamPay AI

## Transaction Lookup
- `GET /api/etherscan-tx/:txHash`: Checks the status of a transaction.

## Balance Lookup
- `GET /api/etherscan-balance/:address`: Fetches the balance of an address.

## History Lookup

- `GET /api/etherscan-txs/:address`: Fetches the transaction history of an address.

## ERC20 Token Transfers

- `GET /api/etherscan-erc20/:address`: Fetches ERC20 token transfers for an address.

## Contract Logs Lookup

- `GET /api/etherscan-logs/:contractAddress`: Fetches events/logs of a contract.

## Automated Tests
File: `etherscan.integration.test.ts`
- Tests transaction lookup.

## Monitoring Automation

- Script `eliza.monitor.js` monitors ElizaOS status and contract logs, sending email alerts for errors or specific events.

## Recommendations

- Use the endpoints for validation, auditing, automation flows, and advanced monitoring.
- Expand as the project needs evolve.

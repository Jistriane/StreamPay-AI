# Endpoints Moralis no StreamPay AI

## Consulta de saldo

- `GET /api/moralis-balance/:address`: Consulta saldo de um endereço.

## Consulta de tokens ERC20

- `GET /api/moralis-erc20/:address`: Consulta tokens ERC20 de um endereço.

## Consulta de histórico

- `GET /api/moralis-txs/:address`: Consulta histórico de transações de um endereço.

## Consulta de NFTs

- `GET /api/moralis-nfts/:address`: Consulta NFTs de um endereço.

## Testes automatizados

Arquivo: `moralis.integration.test.ts`
- Testa saldo, tokens ERC20 e histórico de transações.

Arquivo: `moralis.nft.integration.test.ts`
- Testa consulta de NFTs.

## Recomendações

- Use endpoints para validação, auditoria e automação de fluxos.
- Expanda conforme necessidade do projeto.

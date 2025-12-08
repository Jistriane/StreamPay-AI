# Endpoints Etherscan no StreamPay AI

## Consulta de transação
- `GET /api/etherscan-tx/:txHash`: Consulta status de uma transação.

## Consulta de saldo
- `GET /api/etherscan-balance/:address`: Consulta saldo de um endereço.

## Consulta de histórico

- `GET /api/etherscan-txs/:address`: Consulta histórico de transações de um endereço.

## Consulta de tokens ERC20

- `GET /api/etherscan-erc20/:address`: Consulta transferências de tokens ERC20 de um endereço.

## Consulta de logs de contrato

- `GET /api/etherscan-logs/:contractAddress`: Consulta eventos/logs de um contrato.

## Testes automatizados
Arquivo: `etherscan.integration.test.ts`
- Testa consulta de transação.

## Automação de monitoramento

- Script `eliza.monitor.js` monitora status do ElizaOS e logs de contrato, enviando alertas por e-mail em caso de erro ou evento específico.

## Recomendações

- Use endpoints para validação, auditoria, automação de fluxos e monitoramento avançado.
- Expanda conforme necessidade do projeto.

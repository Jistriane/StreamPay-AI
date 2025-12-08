# Integração StreamPay AI x ElizaOS

## Endpoints implementados

### Monitoramento

- `GET /api/eliza-status`: Consulta status do agente ElizaOS (health check).

### Interação

- `POST /api/eliza-message`: Envia mensagem para o agente ElizaOS e retorna resposta.

## Testes automatizados

Arquivo: `eliza.integration.test.ts`
- Testa status do agente e envio de mensagem.

## Monitoramento automático

Arquivo: `eliza.monitor.js`
- Verifica status do ElizaOS a cada minuto.
- Envia alerta por e-mail se o agente estiver fora do ar.

## Recomendações

- Configure variáveis de ambiente para autenticação e segurança.
- Expanda integração conforme necessidade dos fluxos do StreamPay AI.
- Consulte logs e dashboard do ElizaOS para monitoramento avançado.

---

Para dúvidas ou evolução, consulte a documentação oficial do ElizaOS ou solicite automações adicionais.

import request from 'supertest';
import app from '../src/server';

describe('Integração Avançada Etherscan', () => {
  it('deve consultar histórico de transações de um endereço', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const res = await request(app).get(`/api/etherscan-address/${address}/txs?limit=10`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('transactions');
  });

  it('deve rejeitar endereço inválido', async () => {
    const invalidAddress = 'not-an-address';
    const res = await request(app).get(`/api/etherscan-address/${invalidAddress}/txs`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

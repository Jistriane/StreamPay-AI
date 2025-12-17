import request from 'supertest';
import app from '../src/server';

describe('Integração Etherscan', () => {
  it('deve consultar status de transação', async () => {
    const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'; 
    const res = await request(app).get(`/api/etherscan-tx/${txHash}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('txHash');
  });

  it('deve rejeitar formato inválido de hash', async () => {
    const txHash = 'invalid-hash';
    const res = await request(app).get(`/api/etherscan-tx/${txHash}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/etherscan-gas - obter taxa de gas', async () => {
    const res = await request(app).get('/api/etherscan-gas');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('gasPrice');
  });

  it('GET /api/etherscan-address/:address/txs - histórico de transações', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const res = await request(app).get(`/api/etherscan-address/${address}/txs?limit=5`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('transactions');
  });
});

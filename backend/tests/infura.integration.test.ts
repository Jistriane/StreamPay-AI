import request from 'supertest';
import app from '../src/server';

describe('Infura Endpoints', () => {
  it('GET /api/infura-gas - obter estimativa de gas', async () => {
    const res = await request(app).get('/api/infura-gas');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('gasEstimate');
  });

  it('GET /api/infura-block - obter bloco atual', async () => {
    const res = await request(app).get('/api/infura-block');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('blockNumber');
  });

  it('GET /api/infura-tx-count/:address - contagem de transações', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const res = await request(app).get(`/api/infura-tx-count/${address}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('transactionCount');
  });

  it('GET /api/infura-tx-count - rejeita endereço inválido', async () => {
    const res = await request(app).get(`/api/infura-tx-count/invalid`);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

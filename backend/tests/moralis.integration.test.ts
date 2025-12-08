import request from 'supertest';
import app from './index';

describe('Integração Moralis', () => {
  it('deve consultar saldo de um endereço', async () => {
    const address = '0x123...'; // Substitua por um endereço real
    const res = await request(app).get(`/api/moralis-balance/${address}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
  });

  it('deve consultar tokens ERC20 de um endereço', async () => {
    const address = '0x123...'; // Substitua por um endereço real
    const res = await request(app).get(`/api/moralis-erc20/${address}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
  });

  it('deve consultar histórico de transações de um endereço', async () => {
    const address = '0x123...'; // Substitua por um endereço real
    const res = await request(app).get(`/api/moralis-txs/${address}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
  });

    it('GET /api/moralis-balance - sem autenticação', async () => {
      const res = await request(app).get('/api/moralis-balance');
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/moralis-balance - erro integração', async () => {
      // Simula erro de integração (exemplo: token inválido)
      const res = await request(app).get('/api/moralis-balance').set('Authorization', 'Bearer invalid_token');
      expect([400, 500]).toContain(res.statusCode);
    });
});

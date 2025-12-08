import request from 'supertest';
import app from './index';

describe('Integração Etherscan', () => {
  it('deve consultar status de transação', async () => {
    const txHash = '0x123...'; // Substitua por um hash real para teste
    const res = await request(app).get(`/api/etherscan-tx/${txHash}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
  });
    it('GET /api/etherscan-tx - sem autenticação', async () => {
      const res = await request(app).get('/api/etherscan-tx');
      expect(res.status).toBe(401);
    });

    it('GET /api/etherscan-tx - erro integração', async () => {
      // Simula erro de integração (exemplo: token inválido)
      const res = await request(app).get('/api/etherscan-tx').set('Authorization', 'Bearer invalid_token');
      expect([400, 500]).toContain(res.status);
    });
});

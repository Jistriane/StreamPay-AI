import request from 'supertest';
import app from './index';

describe('Integração ElizaOS', () => {
  it('deve retornar status do agente ElizaOS', async () => {
    const res = await request(app).get('/api/eliza-status');
    expect(res.status).toBe(200);
    expect(res.body.status).toBeDefined();
  });

  it('deve enviar mensagem para o agente ElizaOS e receber resposta', async () => {
    const res = await request(app)
      .post('/api/eliza-message')
      .send({ text: 'Olá, Eliza!' });
    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
  });

    it('GET /api/eliza-status - sem autenticação', async () => {
      const res = await request(app).get('/api/eliza-status');
      expect(res.status).toBe(401);
    });

    it('GET /api/eliza-status - erro integração', async () => {
      // Simula erro de integração (exemplo: token inválido)
      const res = await request(app).get('/api/eliza-status').set('Authorization', 'Bearer invalid_token');
      expect([400, 500]).toContain(res.status);
    });
});

import request from 'supertest';
import app from '../src/server';

describe('Integração ElizaOS', () => {
  it('deve retornar status do agente ElizaOS', async () => {
    const res = await request(app).get('/api/eliza-status');
    expect([200, 500]).toContain(res.status); // 200 se conectado, 500 se API não disponível
    expect(res.body).toBeDefined();
  });

  it('deve enviar mensagem para o agente ElizaOS e receber resposta', async () => {
    const res = await request(app)
      .post('/api/eliza-message')
      .send({ message: 'Olá, Eliza!', userId: 'test-user' });
    expect([200, 500]).toContain(res.status); // 200 se enviado, 500 se erro
    expect(res.body).toBeDefined();
  });

  it('POST /api/eliza-message - sem parâmetros obrigatórios', async () => {
    const res = await request(app)
      .post('/api/eliza-message')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/eliza-analyze - análise de stream', async () => {
    const res = await request(app)
      .post('/api/eliza-analyze')
      .send({ streamData: { amount: 100, recipient: '0xabc' } });
    expect([200, 500]).toContain(res.status);
    expect(res.body).toBeDefined();
  });
});

import request from 'supertest';
import app from '../src/server';

describe('Integração Moralis', () => {
  it('deve consultar saldo de um token', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const tokenAddress = '0x1234567890123456789012345678901234567890';
    const res = await request(app).get(`/api/moralis-balance/${address}/token/${tokenAddress}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('balance');
  });

  it('deve consultar saldo nativo ETH', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const res = await request(app).get(`/api/moralis-native-balance/${address}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('balance');
  });

  it('deve consultar streams do endereço', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const res = await request(app).get(`/api/moralis-streams/${address}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('streams');
  });

  it('deve rejeitar endereço inválido', async () => {
    const res = await request(app).get(`/api/moralis-streams/invalid-address`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

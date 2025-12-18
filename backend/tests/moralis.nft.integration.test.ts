import request from 'supertest';
import app from '../src/server';

describe('Integração Moralis NFT', () => {
  it('deve consultar NFTs de um endereço', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const res = await request(app).get(`/api/moralis-nft/${address}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nfts');
    expect(Array.isArray(res.body.nfts)).toBe(true);
  });

  it('deve retornar array vazio para endereço sem NFTs', async () => {
    const address = '0x0000000000000000000000000000000000000000';
    const res = await request(app).get(`/api/moralis-nft/${address}`);
    expect(res.status).toBe(200);
    expect(res.body.nfts).toEqual([]);
  });

  it('deve rejeitar endereço inválido', async () => {
    const res = await request(app).get(`/api/moralis-nft/invalid`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

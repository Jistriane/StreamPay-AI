import request from 'supertest';
import app from './index';

describe('Integração Moralis NFT', () => {
  it('deve consultar NFTs de um endereço', async () => {
    const address = '0x123...'; // Substitua por um endereço real
    const res = await request(app).get(`/api/moralis-nfts/${address}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
  });
});

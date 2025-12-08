import request from 'supertest';
import app from './index';

describe('Integração avançada Etherscan', () => {
  it('deve consultar tokens ERC20 de um endereço', async () => {
    const address = '0x123...'; // Substitua por um endereço real
    const res = await request(app).get(`/api/etherscan-erc20/${address}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
  });

  it('deve consultar logs de um contrato', async () => {
    const contractAddress = '0xabc...'; // Substitua por um contrato real
    const res = await request(app).get(`/api/etherscan-logs/${contractAddress}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
  });
});

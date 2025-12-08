import request from 'supertest';
import app from './index';

describe('Infura Endpoints', () => {
  it('GET /api/infura-gas', async () => {
    const res = await request(app).get('/api/infura-gas').set('Authorization', 'Bearer test_token');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('gasPrice');
  });
});

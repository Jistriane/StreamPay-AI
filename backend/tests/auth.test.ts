import request from 'supertest';
import express from 'express';
import authRouter from '../src/routes/auth';
import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Routes', () => {
  describe('POST /api/auth/verify', () => {
    it('retorna erro para assinatura inválida', async () => {
      const res = await request(app)
        .post('/api/auth/verify')
        .send({
          address: '0x1234567890123456789012345678901234567890',
          message: 'Test message',
          signature: '0xdeadbeef',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('retorna erro para dados incompletos', async () => {
      const res = await request(app)
        .post('/api/auth/verify')
        .send({
          address: '0x1234567890123456789012345678901234567890',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('obrigatório');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('retorna erro quando refreshToken não é fornecido', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('refreshToken');
    });

    it('retorna erro para refreshToken inválido', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid.token.here',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('inválido');
    });

    it('retorna novo token com refreshToken válido', async () => {
      // Criar um refreshToken válido de teste
      const testAddress = '0x1234567890123456789012345678901234567890';
      const refreshToken = jwt.sign(
        {
          id: testAddress,
          address: testAddress,
          type: 'refresh',
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-key',
        { expiresIn: '7d' }
      );

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.expiresIn).toBe(3600);
    });
  });

  describe('GET /api/auth/me', () => {
    it('retorna erro quando token não é fornecido', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Token');
    });

    it('retorna dados do usuário com token válido', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const token = jwt.sign(
        {
          id: testAddress,
          address: testAddress,
          email: `${testAddress}@streampay.local`,
          role: 'user',
        },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.address).toBe(testAddress);
      expect(res.body.role).toBe('user');
    });
  });
});

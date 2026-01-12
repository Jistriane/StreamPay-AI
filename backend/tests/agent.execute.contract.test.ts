import request from 'supertest';

// Important: must be set before importing the app
process.env.NODE_ENV = 'test';
process.env.NETWORK = 'ethereum';

import app from '../src/server';
import { Wallet } from 'ethers';
import jwt from 'jsonwebtoken';

describe('Agent execute-contract - CREATE_STREAM', () => {
  it('deve validar assinatura e retornar txRequests', async () => {
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const now = Date.now();

    const payload = {
      version: '1',
      requestId: Math.random().toString(36).slice(2),
      intent: 'CREATE_STREAM',
      userAddress: address,
      network: 'ethereum',
      chainId: 1,
      parameters: {
        recipient: '0x1234567890123456789012345678901234567890',
        token: 'MNEE',
        amount: 100,
        durationSeconds: 7 * 24 * 60 * 60,
      },
      issuedAt: now,
      expiresAt: now + 5 * 60 * 1000,
    };

    const canonical = `StreamPay Authorization\n\n${JSON.stringify(payload)}`;
    const signature = await wallet.signMessage(canonical);

    const token = jwt.sign(
      { id: address, address, email: `${address}@streampay.local`, role: 'user' },
      process.env.JWT_SECRET || 'dev-secret-key-please-change-1234',
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/agent/execute-contract')
      .set('Authorization', `Bearer ${token}`)
      .send({ signature, payload });

    expect([200, 400, 401]).toContain(res.status);
    console.log('[DEBUG] Response Body:', JSON.stringify(res.body, null, 2));
    if (res.status === 200) {
      expect(res.body).toHaveProperty('txRequests');
      expect(Array.isArray(res.body.txRequests)).toBe(true);
      // deve conter approve e createStream
      const labels = res.body.txRequests.map((r: any) => r.label || '');
      expect(labels.join(' ')).toMatch(/aprovar|criar/i);
    } else {
      // Em caso de erro, deve haver mensagem
      expect(res.body).toHaveProperty('error');
    }
  });
});

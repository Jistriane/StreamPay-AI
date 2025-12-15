import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';

// Mock database
const mockStreams: any[] = [];

// Mock middleware
const authenticateJWT = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create Express app with streams routes
const app: Express = express();
app.use(express.json());

// GET /api/streams - List streams for authenticated user
app.get('/api/streams', authenticateJWT, (req: any, res: Response) => {
  const userStreams = mockStreams.filter((s) => s.sender === req.user.address || s.recipient === req.user.address);
  res.json({
    success: true,
    data: userStreams,
    pagination: {
      total: userStreams.length,
      skip: 0,
      limit: 20,
    },
  });
});

// GET /api/streams/:id - Get specific stream
app.get('/api/streams/:id', authenticateJWT, (req: any, res: Response) => {
  const stream = mockStreams.find((s) => s.id === parseInt(req.params.id));
  
  if (!stream) {
    return res.status(404).json({ success: false, error: 'Stream not found' });
  }

  if (stream.sender !== req.user.address && stream.recipient !== req.user.address) {
    return res.status(403).json({ success: false, error: 'Not authorized' });
  }

  res.json({ success: true, data: stream });
});

// POST /api/streams - Create new stream
app.post('/api/streams', authenticateJWT, (req: any, res: Response) => {
  const { recipient, token, deposit, rate_per_second, duration } = req.body;

  if (!recipient || !token || !deposit) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const newStream = {
    id: mockStreams.length + 1,
    sender: req.user.address,
    recipient,
    token,
    deposit,
    rate_per_second: rate_per_second || '1000000000000000',
    duration: duration || 3600,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  mockStreams.push(newStream);
  res.status(201).json({ success: true, data: newStream });
});

// Describe test suite
describe('Streams API Integration Tests', () => {
  let token: string;
  const testAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    // Clear mock streams before each test
    mockStreams.length = 0;

    // Generate test JWT token
    token = jwt.sign(
      { address: testAddress, email: 'test@example.com', role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/streams', () => {
    it('retorna lista vazia quando nenhum stream existe', async () => {
      const response = await request(app)
        .get('/api/streams')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('retorna lista de streams do usuário', async () => {
      // Add test streams
      mockStreams.push({
        id: 1,
        sender: testAddress,
        recipient: '0xabcdef0123456789012345678901234567890abc',
        token: 'USDC',
        deposit: '1000',
        rate_per_second: '1000000000000000',
        status: 'active',
        created_at: new Date().toISOString(),
      });

      const response = await request(app)
        .get('/api/streams')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].sender).toBe(testAddress);
    });

    it('retorna erro quando token não fornecido', async () => {
      const response = await request(app).get('/api/streams');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/streams/:id', () => {
    beforeEach(() => {
      mockStreams.push({
        id: 1,
        sender: testAddress,
        recipient: '0xabcdef0123456789012345678901234567890abc',
        token: 'USDC',
        deposit: '1000',
        status: 'active',
        created_at: new Date().toISOString(),
      });
    });

    it('retorna detalhes do stream', async () => {
      const response = await request(app)
        .get('/api/streams/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.token).toBe('USDC');
    });

    it('retorna erro para stream inexistente', async () => {
      const response = await request(app)
        .get('/api/streams/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('retorna erro quando usuário não é sender ou recipient', async () => {
      const otherToken = jwt.sign(
        { address: '0xotheraddress123456789012345678901234567', email: 'other@example.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/streams/1')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/streams', () => {
    it('cria novo stream com sucesso', async () => {
      const response = await request(app)
        .post('/api/streams')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipient: '0xabcdef0123456789012345678901234567890abc',
          token: 'USDC',
          deposit: '1000',
          rate_per_second: '1000000000000000',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sender).toBe(testAddress);
      expect(response.body.data.status).toBe('active');
    });

    it('retorna erro para dados incompletos', async () => {
      const response = await request(app)
        .post('/api/streams')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipient: '0xabcdef0123456789012345678901234567890abc',
          // Missing token and deposit
        });

      expect(response.status).toBe(400);
    });

    it('rejeita requisição sem token', async () => {
      const response = await request(app)
        .post('/api/streams')
        .send({
          recipient: '0xabcdef0123456789012345678901234567890abc',
          token: 'USDC',
          deposit: '1000',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('End-to-End Workflow', () => {
    it('completa fluxo completo: criar -> listar -> detalhar', async () => {
      // 1. Create stream
      const createResponse = await request(app)
        .post('/api/streams')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipient: '0xabcdef0123456789012345678901234567890abc',
          token: 'USDC',
          deposit: '1000',
        });

      expect(createResponse.status).toBe(201);
      const streamId = createResponse.body.data.id;

      // 2. List streams
      const listResponse = await request(app)
        .get('/api/streams')
        .set('Authorization', `Bearer ${token}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data).toHaveLength(1);

      // 3. Get stream details
      const detailResponse = await request(app)
        .get(`/api/streams/${streamId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(detailResponse.status).toBe(200);
      expect(detailResponse.body.data.token).toBe('USDC');
      expect(detailResponse.body.data.deposit).toBe('1000');
    });
  });
});

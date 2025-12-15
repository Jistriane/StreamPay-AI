import express, { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';

const router: Router = express.Router();

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas de autenticação, tente novamente em breve',
  },
});

/**
 * POST /api/auth/verify
 * Verifica assinatura Web3 e gera JWT
 */
router.post('/verify', verifyLimiter, async (req: Request, res: Response) => {
  try {
    const { address, message, signature } = req.body;

    // Validar entrada
    if (!address || !message || !signature) {
      return res.status(400).json({
        error: 'Endereço, mensagem e assinatura são obrigatórios',
      });
    }

    // Recuperar endereço da assinatura
    const recoveredAddress = verifyMessage(message, signature);

    // Validar que o endereço corresponde
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({
        error: 'Assinatura inválida',
      });
    }

    // Gerar JWT
    const token = jwt.sign(
      {
        id: address,
        address,
        email: `${address}@streampay.local`,
        role: 'user',
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      {
        id: address,
        address,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-key',
      { expiresIn: '7d' }
    );


    res.json({
      token,
      refreshToken,
      address,
      message: 'Autenticação bem-sucedida',
      expiresIn: 3600
    });
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    res.status(401).json({
      error: 'Erro ao verificar assinatura',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', (req: any, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token não fornecido',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-secret-key'
    ) as any;

    res.json({
      id: decoded.id,
      address: decoded.address,
      email: decoded.email,
      role: decoded.role,
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(401).json({
      error: 'Token inválido ou expirado',
    });
  }
});

export default router;


/**
 * POST /api/auth/refresh
 * Recebe um refreshToken e retorna um novo JWT de acesso
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken é obrigatório' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-key'
    ) as any;

    if (!decoded || decoded.type !== 'refresh' || !decoded.address) {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }

    const newToken = jwt.sign(
      {
        id: decoded.address,
        address: decoded.address,
        email: `${decoded.address}@streampay.local`,
        role: 'user',
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '1h' }
    );

    res.json({ token: newToken, expiresIn: 3600 });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(401).json({ error: 'Refresh token inválido ou expirado' });
  }
});

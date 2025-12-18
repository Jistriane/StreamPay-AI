import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/[<>"/;]/g, '')
          .replace(/OR\s+1=1/gi, '')
          .replace(/DROP\s+TABLE/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
}

const SQL_INJECTION_PATTERNS = [
  /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bEXEC\b)/i,
];

export class SecurityMiddleware {
  helmet() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://ethereum-sepolia-rpc.publicnode.com'],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    });
  }

  globalRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Muitas requisições deste IP, tente novamente mais tarde.',
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.path === '/health' || req.path === '/metrics',
    });
  }

  authRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Muitas tentativas de autenticação, tente novamente mais tarde.',
      skipSuccessfulRequests: true,
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  externalAPIRateLimit() {
    return rateLimit({
      windowMs: 60 * 1000,
      max: 30,
      message: 'Rate limit excedido para API externa.',
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  validateCors(options: { allowedOrigins: string[]; credentials: boolean }) {
    return (req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers.origin as string;

      if (origin && options.allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }

      next();
    };
  }

  sanitizeInput() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.body && typeof req.body === 'object') {
        sanitizeObject(req.body);
      }

      if (req.query && typeof req.query === 'object') {
        sanitizeObject(req.query);
      }

      next();
    };
  }

  preventSQLInjection() {
    return (req: Request, res: Response, next: NextFunction) => {
      const body = JSON.stringify(req.body || '');
      const query = JSON.stringify(req.query || '');
      const combined = body + query;

      for (const pattern of SQL_INJECTION_PATTERNS) {
        if (pattern.test(combined)) {
          this.logSecurityEvent(req, 'sql_injection_attempt', 'Potential SQL injection detected');
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid input detected',
          });
        }
      }

      next();
    };
  }

  logSecurityEvent(req: Request, eventType: string, details: string) {
    logger.warn('[SECURITY EVENT]', {
      eventType,
      details,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
    });
  }
}

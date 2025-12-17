import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    database: 'connected' | 'disconnected';
    blockchain: 'configured' | 'not-configured';
    cache?: 'available' | 'unavailable';
  };
  metrics?: {
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
  };
}

export class ObservabilityMiddleware {
  private startTime: number = Date.now();
  private requestCount: number = 0;
  private errorCount: number = 0;
  private responseTimes: number[] = [];

  requestLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
      (req as any).requestId = requestId;

      logger.info('[HTTP Request]', {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      const originalSend = res.send;
      res.send = function (data: any) {
        const duration = Date.now() - startTime;
        logger.info('[HTTP Response]', {
          requestId,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration,
        });
        return originalSend.call(this, data);
      };

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.requestCount++;
        this.responseTimes.push(duration);
        if (this.responseTimes.length > 100) {
          this.responseTimes.shift();
        }
        if (res.statusCode >= 400) {
          this.errorCount++;
        }
      });

      next();
    };
  }

  errorLogger() {
    return (err: Error, req: Request, res: Response, next: NextFunction) => {
      const requestId = (req as any).requestId || 'unknown';
      logger.error('[HTTP Error]', {
        requestId,
        method: req.method,
        path: req.path,
        error: err.message,
        stack: err.stack,
      });
      this.errorCount++;
      next(err);
    };
  }

  healthCheck() {
    return async (req: Request, res: Response) => {
      try {
        const uptime = Date.now() - this.startTime;
        const averageResponseTime =
          this.responseTimes.length > 0
            ? this.responseTimes.reduce((a, b) => a + b) / this.responseTimes.length
            : 0;

        const healthStatus: HealthStatus = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime,
          environment: process.env.NODE_ENV || 'development',
          services: {
            database: process.env.DATABASE_URL ? 'connected' : 'disconnected',
            blockchain: process.env.RPC_URL ? 'configured' : 'not-configured',
            cache: 'unavailable',
          },
          metrics: {
            requestCount: this.requestCount,
            errorCount: this.errorCount,
            averageResponseTime: Math.round(averageResponseTime),
          },
        };

        if (this.errorCount > this.requestCount * 0.1) {
          healthStatus.status = 'degraded';
        }

        res.status(healthStatus.status === 'ok' ? 200 : 503).json(healthStatus);
      } catch (error) {
        logger.error('[Health Check]', error);
        res.status(500).json({
          status: 'error',
          message: 'Failed to generate health status',
        });
      }
    };
  }

  metricsEndpoint() {
    return (req: Request, res: Response) => {
      const averageResponseTime =
        this.responseTimes.length > 0
          ? this.responseTimes.reduce((a, b) => a + b) / this.responseTimes.length
          : 0;

      const metricsText = `# HELP streampay_requests_total Total HTTP requests
# TYPE streampay_requests_total counter
streampay_requests_total ${this.requestCount}

# HELP streampay_errors_total Total HTTP errors
# TYPE streampay_errors_total counter
streampay_errors_total ${this.errorCount}

# HELP streampay_request_duration_ms Response time in milliseconds
# TYPE streampay_request_duration_ms gauge
streampay_request_duration_ms ${Math.round(averageResponseTime)}
`;

      res.type('text/plain').send(metricsText);
    };
  }

  appInfoEndpoint() {
    return (req: Request, res: Response) => {
      const uptime = Date.now() - this.startTime;
      res.json({
        name: 'StreamPay AI Backend',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime,
        requestCount: this.requestCount,
        errorCount: this.errorCount,
        timestamp: new Date().toISOString(),
      });
    };
  }
}

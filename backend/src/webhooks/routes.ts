import { Router, Request, Response } from 'express';
import { webhookManager } from './manager';
import { WebhookSecurity } from './security';
import { WebhookEventType } from './types';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/auth';

export const webhookRouter = Router();

/**
 * POST /webhooks/receive
 * Recebe webhooks de fontes externas (blockchain events, etc)
 */
webhookRouter.post('/webhooks/receive', async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ error: 'Webhooks não configurados' });
    }

    const { signature, event, timestamp, data, nonce } = req.body;

    // Validar payload
    const validation = WebhookSecurity.validatePayload(
      { event, timestamp, data, signature, nonce },
      webhookSecret
    );

    if (!validation.valid) {
      logger.warn(`Webhook rejeitado: ${validation.error}`);
      return res.status(401).json({ error: validation.error });
    }

    // Log webhook recebido
    logger.info(`Webhook recebido: ${event}`, { data });

    // Processar evento (implementar handlers específicos)
    await handleWebhookEvent(event, data);

    res.json({ success: true, message: 'Webhook recebido e processado' });
  } catch (error) {
    logger.error('Erro ao processar webhook recebido', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

/**
 * GET /webhooks/logs
 * Lista logs de webhooks enviados
 */
webhookRouter.get(
  '/webhooks/logs',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { event, status, limit = '100' } = req.query;

      const logs = await webhookManager.getLogs(
        event as WebhookEventType | undefined,
        status as 'success' | 'failed' | 'pending' | undefined,
        parseInt(limit as string)
      );

      res.json({ logs });
    } catch (error) {
      logger.error('Erro ao recuperar logs de webhooks', error);
      res.status(500).json({ error: 'Erro ao recuperar logs' });
    }
  }
);

/**
 * POST /webhooks/retry
 * Retenta webhooks falhados
 */
webhookRouter.post(
  '/webhooks/retry',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { maxAge = 24 * 60 * 60 * 1000 } = req.body; // 24h padrão

      await webhookManager.retryFailedWebhooks(maxAge);

      res.json({ success: true, message: 'Webhooks falhados retentados' });
    } catch (error) {
      logger.error('Erro ao retenta webhooks', error);
      res.status(500).json({ error: 'Erro ao retenta webhooks' });
    }
  }
);

/**
 * POST /webhooks/cleanup
 * Limpa logs antigos
 */
webhookRouter.post(
  '/webhooks/cleanup',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { ageMs = 30 * 24 * 60 * 60 * 1000 } = req.body; // 30 dias padrão

      const count = await webhookManager.cleanupOldLogs(ageMs);

      res.json({
        success: true,
        message: `${count} logs antigos deletados`
      });
    } catch (error) {
      logger.error('Erro ao limpar logs', error);
      res.status(500).json({ error: 'Erro ao limpar logs' });
    }
  }
);

/**
 * Handler de eventos de webhook
 */
async function handleWebhookEvent(
  event: WebhookEventType,
  data: Record<string, unknown>
): Promise<void> {
  switch (event) {
    case WebhookEventType.STREAM_CREATED:
      // Implementar lógica específica
      logger.info('Stream criado via webhook', data);
      break;

    case WebhookEventType.STREAM_CLAIMED:
      logger.info('Stream reclamado via webhook', data);
      break;

    case WebhookEventType.LIQUIDITY_ADDED:
      logger.info('Liquidez adicionada via webhook', data);
      break;

    case WebhookEventType.TRANSACTION_FAILED:
      logger.error('Transação falhou via webhook', data);
      // Alertar usuário ou triggar recovery
      break;

    default:
      logger.warn(`Evento desconhecido: ${event}`);
  }
}

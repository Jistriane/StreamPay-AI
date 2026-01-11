import axios, { AxiosError } from 'axios';
import { WebhookPayload, WebhookEventType, WebhookLog } from './types';
import { WebhookSecurity } from './security';
import { prisma } from '../db';
import { logger } from '../utils/logger';

/**
 * Gerenciador de webhooks para envio de eventos
 */
export class WebhookManager {
  private static instance: WebhookManager;
  private retryQueue: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  /**
   * Singleton pattern
   */
  static getInstance(): WebhookManager {
    if (!WebhookManager.instance) {
      WebhookManager.instance = new WebhookManager();
    }
    return WebhookManager.instance;
  }

  /**
   * Dispara um evento de webhook
   */
  async fireEvent(
    event: WebhookEventType,
    data: Record<string, unknown>
  ): Promise<string> {
    const webhookUrl = process.env.WEBHOOK_URL;
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookUrl || !webhookSecret) {
      logger.warn('Webhooks não configurados (WEBHOOK_URL ou WEBHOOK_SECRET ausentes)');
      return '';
    }

    try {
      // Criar payload assinado
      const payload = WebhookSecurity.createSignedPayload(
        event,
        data,
        webhookSecret
      );

      // Enviar webhook
      await this.sendWebhook(webhookUrl, payload);

      // Log sucesso
      const log = await this.createWebhookLog(event, payload, 'success');
      logger.info(`Webhook enviado com sucesso: ${event}`, { logId: log.id });

      return log.id;
    } catch (error) {
      logger.error(`Erro ao enviar webhook: ${event}`, error);
      throw error;
    }
  }

  /**
   * Envia o webhook com retry automático
   */
  private async sendWebhook(
    url: string,
    payload: WebhookPayload,
    retryCount: number = 0
  ): Promise<void> {
    const maxRetries = 3;
    const retryDelay = 5000; // 5 segundos

    try {
      const response = await axios.post(url, payload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': payload.signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-Timestamp': payload.timestamp.toString(),
          'X-Webhook-Nonce': payload.nonce
        }
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Status inválido: ${response.status}`);
      }

      logger.info(`Webhook entregue com sucesso: ${payload.event}`, {
        status: response.status
      });
    } catch (error) {
      if (retryCount < maxRetries) {
        logger.warn(
          `Webhook falhou, retry ${retryCount + 1}/${maxRetries}: ${payload.event}`,
          error
        );

        // Agendar retry
        return new Promise((resolve) => {
          setTimeout(() => {
            this.sendWebhook(url, payload, retryCount + 1)
              .then(resolve)
              .catch(() => resolve()); // Silenciosamente falhar após retries
          }, retryDelay);
        });
      }

      const axiosError = error as AxiosError;
      throw new Error(
        `Webhook falhou após ${maxRetries} tentativas: ${axiosError.message}`
      );
    }
  }

  /**
   * Cria um log de webhook
   */
  private async createWebhookLog(
    eventType: WebhookEventType,
    payload: WebhookPayload,
    status: 'success' | 'failed' | 'pending'
  ): Promise<WebhookLog> {
    try {
      const log = await prisma.webhookLog.create({
        data: {
          eventType,
          payload: JSON.stringify(payload) as any,
          status,
          retryCount: 0,
          lastRetry: null,
          error: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return { ...log, payload: JSON.parse(String(log.payload)) as WebhookPayload } as WebhookLog;
    } catch (error) {
      logger.error('Erro ao criar webhook log', error);
      throw error;
    }
  }

  /**
   * Recupera logs de webhooks
   */
  async getLogs(
    eventType?: WebhookEventType,
    status?: 'success' | 'failed' | 'pending',
    limit: number = 100
  ) {
    try {
      const logs = await prisma.webhookLog.findMany({
        where: {
          ...(eventType && { eventType }),
          ...(status && { status })
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return logs;
    } catch (error) {
      logger.error('Erro ao recuperar webhook logs', error);
      throw error;
    }
  }

  /**
   * Retenta webhooks falhados
   */
  async retryFailedWebhooks(maxAge: number = 24 * 60 * 60 * 1000) {
    try {
      const cutoffTime = new Date(Date.now() - maxAge);

      const failedLogs = await prisma.webhookLog.findMany({
        where: {
          status: 'failed',
          createdAt: {
            gte: cutoffTime
          }
        },
        take: 50 // Processar máximo 50 de uma vez
      });

      logger.info(`Retentando ${failedLogs.length} webhooks falhados`);

      for (const log of failedLogs) {
        try {
          const webhookUrl = process.env.WEBHOOK_URL;
          if (webhookUrl) {
            await this.sendWebhook(
              webhookUrl,
              JSON.parse(String(log.payload)) as WebhookPayload
            );
            await prisma.webhookLog.update({
              where: { id: log.id },
              data: {
                status: 'success',
                retryCount: log.retryCount + 1,
                lastRetry: new Date()
              }
            });
          }
        } catch (error) {
          logger.error(`Erro ao retenta webhook ${log.id}`, error);
        }
      }
    } catch (error) {
      logger.error('Erro ao retenta webhooks falhados', error);
    }
  }

  /**
   * Limpa logs antigos (mais de 30 dias)
   */
  async cleanupOldLogs(ageMs: number = 30 * 24 * 60 * 60 * 1000) {
    try {
      const cutoffTime = new Date(Date.now() - ageMs);

      const deleted = await prisma.webhookLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffTime
          },
          status: 'success' // Apenas deletar logs bem-sucedidos
        }
      });

      logger.info(`Limpeza: ${deleted.count} webhook logs antigos deletados`);
      return deleted.count;
    } catch (error) {
      logger.error('Erro ao limpar logs antigos', error);
      throw error;
    }
  }
}

// Singleton
export const webhookManager = WebhookManager.getInstance();

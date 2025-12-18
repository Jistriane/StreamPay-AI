import { webhookManager } from './manager';
import { WebhookEventType, StreamCreatedEvent, StreamClaimedEvent, LiquidityAddedEvent } from './types';

/**
 * Integradores de eventos de negócio com o sistema de webhooks
 */

/**
 * Dispara webhook quando um stream é criado
 */
export async function fireStreamCreatedWebhook(
  event: StreamCreatedEvent
): Promise<void> {
  try {
    await webhookManager.fireEvent(
      WebhookEventType.STREAM_CREATED,
      event
    );
  } catch (error) {
    console.error('Erro ao disparar webhook de stream criado', error);
    // Não falhar a operação principal
  }
}

/**
 * Dispara webhook quando um stream é reclamado
 */
export async function fireStreamClaimedWebhook(
  event: StreamClaimedEvent
): Promise<void> {
  try {
    await webhookManager.fireEvent(
      WebhookEventType.STREAM_CLAIMED,
      event
    );
  } catch (error) {
    console.error('Erro ao disparar webhook de stream reclamado', error);
  }
}

/**
 * Dispara webhook quando liquidez é adicionada
 */
export async function fireLiquidityAddedWebhook(
  event: LiquidityAddedEvent
): Promise<void> {
  try {
    await webhookManager.fireEvent(
      WebhookEventType.LIQUIDITY_ADDED,
      event
    );
  } catch (error) {
    console.error('Erro ao disparar webhook de liquidez adicionada', error);
  }
}

/**
 * Dispara webhook quando uma transação falha
 */
export async function fireTransactionFailedWebhook(
  transactionHash: string,
  error: string,
  context: Record<string, unknown>
): Promise<void> {
  try {
    await webhookManager.fireEvent(
      WebhookEventType.TRANSACTION_FAILED,
      {
        transactionHash,
        error,
        ...context
      }
    );
  } catch (err) {
    console.error('Erro ao disparar webhook de transação falhada', err);
  }
}

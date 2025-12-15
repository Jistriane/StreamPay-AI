import crypto from 'crypto';
import { WebhookPayload, WebhookEventType } from './types';

/**
 * Gerenciador de segurança para webhooks
 * Responsável por geração e validação de signatures
 */
export class WebhookSecurity {
  /**
   * Gera uma signature HMAC-SHA256 para o payload
   */
  static generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Valida a signature de um webhook
   */
  static validateSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Gera um nonce único para prevenir replay attacks
   */
  static generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Cria um payload completo com signature
   */
  static createSignedPayload(
    event: WebhookEventType,
    data: Record<string, unknown>,
    secret: string
  ): WebhookPayload {
    const nonce = this.generateNonce();
    const timestamp = Date.now();

    const payload: Omit<WebhookPayload, 'signature'> = {
      event,
      timestamp,
      data,
      nonce
    };

    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString, secret);

    return {
      ...payload,
      signature
    };
  }

  /**
   * Valida um payload de webhook completo
   */
  static validatePayload(
    payload: WebhookPayload,
    secret: string,
    maxAgeMs: number = 5 * 60 * 1000 // 5 minutos padrão
  ): { valid: boolean; error?: string } {
    // Validar age
    const age = Date.now() - payload.timestamp;
    if (age > maxAgeMs) {
      return {
        valid: false,
        error: `Webhook expirado. Age: ${age}ms, máximo: ${maxAgeMs}ms`
      };
    }

    // Validar signature
    const payloadForValidation: Omit<WebhookPayload, 'signature'> = {
      event: payload.event,
      timestamp: payload.timestamp,
      data: payload.data,
      nonce: payload.nonce
    };

    const payloadString = JSON.stringify(payloadForValidation);

    try {
      const isValid = this.validateSignature(
        payloadString,
        payload.signature,
        secret
      );

      if (!isValid) {
        return {
          valid: false,
          error: 'Signature inválida'
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Erro ao validar signature: ${error}`
      };
    }
  }
}

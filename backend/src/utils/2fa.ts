/**
 * 2FA (Two-Factor Authentication) Module
 * Implementa TOTP (Time-based One-Time Password) usando Google Authenticator
 */

import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { logger } from "./logger";

/**
 * Gerar novo secret TOTP e QR code
 */
export async function generateTOTPSecret(userEmail: string): Promise<{
  secret: string;
  qrCode: string;
  backupCodes: string[];
}> {
  try {
    // Gerar secret
    const secret = speakeasy.generateSecret({
      name: `StreamPay (${userEmail})`,
      issuer: "StreamPay AI",
      length: 32, // Comprimento mais longo para melhor segurança
    });

    if (!secret.base32) {
      throw new Error("Failed to generate base32 secret");
    }

    // Gerar QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url || "");

    // Gerar backup codes (10 códigos de 8 dígitos)
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.floor(Math.random() * 100000000)
        .toString()
        .padStart(8, "0")
    );

    logger.info(`[2FA] TOTP secret generated for ${userEmail}`);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  } catch (error) {
    logger.error(`[2FA] Error generating TOTP secret: ${error}`);
    throw error;
  }
}

/**
 * Validar token TOTP
 */
export function validateTOTPToken(secret: string, token: string): boolean {
  try {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2, // Permitir 2 janelas de tempo para sincronização de clock
    });

    if (isValid) {
      logger.debug(`[2FA] TOTP token validated successfully`);
    } else {
      logger.warn(`[2FA] TOTP token validation failed`);
    }

    return isValid;
  } catch (error) {
    logger.error(`[2FA] Error validating TOTP token: ${error}`);
    return false;
  }
}

/**
 * Validar backup code
 */
export function validateBackupCode(backupCode: string, usedBackupCodes: string[]): boolean {
  const isValid =
    /^\d{8}$/.test(backupCode) && // Deve ser 8 dígitos
    !usedBackupCodes.includes(backupCode); // Não pode já ter sido usado

  if (isValid) {
    logger.debug(`[2FA] Backup code validated successfully`);
  } else {
    logger.warn(`[2FA] Backup code validation failed`);
  }

  return isValid;
}

/**
 * Gerar recovery token (para caso de perda de acesso)
 */
export function generateRecoveryToken(): string {
  return Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")
  ).join("-");
}

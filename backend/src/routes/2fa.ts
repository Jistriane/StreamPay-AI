/**
 * 2FA Routes
 * Endpoints para setup e validação de Two-Factor Authentication
 * 
 * Endpoints:
 * - POST /api/2fa/setup - Gerar QR code TOTP
 * - POST /api/2fa/confirm - Confirmar TOTP com token
 * - POST /api/2fa/disable - Desativar 2FA
 * - POST /api/2fa/verify - Verificar TOTP durante login
 * - POST /api/2fa/backup-codes - Regenerar backup codes
 */

import { Router, Response } from "express";
import { query } from "../db";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { asyncHandler, APIError } from "../middleware/errorHandler";
import {
  generateTOTPSecret,
  validateTOTPToken,
  validateBackupCode,
  generateRecoveryToken,
} from "../utils/2fa";
import { logger } from "../utils/logger";
import { logAudit } from "../utils/audit";

const router = Router();

/**
 * POST /api/2fa/setup
 * Gerar secret TOTP e QR code para setup de 2FA
 */
router.post(
  "/setup",
  authenticateJWT,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
    }

    try {
      // Buscar email do usuário
      const userResult = await query(
        "SELECT id, email FROM users WHERE address = $1",
        [req.user.address]
      );

      if (userResult.rows.length === 0) {
        throw new APIError(404, "User not found", "USER_NOT_FOUND");
      }

      const user = userResult.rows[0];

      // Gerar TOTP secret e QR code
      const { secret, qrCode, backupCodes } = await generateTOTPSecret(user.email);

      // Armazenar secret temporariamente (pending confirmation)
      await query(
        `UPDATE users SET two_fa_secret_pending = $1, two_fa_backup_codes_pending = $2
         WHERE address = $3`,
        [secret, JSON.stringify(backupCodes), req.user.address]
      );

      logger.info(`[2FA] Setup initiated for user ${req.user.address}`);

      res.json({
        success: true,
        data: {
          qrCode,
          secret, // Enviar também em caso de falha do QR reader
          backupCodes, // Mostrar ao usuário para guardar em local seguro
        },
        message:
          "Escanear QR code com Google Authenticator e confirmar com token de 6 dígitos",
      });
    } catch (error) {
      logger.error(`[2FA] Error in setup: ${error}`);
      throw error;
    }
  })
);

/**
 * POST /api/2fa/confirm
 * Confirmar TOTP e ativar 2FA
 */
router.post(
  "/confirm",
  authenticateJWT,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
    }

    const { token } = req.body;

    if (!token || !/^\d{6}$/.test(token)) {
      throw new APIError(400, "Invalid token format", "INVALID_TOKEN_FORMAT");
    }

    try {
      // Buscar secret pendente
      const userResult = await query(
        "SELECT two_fa_secret_pending, two_fa_backup_codes_pending FROM users WHERE address = $1",
        [req.user.address]
      );

      if (userResult.rows.length === 0) {
        throw new APIError(404, "User not found", "USER_NOT_FOUND");
      }

      const user = userResult.rows[0];

      if (!user.two_fa_secret_pending) {
        throw new APIError(400, "No pending 2FA setup", "NO_PENDING_2FA");
      }

      // Validar token TOTP
      if (!validateTOTPToken(user.two_fa_secret_pending, token)) {
        throw new APIError(400, "Invalid TOTP token", "INVALID_TOTP_TOKEN");
      }

      // Ativar 2FA
      await query(
        `UPDATE users 
         SET two_fa_enabled = true,
             two_fa_secret = $1,
             two_fa_backup_codes = $2,
             two_fa_secret_pending = NULL,
             two_fa_backup_codes_pending = NULL
         WHERE address = $3`,
        [
          user.two_fa_secret_pending,
          user.two_fa_backup_codes_pending,
          req.user.address,
        ]
      );

      // Audit log
      await logAudit({
        userId: req.user.address,
        action: "ENABLE_2FA",
        resource: "user",
        resourceId: req.user.address,
        details: { method: "TOTP" },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        status: "success",
      });

      logger.info(`[2FA] 2FA enabled for user ${req.user.address}`);

      res.json({
        success: true,
        data: {
          twoFAEnabled: true,
        },
        message:
          "✅ 2FA ativado com sucesso! Guarde seus backup codes em local seguro.",
      });
    } catch (error) {
      logger.error(`[2FA] Error confirming 2FA: ${error}`);
      throw error;
    }
  })
);

/**
 * POST /api/2fa/verify
 * Verificar TOTP durante login (usado durante autenticação)
 */
router.post(
  "/verify",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { address, token } = req.body;

    if (!address || !token) {
      throw new APIError(
        400,
        "Address and token required",
        "MISSING_PARAMETERS"
      );
    }

    if (!/^\d{6}$/.test(token) && !/^\d{8}$/.test(token)) {
      throw new APIError(400, "Invalid token format", "INVALID_TOKEN_FORMAT");
    }

    try {
      // Buscar usuário
      const userResult = await query(
        "SELECT two_fa_enabled, two_fa_secret, two_fa_backup_codes FROM users WHERE address = $1",
        [address.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        throw new APIError(404, "User not found", "USER_NOT_FOUND");
      }

      const user = userResult.rows[0];

      if (!user.two_fa_enabled) {
        throw new APIError(400, "2FA not enabled", "2FA_NOT_ENABLED");
      }

      let isValid = false;

      // Verificar TOTP (6 dígitos)
      if (token.length === 6) {
        isValid = validateTOTPToken(user.two_fa_secret, token);
      }

      // Verificar backup code (8 dígitos)
      if (!isValid && token.length === 8) {
        const usedCodes = JSON.parse(user.two_fa_backup_codes || "[]");
        if (validateBackupCode(token, usedCodes)) {
          isValid = true;
          // Marcar código como usado
          usedCodes.push(token);
          await query(
            "UPDATE users SET two_fa_backup_codes = $1 WHERE address = $2",
            [JSON.stringify(usedCodes), address.toLowerCase()]
          );
        }
      }

      if (!isValid) {
        logger.warn(`[2FA] Invalid token for user ${address}`);
        throw new APIError(401, "Invalid TOTP token", "INVALID_TOTP_TOKEN");
      }

      logger.info(`[2FA] Token verified for user ${address}`);

      res.json({
        success: true,
        data: { verified: true },
        message: "✅ 2FA verification successful",
      });
    } catch (error) {
      logger.error(`[2FA] Error verifying token: ${error}`);
      throw error;
    }
  })
);

/**
 * POST /api/2fa/disable
 * Desativar 2FA
 */
router.post(
  "/disable",
  authenticateJWT,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
    }

    const { token } = req.body;

    if (!token || !/^\d{6}$/.test(token)) {
      throw new APIError(400, "Invalid token format", "INVALID_TOKEN_FORMAT");
    }

    try {
      // Buscar secret TOTP
      const userResult = await query(
        "SELECT two_fa_secret FROM users WHERE address = $1",
        [req.user.address]
      );

      if (userResult.rows.length === 0) {
        throw new APIError(404, "User not found", "USER_NOT_FOUND");
      }

      const user = userResult.rows[0];

      // Validar token antes de desativar
      if (!validateTOTPToken(user.two_fa_secret, token)) {
        throw new APIError(400, "Invalid TOTP token", "INVALID_TOTP_TOKEN");
      }

      // Desativar 2FA
      await query(
        `UPDATE users 
         SET two_fa_enabled = false,
             two_fa_secret = NULL,
             two_fa_backup_codes = NULL
         WHERE address = $1`,
        [req.user.address]
      );

      logger.info(`[2FA] 2FA disabled for user ${req.user.address}`);

      res.json({
        success: true,
        data: { twoFAEnabled: false },
        message: "✅ 2FA desativado com sucesso",
      });
    } catch (error) {
      logger.error(`[2FA] Error disabling 2FA: ${error}`);
      throw error;
    }
  })
);

/**
 * POST /api/2fa/backup-codes
 * Regenerar backup codes
 */
router.post(
  "/backup-codes",
  authenticateJWT,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
    }

    const { token } = req.body;

    if (!token || !/^\d{6}$/.test(token)) {
      throw new APIError(400, "Invalid token format", "INVALID_TOKEN_FORMAT");
    }

    try {
      // Buscar secret TOTP
      const userResult = await query(
        "SELECT two_fa_secret FROM users WHERE address = $1",
        [req.user.address]
      );

      if (userResult.rows.length === 0) {
        throw new APIError(404, "User not found", "USER_NOT_FOUND");
      }

      const user = userResult.rows[0];

      // Validar token
      if (!validateTOTPToken(user.two_fa_secret, token)) {
        throw new APIError(400, "Invalid TOTP token", "INVALID_TOTP_TOKEN");
      }

      // Gerar novos backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, "0")
      );

      // Salvar novos codes
      await query(
        "UPDATE users SET two_fa_backup_codes = $1 WHERE address = $2",
        [JSON.stringify(backupCodes), req.user.address]
      );

      logger.info(`[2FA] Backup codes regenerated for user ${req.user.address}`);

      res.json({
        success: true,
        data: { backupCodes },
        message: "✅ Backup codes regenerados com sucesso",
      });
    } catch (error) {
      logger.error(`[2FA] Error regenerating backup codes: ${error}`);
      throw error;
    }
  })
);

export default router;

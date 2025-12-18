/**
 * Audit Logging Utility
 * 
 * Registra todas as ações críticas do sistema para compliance e auditoria
 * 
 * Ações auditadas:
 * - CREATE_STREAM, CANCEL_STREAM, CLAIM_STREAM
 * - ENABLE_2FA, DISABLE_2FA, 2FA_LOGIN
 * - LOGIN, LOGOUT
 * - CREATE_POOL, ADD_LIQUIDITY
 * 
 * Uso:
 * ```typescript
 * await logAudit({
 *   userId: req.user.address,
 *   action: "CREATE_STREAM",
 *   resource: "stream",
 *   resourceId: stream.id.toString(),
 *   details: { amount, recipient, duration },
 *   ipAddress: req.ip,
 *   userAgent: req.headers["user-agent"],
 * });
 * ```
 */

import { query } from "../db";
import { logger } from "./logger";

export interface AuditLogEntry {
  userId?: string; // User wallet address (optional for system events)
  action: string; // Action type (CREATE_STREAM, ENABLE_2FA, etc.)
  resource?: string; // Resource type (stream, pool, user, etc.)
  resourceId?: string; // ID of the affected resource
  details?: Record<string, any>; // Additional metadata
  ipAddress?: string; // User IP address
  userAgent?: string; // User agent string
  status?: "success" | "failure"; // Operation status (default: success)
  errorMessage?: string; // Error message if status is failure
}

/**
 * Log an audit event
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (
        user_id, action, resource, resource_id, details,
        ip_address, user_agent, status, error_message, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        entry.userId || null,
        entry.action,
        entry.resource || null,
        entry.resourceId || null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.status || "success",
        entry.errorMessage || null,
      ]
    );

    logger.debug(`[Audit] ${entry.action} by ${entry.userId || "system"}`);
  } catch (error) {
    logger.error(`[Audit] Failed to log audit entry: ${error}`);
    // Não lançar erro - audit logging não deve quebrar operação principal
  }
}

/**
 * Query audit logs com filtros
 */
export async function getAuditLogs(filters: {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  try {
    let sql = `
      SELECT id, user_id, action, resource, resource_id, details,
             ip_address, user_agent, status, error_message, created_at
      FROM audit_logs
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters.userId) {
      sql += ` AND user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }

    if (filters.action) {
      sql += ` AND action = $${paramIndex++}`;
      params.push(filters.action);
    }

    if (filters.resource) {
      sql += ` AND resource = $${paramIndex++}`;
      params.push(filters.resource);
    }

    if (filters.startDate) {
      sql += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    logger.error(`[Audit] Failed to query audit logs: ${error}`);
    throw error;
  }
}

/**
 * Exportar relatório de auditoria para análise externa
 */
export async function exportAuditReport(filters: {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<string> {
  try {
    const logs = await getAuditLogs({
      ...filters,
      limit: 10000, // Max 10k registros por relatório
    });

    // Gerar CSV
    const headers = [
      "ID",
      "User ID",
      "Action",
      "Resource",
      "Resource ID",
      "Details",
      "IP Address",
      "Status",
      "Created At",
    ];

    const rows = logs.map((log) => [
      log.id,
      log.user_id || "",
      log.action,
      log.resource || "",
      log.resource_id || "",
      log.details ? JSON.stringify(log.details) : "",
      log.ip_address || "",
      log.status,
      log.created_at.toISOString(),
    ]);

    const csv =
      headers.join(",") +
      "\n" +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    logger.info(`[Audit] Exported ${logs.length} audit logs`);
    return csv;
  } catch (error) {
    logger.error(`[Audit] Failed to export audit report: ${error}`);
    throw error;
  }
}

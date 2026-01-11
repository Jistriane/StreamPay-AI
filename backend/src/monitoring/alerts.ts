/**
 * Alert System
 * Send alerts for critical issues
 */

import axios from "axios";
import { Logger } from "../utils/logger";
import { captureMessage, addBreadcrumb } from "./sentry";

const logger = Logger.getInstance();

export enum AlertSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum AlertType {
  WEBHOOK_FAILURE = "webhook_failure",
  CONTRACT_ERROR = "contract_error",
  WEBSOCKET_ERROR = "websocket_error",
  DATABASE_ERROR = "database_error",
  API_ERROR = "api_error",
  AUTHENTICATION_FAILURE = "auth_failure",
  RATE_LIMIT = "rate_limit",
  SYSTEM_HEALTH = "system_health",
  CUSTOM = "custom",
}

export interface Alert {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
  source?: string;
}

class AlertSystem {
  private static instance: AlertSystem;
  private webhookUrl: string | null = null;
  private emailAlerts: string[] = [];
  private discordWebhook: string | null = null;
  private severityThreshold: AlertSeverity = AlertSeverity.HIGH;

  private constructor() {
    this.webhookUrl = process.env.ALERT_WEBHOOK_URL || null;
    this.discordWebhook = process.env.DISCORD_WEBHOOK_URL || null;
    if (process.env.ALERT_EMAIL) {
      this.emailAlerts = process.env.ALERT_EMAIL.split(",");
    }
    this.severityThreshold = (process.env.ALERT_SEVERITY_THRESHOLD as AlertSeverity) || AlertSeverity.HIGH;
  }

  static getInstance(): AlertSystem {
    if (!AlertSystem.instance) {
      AlertSystem.instance = new AlertSystem();
    }
    return AlertSystem.instance;
  }

  /**
   * Send alert
   */
  async sendAlert(alert: Alert): Promise<void> {
    try {
      // Log alert
      logger.warn(`[${alert.type}] ${alert.title}`, {
        severity: alert.severity,
        message: alert.message,
        context: alert.context,
      });

      // Add to Sentry breadcrumb
      addBreadcrumb(`Alert: ${alert.title}`, "alert", "warning", {
        severity: alert.severity,
        type: alert.type,
      });

      // Check severity threshold
      if (!this.meetsThreshold(alert.severity)) {
        return;
      }

      // Send via available channels
      const promises: Promise<any>[] = [];

      if (this.webhookUrl) {
        promises.push(this.sendViaWebhook(alert));
      }

      if (this.discordWebhook) {
        promises.push(this.sendViaDiscord(alert));
      }

      if (this.emailAlerts.length > 0) {
        promises.push(this.sendViaEmail(alert));
      }

      await Promise.allSettled(promises);
    } catch (error: any) {
      logger.error("Error sending alert", { error: error.message });
    }
  }

  /**
   * Check if alert meets severity threshold
   */
  private meetsThreshold(severity: AlertSeverity): boolean {
    const severityLevels = {
      [AlertSeverity.LOW]: 1,
      [AlertSeverity.MEDIUM]: 2,
      [AlertSeverity.HIGH]: 3,
      [AlertSeverity.CRITICAL]: 4,
    };

    return severityLevels[severity] >= severityLevels[this.severityThreshold];
  }

  /**
   * Send via generic webhook
   */
  private async sendViaWebhook(alert: Alert): Promise<void> {
    if (!this.webhookUrl) return;

    try {
      await axios.post(this.webhookUrl, {
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        context: alert.context,
        timestamp: alert.timestamp,
        source: alert.source || "StreamPay",
      });

      logger.debug("Alert sent via webhook");
    } catch (error: any) {
      logger.error("Failed to send alert via webhook", {
        error: error.message,
      });
    }
  }

  /**
   * Send via Discord
   */
  private async sendViaDiscord(alert: Alert): Promise<void> {
    if (!this.discordWebhook) return;

    try {
      const colors = {
        [AlertSeverity.LOW]: 3447003,      // Blue
        [AlertSeverity.MEDIUM]: 16776960,  // Yellow
        [AlertSeverity.HIGH]: 16711680,    // Red
        [AlertSeverity.CRITICAL]: 0,       // Black
      };

      await axios.post(this.discordWebhook, {
        embeds: [
          {
            title: `🚨 ${alert.title}`,
            description: alert.message,
            color: colors[alert.severity],
            fields: [
              {
                name: "Type",
                value: alert.type,
                inline: true,
              },
              {
                name: "Severity",
                value: alert.severity.toUpperCase(),
                inline: true,
              },
              ...(alert.context
                ? [
                    {
                      name: "Context",
                      value: `\`\`\`json\n${JSON.stringify(alert.context, null, 2)}\n\`\`\``,
                      inline: false,
                    },
                  ]
                : []),
            ],
            timestamp: new Date(alert.timestamp).toISOString(),
            footer: {
              text: alert.source || "StreamPay",
            },
          },
        ],
      });

      logger.debug("Alert sent via Discord");
    } catch (error: any) {
      logger.error("Failed to send alert via Discord", {
        error: error.message,
      });
    }
  }

  /**
   * Send via Email (placeholder - implement with SMTP)
   */
  private async sendViaEmail(alert: Alert): Promise<void> {
    if (this.emailAlerts.length === 0) return;

    try {
      // TODO: Implement SMTP email sending
      logger.debug("Email alert queued", {
        recipients: this.emailAlerts,
        type: alert.type,
      });

      // Placeholder: just log that we would send
      // In production, integrate with nodemailer or similar
    } catch (error: any) {
      logger.error("Failed to send alert via email", {
        error: error.message,
      });
    }
  }

  /**
   * Helper: Webhook failure alert
   */
  async alertWebhookFailure(url: string, error: string, retries: number): Promise<void> {
    await this.sendAlert({
      type: AlertType.WEBHOOK_FAILURE,
      severity: retries >= 3 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
      title: "Webhook Delivery Failed",
      message: `Failed to deliver webhook to ${url} after ${retries} retries`,
      context: { url, error, retries },
      timestamp: Date.now(),
    });
  }

  /**
   * Helper: Contract error alert
   */
  async alertContractError(contractName: string, method: string, error: string): Promise<void> {
    await this.sendAlert({
      type: AlertType.CONTRACT_ERROR,
      severity: AlertSeverity.CRITICAL,
      title: "Smart Contract Error",
      message: `Error in ${contractName}.${method}()`,
      context: { contract: contractName, method, error },
      timestamp: Date.now(),
    });
  }

  /**
   * Helper: WebSocket error alert
   */
  async alertWebSocketError(error: string, clientCount: number): Promise<void> {
    await this.sendAlert({
      type: AlertType.WEBSOCKET_ERROR,
      severity: clientCount > 100 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
      title: "WebSocket Error",
      message: error,
      context: { affectedClients: clientCount },
      timestamp: Date.now(),
    });
  }

  /**
   * Helper: Database error alert
   */
  async alertDatabaseError(error: string): Promise<void> {
    await this.sendAlert({
      type: AlertType.DATABASE_ERROR,
      severity: AlertSeverity.CRITICAL,
      title: "Database Connection Error",
      message: error,
      timestamp: Date.now(),
    });
  }

  /**
   * Helper: Rate limit alert
   */
  async alertRateLimit(ip: string, endpoint: string, requests: number): Promise<void> {
    await this.sendAlert({
      type: AlertType.RATE_LIMIT,
      severity: AlertSeverity.MEDIUM,
      title: "Rate Limit Exceeded",
      message: `Too many requests from ${ip} to ${endpoint}`,
      context: { ip, endpoint, requests },
      timestamp: Date.now(),
    });
  }

  /**
   * Helper: System health alert
   */
  async alertSystemHealth(metric: string, value: number, threshold: number): Promise<void> {
    await this.sendAlert({
      type: AlertType.SYSTEM_HEALTH,
      severity: value > threshold * 0.9 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
      title: "System Health Warning",
      message: `${metric} is at ${value}% (threshold: ${threshold}%)`,
      context: { metric, value, threshold },
      timestamp: Date.now(),
    });
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      webhookConfigured: !!this.webhookUrl,
      discordConfigured: !!this.discordWebhook,
      emailConfigured: this.emailAlerts.length > 0,
      emailRecipients: this.emailAlerts,
      severityThreshold: this.severityThreshold,
    };
  }
}

export const alertSystem = AlertSystem.getInstance();

export { AlertSystem };

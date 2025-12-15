/**
 * Sentry Monitoring
 * Error tracking and performance monitoring
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { Logger } from "./logger";

const logger = Logger.getInstance();

export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  enabled: boolean;
}

let initialized = false;

/**
 * Initialize Sentry
 */
export function initializeSentry(config: Partial<SentryConfig> = {}): void {
  if (initialized) {
    logger.warn("Sentry already initialized");
    return;
  }

  const dsn = process.env.SENTRY_DSN || config.dsn;
  const environment = process.env.NODE_ENV || config.environment || "development";
  const enabled = config.enabled !== false && !!dsn;

  if (!enabled || !dsn) {
    logger.info("Sentry monitoring disabled (no DSN provided)", { environment });
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection(),
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: config.tracesSampleRate ?? 1.0,
      profilesSampleRate: config.profilesSampleRate ?? 1.0,
      maxBreadcrumbs: 50,
      attachStacktrace: true,
      denyUrls: [
        // Browser extensions
        /extensions\//i,
        /^chrome:\/\//i,
        // Internal health checks
        /\/health\/?$/i,
      ],
    });

    initialized = true;
    logger.info("Sentry monitoring initialized", { environment, dsn: dsn.split("@")[0] });
  } catch (error: any) {
    logger.error("Failed to initialize Sentry", { error: error.message });
  }
}

/**
 * Capture exception
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (!initialized || !Sentry.isInitialized()) {
    logger.error("Exception", { error: error.message, context });
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  context?: Record<string, any>
): void {
  if (!initialized || !Sentry.isInitialized()) {
    logger[level === "error" ? "error" : "info"](message, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

/**
 * Set user context
 */
export function setUserContext(user: {
  id: string;
  wallet?: string;
  email?: string;
  type?: string;
}): void {
  if (!initialized || !Sentry.isInitialized()) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    wallet: user.wallet,
  });

  Sentry.setTag("user_type", user.type || "unknown");
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  if (!initialized || !Sentry.isInitialized()) return;
  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(
  message: string,
  category: string = "custom",
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  data?: Record<string, any>
): void {
  if (!initialized || !Sentry.isInitialized()) return;

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

/**
 * Create transaction for performance monitoring
 */
export function startTransaction(
  name: string,
  op: string = "custom"
): Sentry.Transaction | null {
  if (!initialized || !Sentry.isInitialized()) return null;

  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Get Sentry instance
 */
export function getSentry() {
  return Sentry;
}

/**
 * Graceful shutdown
 */
export async function closeSentry(): Promise<void> {
  if (!initialized || !Sentry.isInitialized()) return;

  try {
    await Sentry.close(2000); // 2 second timeout
    initialized = false;
    logger.info("Sentry closed successfully");
  } catch (error: any) {
    logger.error("Error closing Sentry", { error: error.message });
  }
}

/**
 * Express error handler middleware
 */
export function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler();
}

/**
 * Express request handler middleware
 */
export function sentryRequestHandler() {
  return Sentry.Handlers.requestHandler({
    request: true,
    serverName: true,
    user: true,
  });
}

/**
 * Check if Sentry is initialized
 */
export function isSentryInitialized(): boolean {
  return initialized && Sentry.isInitialized();
}

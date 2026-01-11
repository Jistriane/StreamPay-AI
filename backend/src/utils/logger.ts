/**
 * Logger utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: unknown;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private format(entry: LogEntry): string {
    const { level, timestamp, message, context, error } = entry;
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    const errorStr = error ? ` | ${error.message}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  debug(message: string, context?: unknown): void {
    if (!this.isDevelopment) return;

    const entry: LogEntry = {
      level: 'debug',
      timestamp: this.getTimestamp(),
      message,
      context
    };

    console.debug(this.format(entry));
  }

  info(message: string, context?: unknown): void {
    const entry: LogEntry = {
      level: 'info',
      timestamp: this.getTimestamp(),
      message,
      context
    };

    console.log(this.format(entry));
  }

  warn(message: string, context?: unknown): void {
    const entry: LogEntry = {
      level: 'warn',
      timestamp: this.getTimestamp(),
      message,
      context
    };

    console.warn(this.format(entry));
  }

  error(message: string, context?: unknown, error?: unknown): void {
    let errorObj: Error | undefined;

    if (error instanceof Error) {
      errorObj = error;
    } else if (typeof error === 'string') {
      errorObj = new Error(error);
    } else if (error && typeof error === 'object') {
      errorObj = new Error(JSON.stringify(error));
    }

    const entry: LogEntry = {
      level: 'error',
      timestamp: this.getTimestamp(),
      message,
      context,
      error: errorObj
    };

    console.error(this.format(entry));

    // Em produção, enviar para serviço de error tracking (Sentry)
    if (process.env.SENTRY_DSN) {
      // Implementar integração com Sentry
      // Sentry.captureException(error);
    }
  }
}

export { Logger };
export const logger = Logger.getInstance();

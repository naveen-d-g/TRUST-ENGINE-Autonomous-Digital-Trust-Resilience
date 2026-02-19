import { runtimeConfig } from '../config/runtimeConfig';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private minLevel: LogLevel;
  private sendToBackend: boolean;

  constructor() {
    this.minLevel = runtimeConfig.logging.level as LogLevel;
    this.sendToBackend = runtimeConfig.logging.sendToBackend;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private async sendLog(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.sendToBackend) return;

    try {
      await fetch(`${runtimeConfig.api.baseUrl}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          context,
          error: error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          } : undefined,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (err) {
      // Silently fail - don't want logging to break the app
      console.error('Failed to send log to backend:', err);
    }
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog('info')) return;
    console.info(this.formatMessage('info', message, context));
    this.sendLog('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context));
    this.sendLog('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage('error', message, context), error);
    this.sendLog('error', message, context, error);
  }

  /**
   * Performance timing helper
   */
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`${label} took ${duration.toFixed(2)}ms`);
    };
  }
}

export const logger = new Logger();

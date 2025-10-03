/**
 * Logger utility for error tracking and logging
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>) {
    this.log("info", message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>) {
    this.log("warn", message, context);
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log("error", message, { ...context, error });
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      this.log("debug", message, context);
    }
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    // Console output with appropriate method
    switch (level) {
      case "error":
        console.error(`[${logEntry.timestamp}] ERROR:`, message, context);
        break;
      case "warn":
        console.warn(`[${logEntry.timestamp}] WARN:`, message, context);
        break;
      case "info":
        console.info(`[${logEntry.timestamp}] INFO:`, message, context);
        break;
      case "debug":
        console.debug(`[${logEntry.timestamp}] DEBUG:`, message, context);
        break;
    }

    // In production, you could send logs to a service like Sentry, LogRocket, etc.
    if (!this.isDevelopment && level === "error") {
      this.sendToErrorTracking(logEntry);
    }
  }

  /**
   * Send error logs to external tracking service
   * (Placeholder for future integration)
   */
  private sendToErrorTracking(logEntry: LogEntry) {
    // TODO: Integrate with error tracking service (Sentry, etc.)
    // Example:
    // Sentry.captureException(logEntry.context?.error, {
    //   level: logEntry.level,
    //   extra: logEntry.context,
    // });
  }
}

// Export singleton instance
export const logger = new Logger();

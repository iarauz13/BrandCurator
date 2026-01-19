type LogLevel = 'info' | 'warn' | 'error' | 'perf';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  latencyMs?: number;
}

/**
 * Production monitoring utility. 
 * Tracks system health and API performance.
 */
class Logger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 100;

  log(level: LogLevel, message: string, context?: any, latencyMs?: number) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      latencyMs
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.MAX_LOGS) this.logs.pop();

    // In a real Python/App environment, you would pipe this to Sentry or a custom endpoint
    if (level === 'error') {
      console.error(`[STABILITY ERROR] ${message}`, context);
    } else if (level === 'perf') {
      console.info(`[PERF METRIC] ${message} - ${latencyMs}ms`);
    }
  }

  getRecentLogs() {
    return this.logs;
  }
}

export const logger = new Logger();
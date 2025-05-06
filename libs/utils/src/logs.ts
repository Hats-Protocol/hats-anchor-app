type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Signature of a logging function */
export interface LogFn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (message?: any, ...optionalParams: any[]): void;
}

/** Basic logger interface */
export interface Logger {
  warn: LogFn;
  error: LogFn;
  debug: LogFn;
  info: LogFn;
}

export class ConsoleLogger implements Logger {
  private levels: LogLevel[];
  private currentLevel: LogLevel;
  readonly debug: LogFn;
  readonly info: LogFn;
  readonly warn: LogFn;
  readonly error: LogFn;

  constructor() {
    this.levels = ['debug', 'info', 'warn', 'error'];
    this.currentLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

    // Create filtered logging functions
    this.debug = this.createFilteredLog('debug', console.debug.bind(console));
    this.info = this.createFilteredLog('info', console.info.bind(console));
    this.warn = this.createFilteredLog('warn', console.warn.bind(console));
    this.error = this.createFilteredLog('error', console.error.bind(console));
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.currentLevel);
  }

  private createFilteredLog(level: LogLevel, logFn: LogFn): LogFn {
    return (...args: any[]) => {
      if (this.shouldLog(level)) {
        logFn(...args);
      }
    };
  }

  setLevel(level: LogLevel): void {
    if (this.levels.includes(level)) {
      this.currentLevel = level;
    } else {
      // eslint-disable-next-line no-console
      console.error(`Invalid log level: ${level}`);
    }
  }
}

export const logger = new ConsoleLogger();

/**
 * Only shows logs in development -- for debugging without worrying about logs in production
 * Use by importing logger and then `logger('some message')`
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const simpleLogger = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    return console.log(...args);
  }
};

export default simpleLogger;

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

    this.debug = console.debug.bind(console);
    this.info = console.info.bind(console);
    this.warn = console.warn.bind(console);
    this.error = console.error.bind(console);
  }

  setLevel(level: LogLevel): void {
    if (this.levels.includes(level)) {
      this.currentLevel = level;
    } else {
      // eslint-disable-next-line no-console
      console.error(`Invalid log level: ${level}`);
    }
  }

  // private _log(level: LogLevel, message: string, ...args: unknown[]): void {
  //   const levelIndex = this.levels.indexOf(level);
  //   const currentLevelIndex = this.levels.indexOf(this.currentLevel);
  //   console.log('levelIndex', levelIndex, currentLevelIndex);

  //   if (levelIndex < currentLevelIndex) return;

  //   const timestamp = new Date().toISOString();

  // TODO couldn't find a good way to preserve source map while injecting level & timestamp
  //   this[level](`[${level.toUpperCase()}] ${timestamp} -`, message, ...args);
  // }
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

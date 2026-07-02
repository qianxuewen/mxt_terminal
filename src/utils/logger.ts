/**
 * 日志工具
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private listeners: Array<(entry: LogEntry) => void> = [];

  setMaxLogs(n: number): void {
    this.maxLogs = n;
  }

  debug(module: string, message: string, data?: any): void {
    this.log('debug', module, message, data);
  }

  info(module: string, message: string, data?: any): void {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: any): void {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, data?: any): void {
    this.log('error', module, message, data);
  }

  private log(level: LogLevel, module: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${module}]`;
    switch (level) {
      case 'debug':
        console.debug(prefix, message, data || '');
        break;
      case 'info':
        console.info(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        break;
    }

    this.listeners.forEach((cb) => cb(entry));
  }

  /** 获取所有日志 */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /** 获取指定级别日志 */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((l) => l.level === level);
  }

  /** 获取指定模块日志 */
  getLogsByModule(module: string): LogEntry[] {
    return this.logs.filter((l) => l.module === module);
  }

  /** 监听新日志 */
  onLog(callback: (entry: LogEntry) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /** 清除日志 */
  clear(): void {
    this.logs = [];
  }

  /** 导出日志 */
  export(): string {
    return this.logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.module}] ${l.message}`)
      .join('\n');
  }
}

export const logger = new Logger();

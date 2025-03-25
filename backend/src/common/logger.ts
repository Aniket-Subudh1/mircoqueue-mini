import * as dotenv from 'dotenv';
dotenv.config();

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Map string log levels to enum
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG,
};

// Get current log level from environment or default to INFO
const logLevel = process.env.LOG_LEVEL || 'info';
const logFormat = process.env.LOG_FORMAT || 'json';
const currentLogLevel = LOG_LEVEL_MAP[logLevel] || LogLevel.INFO;

/**
 * Format log message according to config
 */
const formatLogMessage = (level: string, message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  const requestId = process.env.AWS_REQUEST_ID || '-';
  
  if (logFormat === 'json') {
    const logObject = {
      timestamp,
      level,
      message,
      requestId,
      service: 'MicroQueue-Mini',
      version: '1.0.0',
      env: process.env.STAGE || 'dev',
      ...(data ? { data } : {}),
    };
    
    return JSON.stringify(logObject);
  }
  
  // Default to plain text format
  let logMessage = `[${timestamp}] [${level.toUpperCase()}] [${requestId}] ${message}`;
  
  if (data) {
    logMessage += ` ${JSON.stringify(data)}`;
  }
  
  return logMessage;
};

/**
 * Logger class
 */
class Logger {
  /**
   * Error level logging
   */
  error(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.ERROR) {
      console.error(formatLogMessage('error', message, data));
    }
  }
  
  /**
   * Warning level logging
   */
  warn(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.WARN) {
      console.warn(formatLogMessage('warn', message, data));
    }
  }
  
  /**
   * Info level logging
   */
  info(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.INFO) {
      console.info(formatLogMessage('info', message, data));
    }
  }
  
  /**
   * Debug level logging
   */
  debug(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.debug(formatLogMessage('debug', message, data));
    }
  }
}

// Export singleton logger instance
export const logger = new Logger();

export default logger;
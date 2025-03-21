const config: Config = require('./config');

interface LoggingConfig {
  level: string;
  format: string;
}

interface Config {
  logging: LoggingConfig;
  serviceName: string;
  version: string;
  env: string;
}

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

// Get current log level from config
const currentLogLevel = LOG_LEVEL_MAP[config.logging.level] || LogLevel.INFO;


const formatLogMessage = (level: string, message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  const requestId = process.env.AWS_REQUEST_ID || '-';
  
  if (config.logging.format === 'json') {
    const logObject = {
      timestamp,
      level,
      message,
      requestId,
      service: config.serviceName,
      version: config.version,
      env: config.env,
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

class Logger {

  error(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.ERROR) {
      console.error(formatLogMessage('error', message, data));
    }
  }
  
  
  warn(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.WARN) {
      console.warn(formatLogMessage('warn', message, data));
    }
  }
  

  info(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.INFO) {
      console.info(formatLogMessage('info', message, data));
    }
  }

  debug(message: string, data?: any): void {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.debug(formatLogMessage('debug', message, data));
    }
  }
}

// Export singleton logger instance
export const logger = new Logger();

export default logger;
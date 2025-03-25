import { STAGE, ENV, LIMITS } from './constants';
import * as dotenv from 'dotenv';
dotenv.config();

const baseConfig = {
  // System info
  serviceName: 'MicroQueue-Mini',
  version: '1.0.0',
  
  
  // DynamoDB settings
  dynamodb: {
    maxRetries: 3,
    timeout: 5000, // ms
  },
  
  // S3 settings
  s3: {
    maxRetries: 3,
    timeout: 10000, // ms
  },
  
  // API settings
  api: {
    corsOrigins: '*',
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
  
  // Logging
  logging: {
    level: 'info',
    format: 'json',
  },
  
  // Topic settings
  topics: {
    maxTopicsPerAccount: 100,
    defaultRetentionHours: LIMITS.DEFAULT_RETENTION_HOURS,
  },
  
  // Message settings
  messages: {
    maxSizeBytes: LIMITS.MAX_MESSAGE_SIZE_BYTES,
    batchSize: 25,
  },
  
  // Consumer settings
  consumers: {
    defaultMaxMessages: LIMITS.DEFAULT_MESSAGES_PER_CONSUME,
    defaultWaitTimeSeconds: LIMITS.DEFAULT_WAIT_TIME_SECONDS,
  },
};

// Environment specific configurations
const envConfigs = {
  [ENV.DEV]: {
    logging: {
      level: 'debug',
    },
    topics: {
      maxTopicsPerAccount: 20,
    },
  },
  [ENV.STAGING]: {
    logging: {
      level: 'debug',
    },
    topics: {
      maxTopicsPerAccount: 50,
    },
  },
  [ENV.PROD]: {
    logging: {
      level: 'info',
    },
    topics: {
      maxTopicsPerAccount: 100,
    },
    api: {
      rateLimit: {
        windowMs: 60 * 1000, // 1 minute
        max: 200, // limit each IP to 200 requests per windowMs
      },
    },
  },
};

// Merge base config with environment specific config
const environmentConfig = envConfigs[STAGE] || envConfigs[ENV.DEV];

// Export the final configuration
export const config = {
  ...baseConfig,
  ...environmentConfig,
  env: STAGE,
};

export default config;
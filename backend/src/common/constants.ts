// Environment names
export const ENV = {
    DEV: 'dev',
    STAGING: 'staging',
    PROD: 'prod',
  };
  
  // Current environment
  export const STAGE = process.env.STAGE || ENV.DEV;
  
  // DynamoDB table names
  export const TABLES = {
    TOPICS: process.env.TOPICS_TABLE || `MicroQueue-Topics-${STAGE}`,
    MESSAGES: process.env.MESSAGES_TABLE || `MicroQueue-Messages-${STAGE}`,
    CONSUMER_GROUPS: process.env.CONSUMER_GROUPS_TABLE || `MicroQueue-ConsumerGroups-${STAGE}`,
    OFFSETS: process.env.OFFSETS_TABLE || `MicroQueue-Offsets-${STAGE}`,
  };
  
  // S3 bucket names
  export const BUCKETS = {
    MESSAGES: process.env.MESSAGES_BUCKET || `microqueue-messages-${STAGE}`,
    ARCHIVE: process.env.ARCHIVE_BUCKET || `microqueue-archive-${STAGE}`,
  };
  
  // System limits
  export const LIMITS = {
    MAX_TOPIC_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_MESSAGE_SIZE_BYTES: 256 * 1024, // 256KB
    MAX_METADATA_KEYS: 10,
    MAX_METADATA_KEY_LENGTH: 128,
    MAX_METADATA_VALUE_LENGTH: 256,
    MAX_RETENTION_HOURS: 7 * 24, // 1 week
    DEFAULT_RETENTION_HOURS: 24, // 1 day
    MAX_MESSAGES_PER_CONSUME: 100,
    DEFAULT_MESSAGES_PER_CONSUME: 10,
    MAX_WAIT_TIME_SECONDS: 20,
    DEFAULT_WAIT_TIME_SECONDS: 0,
  };
  
  // Error codes
  export const ERROR_CODES = {
    // General errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    
    // Topic errors
    TOPIC_NOT_FOUND: 'TOPIC_NOT_FOUND',
    TOPIC_ALREADY_EXISTS: 'TOPIC_ALREADY_EXISTS',
    
    // Message errors
    MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',
    MESSAGE_TOO_LARGE: 'MESSAGE_TOO_LARGE',
    INVALID_MESSAGE_FORMAT: 'INVALID_MESSAGE_FORMAT',
    
    // Consumer errors
    CONSUMER_GROUP_NOT_FOUND: 'CONSUMER_GROUP_NOT_FOUND',
    CONSUMER_GROUP_ALREADY_EXISTS: 'CONSUMER_GROUP_ALREADY_EXISTS',
    
    // System errors
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  };
  
  // HTTP Status codes
  export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    PAYLOAD_TOO_LARGE: 413,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  };
  
  // Content types
  export const CONTENT_TYPES = {
    JSON: 'application/json',
    TEXT: 'text/plain',
    XML: 'application/xml',
    BINARY: 'application/octet-stream',
  };
  
  // Raft consensus algorithm constants
  export const RAFT = {
    HEARTBEAT_INTERVAL_MS: 100,
    ELECTION_TIMEOUT_MIN_MS: 150,
    ELECTION_TIMEOUT_MAX_MS: 300,
    MAX_LOG_ENTRIES_PER_REQUEST: 100,
  };
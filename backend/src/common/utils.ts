import { nanoid } from 'nanoid';
import { LIMITS, CONTENT_TYPES } from './constants';
import { Errors } from './errors';

export const generateId = (prefix?: string, length = 16): string => {
  const id = nanoid(length);
  return prefix ? `${prefix}_${id}` : id;
};


export const generateTopicId = (): string => {
  return generateId('topic');
};


export const generateMessageId = (): string => {
  return generateId('msg');
};


export const generateConsumerGroupId = (): string => {
  return generateId('consumer');
};

export const generatePayloadKey = (topicId: string, messageId: string): string => {
  const timestamp = Date.now();
  return `${topicId}/${timestamp}/${messageId}`;
};


export const validateMessageSize = (payload: string | object): void => {
  const stringPayload = typeof payload === 'string' 
    ? payload 
    : JSON.stringify(payload);
  
  const size = Buffer.byteLength(stringPayload, 'utf8');
  
  if (size > LIMITS.MAX_MESSAGE_SIZE_BYTES) {
    throw Errors.messageTooLarge(size, LIMITS.MAX_MESSAGE_SIZE_BYTES);
  }
};


export const validateMetadata = (metadata?: Record<string, string>): void => {
  if (!metadata) return;
  
  const keys = Object.keys(metadata);
  
  if (keys.length > LIMITS.MAX_METADATA_KEYS) {
    throw Errors.validationError(
      `Metadata cannot have more than ${LIMITS.MAX_METADATA_KEYS} keys`,
      { field: 'metadata' }
    );
  }
  
  for (const key of keys) {
    if (key.length > LIMITS.MAX_METADATA_KEY_LENGTH) {
      throw Errors.validationError(
        `Metadata key '${key}' exceeds maximum length of ${LIMITS.MAX_METADATA_KEY_LENGTH}`,
        { field: 'metadata', key }
      );
    }
    
    const value = metadata[key];
    if (value && value.length > LIMITS.MAX_METADATA_VALUE_LENGTH) {
      throw Errors.validationError(
        `Metadata value for key '${key}' exceeds maximum length of ${LIMITS.MAX_METADATA_VALUE_LENGTH}`,
        { field: 'metadata', key }
      );
    }
  }
};


export const formatResponse = <T>(data: T) => {
  return {
    success: true,
    data,
  };
};


export const formatApiResponse = <T>(data: T, statusCode = 200) => {
  return {
    statusCode,
    body: JSON.stringify(formatResponse(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export const determineContentType = (
  payload: string | object, 
  contentType?: string
): string => {
  if (contentType) return contentType;
  
  if (typeof payload === 'string') {
    try {
      JSON.parse(payload);
      return CONTENT_TYPES.JSON;
    } catch (e) {
      return CONTENT_TYPES.TEXT;
    }
  }
  
  return CONTENT_TYPES.JSON;
};

export const calculateExpirationTimestamp = (
  createdAt: number,
  retentionPeriodHours: number
): number => {
  return createdAt + (retentionPeriodHours * 60 * 60 * 1000);
};


export const parseRequestBody = <T>(body: string | null): T => {
  if (!body) {
    throw Errors.validationError('Request body is required');
  }
  
  try {
    return JSON.parse(body) as T;
  } catch (error) {
    throw Errors.validationError('Invalid JSON in request body');
  }
};

export const getPathParameter = (
  pathParameters: Record<string, string> | null,
  paramName: string
): string => {
  if (!pathParameters || !pathParameters[paramName]) {
    throw Errors.validationError(`Path parameter '${paramName}' is required`);
  }
  
  return pathParameters[paramName];
};

export const getQueryParameter = <T>(
  queryStringParameters: Record<string, string> | null,
  paramName: string,
  defaultValue?: T
): string | T => {
  if (!queryStringParameters || !queryStringParameters[paramName]) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw Errors.validationError(`Query parameter '${paramName}' is required`);
  }
  
  return queryStringParameters[paramName];
};

export const parseIntParameter = (
  value: string,
  paramName: string,
  min?: number,
  max?: number
): number => {
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed)) {
    throw Errors.validationError(`Parameter '${paramName}' must be a valid integer`);
  }
  
  if (min !== undefined && parsed < min) {
    throw Errors.validationError(`Parameter '${paramName}' must be at least ${min}`);
  }
  
  if (max !== undefined && parsed > max) {
    throw Errors.validationError(`Parameter '${paramName}' must be at most ${max}`);
  }
  
  return parsed;
};
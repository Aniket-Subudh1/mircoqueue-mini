import { MicroQueueError } from './types';
import { ERROR_CODES, HTTP_STATUS } from './constants';

export class AppError extends Error implements MicroQueueError {
  code: string;
  statusCode: number;
  details?: any;

  constructor(code: string, message: string, statusCode: number, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
    
    // Capturing the stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  
  toResponse() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export const Errors = {
  // General errors
  internalError: (message = 'An internal server error occurred', details?: any) => 
    new AppError(ERROR_CODES.INTERNAL_ERROR, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, details),
  
  validationError: (message = 'Validation error', details?: any) => 
    new AppError(ERROR_CODES.VALIDATION_ERROR, message, HTTP_STATUS.BAD_REQUEST, details),
  
  resourceNotFound: (resource: string, id: string) => 
    new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, `${resource} with id '${id}' not found`, HTTP_STATUS.NOT_FOUND),
  
  // Topic errors
  topicNotFound: (topicId: string) => 
    new AppError(ERROR_CODES.TOPIC_NOT_FOUND, `Topic '${topicId}' not found`, HTTP_STATUS.NOT_FOUND),
  
  topicAlreadyExists: (name: string) => 
    new AppError(ERROR_CODES.TOPIC_ALREADY_EXISTS, `Topic with name '${name}' already exists`, HTTP_STATUS.CONFLICT),
  
  // Message errors
  messageNotFound: (messageId: string) => 
    new AppError(ERROR_CODES.MESSAGE_NOT_FOUND, `Message '${messageId}' not found`, HTTP_STATUS.NOT_FOUND),
  
  messageTooLarge: (size: number, maxSize: number) => 
    new AppError(
      ERROR_CODES.MESSAGE_TOO_LARGE, 
      `Message size (${size} bytes) exceeds maximum allowed size (${maxSize} bytes)`, 
      HTTP_STATUS.PAYLOAD_TOO_LARGE
    ),
  
  // Consumer errors
  consumerGroupNotFound: (groupId: string) => 
    new AppError(ERROR_CODES.CONSUMER_GROUP_NOT_FOUND, `Consumer group '${groupId}' not found`, HTTP_STATUS.NOT_FOUND),
  
  consumerGroupAlreadyExists: (name: string, topicId: string) => 
    new AppError(
      ERROR_CODES.CONSUMER_GROUP_ALREADY_EXISTS, 
      `Consumer group with name '${name}' already exists for topic '${topicId}'`, 
      HTTP_STATUS.CONFLICT
    ),
  
  // System errors
  rateLimitExceeded: () => 
    new AppError(ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded', HTTP_STATUS.TOO_MANY_REQUESTS),
  
  serviceUnavailable: (message = 'Service temporarily unavailable') => 
    new AppError(ERROR_CODES.SERVICE_UNAVAILABLE, message, HTTP_STATUS.SERVICE_UNAVAILABLE),
};


export const errorHandler = (err: any) => {
  console.error('Error:', err);
  
  // If it's already our AppError, return it
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      body: JSON.stringify(err.toResponse()),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
  
  // Handle specific AWS SDK errors
  if (err.code === 'ConditionalCheckFailedException') {
    const appError = Errors.resourceNotFound('Resource', 'unknown');
    return {
      statusCode: appError.statusCode,
      body: JSON.stringify(appError.toResponse()),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
  
  // Handle other known AWS errors
  if (err.code === 'ThrottlingException') {
    const appError = Errors.rateLimitExceeded();
    return {
      statusCode: appError.statusCode,
      body: JSON.stringify(appError.toResponse()),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
  
  // Default to internal server error
  const appError = Errors.internalError(err.message || 'An unexpected error occurred');
  return {
    statusCode: appError.statusCode,
    body: JSON.stringify(appError.toResponse()),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Errors } from '../common/errors';
import logger from '../common/logger';

interface ValidationRules {
  body?: {
    required?: boolean;
    schema?: any;
  };
  pathParameters?: string[];
  queryStringParameters?: {
    required?: string[];
    optional?: string[];
  };
}

export const validateRequest = (rules: ValidationRules) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult | null> => {
    try {
      if (rules.body) {
        if (rules.body.required && !event.body) {
          return {
            statusCode: 400,
            body: JSON.stringify(Errors.validationError('Request body is required').toResponse()),
            headers: { 'Content-Type': 'application/json' },
          };
        }
        
        if (event.body && rules.body.schema) {
          try {
            const body = JSON.parse(event.body);
          
          } catch (error) {
            return {
              statusCode: 400,
              body: JSON.stringify(Errors.validationError('Invalid JSON in request body').toResponse()),
              headers: { 'Content-Type': 'application/json' },
            };
          }
        }
      }
      
      if (rules.pathParameters && rules.pathParameters.length > 0) {
        for (const param of rules.pathParameters) {
          if (!event.pathParameters || !event.pathParameters[param]) {
            return {
              statusCode: 400,
              body: JSON.stringify(Errors.validationError(`Path parameter '${param}' is required`).toResponse()),
              headers: { 'Content-Type': 'application/json' },
            };
          }
        }
      }
      
      if (rules.queryStringParameters && rules.queryStringParameters.required) {
        for (const param of rules.queryStringParameters.required) {
          if (!event.queryStringParameters || !event.queryStringParameters[param]) {
            return {
              statusCode: 400,
              body: JSON.stringify(Errors.validationError(`Query parameter '${param}' is required`).toResponse()),
              headers: { 'Content-Type': 'application/json' },
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Error in validation middleware', { error });
      return {
        statusCode: 500,
        body: JSON.stringify(Errors.internalError('Validation error').toResponse()),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  };
};

export const withValidation = (handler: Function, rules: ValidationRules) => {
  return async (event: APIGatewayProxyEvent) => {
    const validationResult = await validateRequest(rules)(event);
    
    if (validationResult) {
      return validationResult;
    }
    
    return handler(event);
  };
};

export default {
  validateRequest,
  withValidation,
};
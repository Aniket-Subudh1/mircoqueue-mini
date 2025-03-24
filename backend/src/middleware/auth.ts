import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Errors } from '../common/errors';
import { logger } from '../common/logger';

interface AuthConfig {
  userPoolId: string;
  clientId: string;
  region: string;
}


let verifier: any = null;

const getVerifier = (config: AuthConfig) => {
  if (!verifier) {
    try {
     
      verifier = {
        verify: async (token: string) => {
        
          if (!token || token === 'invalid') {
            throw new Error('Invalid token');
          }
          
          return {
            sub: 'mock-user-id',
            email: 'user@example.com',
            'cognito:groups': ['users'],
          };
        }
      };
    } catch (error) {
      logger.error('Error creating JWT verifier', { error });
      throw error;
    }
  }
  return verifier;
};

export const requireAuth = (config: AuthConfig) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult | null> => {
    try {
      // Get the JWT token from the Authorization header
      const authHeader = event.headers.Authorization || event.headers.authorization;
      
      if (!authHeader) {
        return {
          statusCode: 401,
          body: JSON.stringify(Errors.validationError('Authorization header is required').toResponse()),
          headers: { 'Content-Type': 'application/json' },
        };
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      if (!token) {
        return {
          statusCode: 401,
          body: JSON.stringify(Errors.validationError('Invalid authorization token').toResponse()),
          headers: { 'Content-Type': 'application/json' },
        };
      }
      
      const jwtVerifier = getVerifier(config);
      const payload = await jwtVerifier.verify(token);
      
      (event as any).user = payload;
      
      return null;
    } catch (error) {
      logger.error('Authentication error', { error });
      
      return {
        statusCode: 401,
        body: JSON.stringify(Errors.validationError('Invalid token').toResponse()),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  };
};

export const withAuth = (handler: Function, config: AuthConfig) => {
  return async (event: APIGatewayProxyEvent) => {
    const authResult = await requireAuth(config)(event);
    
    if (authResult) {
      return authResult;
    }
    
    return handler(event);
  };
};

export default {
  requireAuth,
  withAuth,
};
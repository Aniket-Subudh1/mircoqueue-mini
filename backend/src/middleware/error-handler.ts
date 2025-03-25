import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorHandler as commonErrorHandler } from '../common/errors';
import logger from '../common/logger';

export const errorHandlerMiddleware = (handler: Function) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      return await handler(event);
    } catch (error) {
      logger.error('Unhandled error in Lambda handler', { error, path: event.path });
      return commonErrorHandler(error);
    }
  };
};

export default errorHandlerMiddleware;
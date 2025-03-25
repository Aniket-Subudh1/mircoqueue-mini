import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatApiResponse } from '../../../common/utils';
import { errorHandler } from '../../../common/errors';
import metricService from '../../../services/metric-service';
import logger from '../../../common/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.debug('Get metrics request', { event });

   
    const metrics = await metricService.getDashboardMetrics();

   
    return formatApiResponse(metrics);
  } catch (error) {
    logger.error('Error getting metrics', { error });
    return errorHandler(error);
  }
};

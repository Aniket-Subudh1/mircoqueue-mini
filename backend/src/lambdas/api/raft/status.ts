import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatApiResponse } from '../../../common/utils';
import { errorHandler } from '../../../common/errors';
import clusterService from '../../../services/cluster-service';
import logger from '../../../common/logger';
import '../../../bootstrap';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.debug('Raft status request', { event });

    // Get cluster status
    const status = clusterService.getClusterStatus();

    // Return success response
    return formatApiResponse(status);
  } catch (error) {
    logger.error('Error getting Raft status', { error });
    return errorHandler(error);
  }
};
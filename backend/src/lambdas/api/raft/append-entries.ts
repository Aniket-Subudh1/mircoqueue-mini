import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { parseRequestBody, formatApiResponse } from '../../../common/utils';
import { errorHandler } from '../../../common/errors';
import clusterService from '../../../services/cluster-service';
import logger from '../../../common/logger';
import '../../../bootstrap';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.debug('AppendEntries request', { event });

    // Parse request body
    const request = parseRequestBody(event.body);

    // Process AppendEntries request
    const response = clusterService.handleAppendEntries(request);

    // Return success response
    return formatApiResponse(response);
  } catch (error) {
    logger.error('Error processing AppendEntries', { error });
    return errorHandler(error);
  }
};
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getQueryParameter, formatApiResponse } from '../../../common/utils';
import { errorHandler } from '../../../common/errors';
import consumerService from '../../../services/consumer-service';
import logger from '../../../common/logger';


export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.debug('List consumer groups request', { event });

    // Get topic ID from query parameters
    const queryStringParameters = Object.fromEntries(
      Object.entries(event.queryStringParameters || {}).filter(([_, value]) => value !== undefined)
    ) as Record<string, string>;
    const topicId = getQueryParameter(queryStringParameters, 'topicId');

    // Get all consumer groups for the topic
    const consumerGroups = await consumerService.listConsumerGroups(topicId as string);

    // Return success response
    return formatApiResponse(consumerGroups);
  } catch (error) {
    logger.error('Error listing consumer groups', { error });
    return errorHandler(error);
  }
};
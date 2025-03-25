import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatApiResponse } from '../../../common/utils';
import { errorHandler } from '../../../common/errors';
import topicService from '../../../services/topic-service';
import logger from '../../../common/logger';


export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.debug('List topics request', { event });

    // Get all topics
    const topics = await topicService.listTopics();

    // Return success response
    return formatApiResponse(topics);
  } catch (error) {
    logger.error('Error listing topics', { error });
    return errorHandler(error);
  }
};
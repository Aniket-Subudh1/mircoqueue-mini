import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getPathParameter, formatApiResponse } from '../../../common/utils';
import { errorHandler } from '../../../common/errors';
import topicService from '../../../services/topic-service';
import logger from '../../../common/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.debug('Delete topic request', { event });

    // Get topic ID from path parameters
    const topicId = getPathParameter(event.pathParameters as Record<string, string>, 'topicId');

    // Delete the topic
    await topicService.deleteTopic(topicId);

    // Return success response
    return formatApiResponse({ message: `Topic ${topicId} deleted successfully` });
  } catch (error) {
    logger.error('Error deleting topic', { error });
    return errorHandler(error);
  }
};
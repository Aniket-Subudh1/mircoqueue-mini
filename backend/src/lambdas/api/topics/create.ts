import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateTopicRequest } from '../../../common/types';
import { parseRequestBody, formatApiResponse } from '../../../common/utils';
import { errorHandler } from '../../../common/errors';
import topicService from '../../../services/topic-service';
import logger from '../../../common/logger';


export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.debug('Create topic request', { event });

    // Parse request body
    const request = parseRequestBody<CreateTopicRequest>(event.body);

    // Create the topic
    const topic = await topicService.createTopic(request);

    // Return success response
    return formatApiResponse(topic, 201);
  } catch (error) {
    logger.error('Error creating topic', { error });
    return errorHandler(error);
  }
};
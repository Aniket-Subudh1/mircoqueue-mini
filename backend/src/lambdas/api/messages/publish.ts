import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PublishMessageRequest } from '../../../common/types';
import { parseRequestBody, getPathParameter, formatApiResponse } from '../../../common/utils';
import { errorHandler } from '../../../common/errors';
import messageService from '../../../services/message-service';
import logger from '../../../common/logger';


export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.debug('Publish message request', { event });

    // Get topic ID from path parameters
    const topicId = getPathParameter(event.pathParameters as Record<string, string>, 'topicId');

    // Parse request body
    const request = parseRequestBody<PublishMessageRequest>(event.body);

    // Publish the message
    const result = await messageService.publishMessage(topicId, request);

    // Return success response
    return formatApiResponse(result, 201);
  } catch (error) {
    logger.error('Error publishing message', { error });
    return errorHandler(error);
  }
};
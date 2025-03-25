import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConsumeMessagesRequest } from '../../../common/types';
import { 
  getPathParameter, 
  getQueryParameter, 
  parseIntParameter, 
  formatApiResponse 
} from '../../../common/utils';
import { LIMITS } from '../../../common/constants';
import { errorHandler } from '../../../common/errors';
import messageService from '../../../services/message-service';
import logger from '../../../common/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.debug('Consume messages request', { event });

    // Get topic ID from path parameters
    const topicId = getPathParameter(event.pathParameters as Record<string, string>, 'topicId');

    // Get query parameters
    const queryStringParameters = event.queryStringParameters as Record<string, string> | null;
    const consumerGroupId = getQueryParameter(queryStringParameters, 'consumerGroupId');
    
    // Parse optional parameters
    let maxMessages = LIMITS.DEFAULT_MESSAGES_PER_CONSUME;
    let waitTimeSeconds = LIMITS.DEFAULT_WAIT_TIME_SECONDS;
    
    if (event.queryStringParameters) {
      if (event.queryStringParameters.maxMessages) {
        maxMessages = parseIntParameter(
          event.queryStringParameters.maxMessages,
          'maxMessages',
          1,
          LIMITS.MAX_MESSAGES_PER_CONSUME
        );
      }
      
      if (event.queryStringParameters.waitTimeSeconds) {
        waitTimeSeconds = parseIntParameter(
          event.queryStringParameters.waitTimeSeconds,
          'waitTimeSeconds',
          0,
          LIMITS.MAX_WAIT_TIME_SECONDS
        );
      }
    }

    // Build request
    const request: ConsumeMessagesRequest = {
      consumerGroupId: consumerGroupId as string,
      maxMessages,
      waitTimeSeconds,
    };

    // Consume messages
    const result = await messageService.consumeMessages(topicId, request);

    // Return success response
    return formatApiResponse(result);
  } catch (error) {
    logger.error('Error consuming messages', { error });
    return errorHandler(error);
  }
};
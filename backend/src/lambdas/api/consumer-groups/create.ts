import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateConsumerGroupRequest } from '../../../common/types';
import { parseRequestBody, formatApiResponse } from '../../../common/utils';
import { errorHandler } from '../../../common/errors';
import consumerService from '../../../services/consumer-service';
import logger from '../../../common/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.debug('Create consumer group request', { event });

    // Parse request body
    const request = parseRequestBody<CreateConsumerGroupRequest>(event.body);

    // Create the consumer group
    const consumerGroup = await consumerService.createConsumerGroup(request);

    // Return success response
    return formatApiResponse(consumerGroup, 201);
  } catch (error) {
    logger.error('Error creating consumer group', { error });
    return errorHandler(error);
  }
};
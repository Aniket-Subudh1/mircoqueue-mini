import { get, post } from './api';
import { 
  PublishMessageRequest, 
  PublishMessageResponse, 
  ConsumeMessagesRequest,
  ConsumeMessagesResponse
} from '@/types/message';

// Publish a message to a topic
export const publishMessage = async (
  topicId: string,
  message: PublishMessageRequest
): Promise<PublishMessageResponse> => {
  return post<PublishMessageResponse>(`/topics/${topicId}/messages`, message);
};

// Consume messages from a topic
export const consumeMessages = async (
  topicId: string,
  request: ConsumeMessagesRequest
): Promise<ConsumeMessagesResponse> => {
  // Convert request to query parameters
  const params: Record<string, any> = {
    consumerGroupId: request.consumerGroupId,
  };
  
  if (request.maxMessages !== undefined) {
    params.maxMessages = request.maxMessages;
  }
  
  if (request.waitTimeSeconds !== undefined) {
    params.waitTimeSeconds = request.waitTimeSeconds;
  }
  
  return get<ConsumeMessagesResponse>(`/topics/${topicId}/messages`, params);
};
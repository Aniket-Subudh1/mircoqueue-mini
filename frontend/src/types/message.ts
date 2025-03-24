export interface Message {
    messageId: string;
    topicId: string;
    timestamp: number;
    sequenceNumber: number;
    payloadKey: string;
    contentType: string;
    size: number;
    metadata?: Record<string, string>;
    expiresAt?: number;
  }
  
  export interface MessageWithPayload {
    messageId: string;
    payload: string;
    timestamp: number;
    sequenceNumber: number;
    contentType: string;
    metadata?: Record<string, string>;
  }
  
  export interface PublishMessageRequest {
    payload: string | object;
    contentType?: string;
    metadata?: Record<string, string>;
  }
  
  export interface PublishMessageResponse {
    messageId: string;
    topicId: string;
    timestamp: number;
    sequenceNumber: number;
  }
  
  export interface ConsumeMessagesRequest {
    consumerGroupId: string;
    maxMessages?: number;
    waitTimeSeconds?: number;
  }
  
  export interface ConsumeMessagesResponse {
    messages: MessageWithPayload[];
    nextSequenceNumber: number;
  }
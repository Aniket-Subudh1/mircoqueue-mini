export interface Topic {
    topicId: string;
    name: string;
    description?: string;
    createdAt: number;
    retentionPeriodHours: number;
    messageCount: number;
    lastMessageTimestamp?: number;
  }
  
  export interface CreateTopicRequest {
    name: string;
    description?: string;
    retentionPeriodHours?: number;
  }
  
  // Message related types
  export interface Message {
    messageId: string;
    topicId: string;
    timestamp: number;
    sequenceNumber: number;
    payloadKey: string; // S3 object key
    contentType: string;
    size: number;
    metadata?: Record<string, string>;
    expiresAt?: number; // TTL for DynamoDB
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
  
  // Consumer related types
  export interface ConsumerGroup {
    groupId: string;
    topicId: string;
    name: string;
    description?: string;
    createdAt: number;
    lastConsumedTimestamp?: number;
  }
  
  export interface CreateConsumerGroupRequest {
    topicId: string;
    name: string;
    description?: string;
  }
  
  export interface ConsumerOffset {
    groupId: string;
    topicId: string;
    lastSequenceNumber: number;
    lastConsumedTimestamp: number;
  }
  
  export interface ConsumeMessagesRequest {
    consumerGroupId: string;
    maxMessages?: number;
    waitTimeSeconds?: number;
  }
  
  export interface ConsumeMessagesResponse {
    messages: {
      messageId: string;
      payload: string;
      timestamp: number;
      sequenceNumber: number;
      contentType: string;
      metadata?: Record<string, string>;
    }[];
    nextSequenceNumber: number;
  }
  
  // Metric related types
  export interface TopicMetrics {
    topicId: string;
    name: string;
    messageCount: number;
    publishRate: number; // messages per minute
    consumeRate: number; // messages per minute
    averageMessageSize: number; // bytes
    oldestMessage: number; // timestamp
    newestMessage: number; // timestamp
  }
  
  export interface SystemMetrics {
    totalTopics: number;
    totalMessages: number;
    totalConsumerGroups: number;
    averagePublishRate: number; // messages per minute
    averageConsumeRate: number; // messages per minute
    storageUsed: number; // bytes
  }
  
  // Error types
  export interface MicroQueueError extends Error {
    code: string;
    statusCode: number;
    details?: any;
  }
  
  // API Response format
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
      details?: any;
    };
  }
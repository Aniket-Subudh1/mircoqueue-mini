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
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
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
      details?: any;
    };
  }
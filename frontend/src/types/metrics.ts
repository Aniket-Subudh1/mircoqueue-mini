export interface TopicMetrics {
    topicId: string;
    name: string;
    messageCount: number;
    publishRate: number;
    consumeRate: number;
    averageMessageSize: number;
    oldestMessage: number;
    newestMessage: number;
  }
  
  export interface SystemMetrics {
    totalTopics: number;
    totalMessages: number;
    totalConsumerGroups: number;
    averagePublishRate: number;
    averageConsumeRate: number;
    storageUsed: number;
  }
  
  export interface DashboardMetrics {
    system: SystemMetrics;
    topics: TopicMetrics[];
  }
  
  export interface MetricDataPoint {
    timestamp: number;
    value: number;
  }
  
  export interface HistoricalMetrics {
    publishRates: MetricDataPoint[];
    consumeRates: MetricDataPoint[];
    messageCount: MetricDataPoint[];
    storageUsed: MetricDataPoint[];
  }
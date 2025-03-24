// frontend/src/services/mockData.ts
import { Topic, CreateTopicRequest } from '@/types/topic';
import { 
  MessageWithPayload, 
  PublishMessageRequest, 
  PublishMessageResponse,
  ConsumeMessagesResponse
} from '@/types/message';
import { ConsumerGroup } from '@/types/consumer';
import { TopicMetrics, SystemMetrics, DashboardMetrics } from '@/types/metrics';
import { generateId } from '@/utils/helpers';

// Mock topics
const mockTopics: Topic[] = [
  {
    topicId: 'topic_1',
    name: 'orders',
    description: 'Order processing events',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    retentionPeriodHours: 24,
    messageCount: 156,
    lastMessageTimestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
  },
  {
    topicId: 'topic_2',
    name: 'notifications',
    description: 'User notification events',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    retentionPeriodHours: 48,
    messageCount: 289,
    lastMessageTimestamp: Date.now() - 15 * 60 * 1000, // 15 minutes ago
  },
  {
    topicId: 'topic_3',
    name: 'logs',
    description: 'System logs',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    retentionPeriodHours: 72,
    messageCount: 523,
    lastMessageTimestamp: Date.now() - 5 * 60 * 1000, // 5 minutes ago
  }
];

// Mock consumer groups
const mockConsumerGroups: ConsumerGroup[] = [
  {
    groupId: 'consumer_1',
    topicId: 'topic_1',
    name: 'order-processor',
    description: 'Processes new orders',
    createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 days ago
    lastConsumedTimestamp: Date.now() - 45 * 60 * 1000, // 45 minutes ago
  },
  {
    groupId: 'consumer_2',
    topicId: 'topic_1',
    name: 'order-analytics',
    description: 'Analyzes order data',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    lastConsumedTimestamp: Date.now() - 60 * 60 * 1000, // 1 hour ago
  },
  {
    groupId: 'consumer_3',
    topicId: 'topic_2',
    name: 'notification-sender',
    description: 'Sends notifications to users',
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
    lastConsumedTimestamp: Date.now() - 20 * 60 * 1000, // 20 minutes ago
  }
];

// Mock messages
const mockMessages: MessageWithPayload[] = [
  {
    messageId: 'msg_1',
    payload: JSON.stringify({ orderId: '12345', status: 'COMPLETED', amount: 99.99 }),
    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    sequenceNumber: 1,
    contentType: 'application/json',
    metadata: { source: 'web', userId: 'user_123' }
  },
  {
    messageId: 'msg_2',
    payload: JSON.stringify({ orderId: '12346', status: 'PENDING', amount: 149.99 }),
    timestamp: Date.now() - 90 * 60 * 1000, // 90 minutes ago
    sequenceNumber: 2,
    contentType: 'application/json',
    metadata: { source: 'mobile', userId: 'user_456' }
  },
  {
    messageId: 'msg_3',
    payload: JSON.stringify({ orderId: '12347', status: 'PROCESSING', amount: 199.99 }),
    timestamp: Date.now() - 60 * 60 * 1000, // 60 minutes ago
    sequenceNumber: 3,
    contentType: 'application/json',
    metadata: { source: 'api', userId: 'user_789' }
  }
];

// Mock topic metrics
const mockTopicMetrics: TopicMetrics[] = mockTopics.map(topic => ({
  topicId: topic.topicId,
  name: topic.name,
  messageCount: topic.messageCount,
  publishRate: Math.random() * 10 + 1, // 1-11 messages per minute
  consumeRate: Math.random() * 8 + 1, // 1-9 messages per minute
  averageMessageSize: Math.random() * 5000 + 1000, // 1KB-6KB
  oldestMessage: topic.createdAt + 60 * 60 * 1000, // 1 hour after creation
  newestMessage: topic.lastMessageTimestamp || Date.now()
}));

// Mock system metrics
const mockSystemMetrics: SystemMetrics = {
  totalTopics: mockTopics.length,
  totalMessages: mockTopics.reduce((sum, topic) => sum + topic.messageCount, 0),
  totalConsumerGroups: mockConsumerGroups.length,
  averagePublishRate: 8.5, // messages per minute
  averageConsumeRate: 7.2, // messages per minute
  storageUsed: 12582912, // 12MB
};

// Mock dashboard metrics
const mockDashboardMetrics: DashboardMetrics = {
  system: mockSystemMetrics,
  topics: mockTopicMetrics
};

// Mock service functions

// Topics
export const getTopics = async (): Promise<Topic[]> => {
  return Promise.resolve([...mockTopics]);
};

export const getTopic = async (topicId: string): Promise<Topic> => {
  const topic = mockTopics.find(t => t.topicId === topicId);
  if (!topic) {
    return Promise.reject(new Error(`Topic with ID ${topicId} not found`));
  }
  return Promise.resolve({...topic});
};

export const createTopic = async (topicData: CreateTopicRequest): Promise<Topic> => {
  const newTopic: Topic = {
    topicId: `topic_${generateId(8)}`,
    name: topicData.name,
    description: topicData.description,
    createdAt: Date.now(),
    retentionPeriodHours: topicData.retentionPeriodHours || 24,
    messageCount: 0
  };
  
  mockTopics.push(newTopic);
  return Promise.resolve({...newTopic});
};

export const deleteTopic = async (topicId: string): Promise<void> => {
  const index = mockTopics.findIndex(t => t.topicId === topicId);
  if (index === -1) {
    return Promise.reject(new Error(`Topic with ID ${topicId} not found`));
  }
  mockTopics.splice(index, 1);
  return Promise.resolve();
};

// Messages
export const publishMessage = async (
  topicId: string,
  message: PublishMessageRequest
): Promise<PublishMessageResponse> => {
  const topic = mockTopics.find(t => t.topicId === topicId);
  if (!topic) {
    return Promise.reject(new Error(`Topic with ID ${topicId} not found`));
  }
  
  const messageId = `msg_${generateId(8)}`;
  const timestamp = Date.now();
  const sequenceNumber = topic.messageCount + 1;
  
  // Update topic
  topic.messageCount += 1;
  topic.lastMessageTimestamp = timestamp;
  
  // Add message to the mock messages
  const payload = typeof message.payload === 'string' 
    ? message.payload 
    : JSON.stringify(message.payload);
    
  mockMessages.push({
    messageId,
    payload,
    timestamp,
    sequenceNumber,
    contentType: message.contentType || 'application/json',
    metadata: message.metadata
  });
  
  return Promise.resolve({
    messageId,
    topicId,
    timestamp,
    sequenceNumber
  });
};

export const consumeMessages = async (
  topicId: string,
  request: any
): Promise<ConsumeMessagesResponse> => {
  const topic = mockTopics.find(t => t.topicId === topicId);
  if (!topic) {
    return Promise.reject(new Error(`Topic with ID ${topicId} not found`));
  }
  
  const maxMessages = request.maxMessages || 10;
  const messages = mockMessages.slice(0, maxMessages);
  
  return Promise.resolve({
    messages,
    nextSequenceNumber: messages.length > 0 
      ? messages[messages.length - 1].sequenceNumber + 1 
      : 0
  });
};

// Consumer Groups
export const getConsumerGroups = async (topicId: string): Promise<ConsumerGroup[]> => {
  return Promise.resolve(mockConsumerGroups.filter(cg => cg.topicId === topicId));
};

export const createConsumerGroup = async (groupData: any): Promise<ConsumerGroup> => {
  const newGroup: ConsumerGroup = {
    groupId: `consumer_${generateId(8)}`,
    topicId: groupData.topicId,
    name: groupData.name,
    description: groupData.description,
    createdAt: Date.now()
  };
  
  mockConsumerGroups.push(newGroup);
  return Promise.resolve({...newGroup});
};

export const deleteConsumerGroup = async (
  groupId: string,
  topicId: string
): Promise<void> => {
  const index = mockConsumerGroups.findIndex(
    cg => cg.groupId === groupId && cg.topicId === topicId
  );
  if (index === -1) {
    return Promise.reject(new Error(`Consumer group not found`));
  }
  mockConsumerGroups.splice(index, 1);
  return Promise.resolve();
};

// Metrics
export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  return Promise.resolve({...mockDashboardMetrics});
};

export const getTopicMetrics = async (topicId: string): Promise<TopicMetrics> => {
  const metrics = mockTopicMetrics.find(tm => tm.topicId === topicId);
  if (!metrics) {
    return Promise.reject(new Error(`Metrics for topic ${topicId} not found`));
  }
  return Promise.resolve({...metrics});
};
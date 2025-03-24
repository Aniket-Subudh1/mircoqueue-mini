import { Topic } from '../../common/types';
import { LIMITS } from '../../common/constants';

export const createTopic = (
  topicId: string,
  name: string,
  description?: string,
  retentionPeriodHours: number = LIMITS.DEFAULT_RETENTION_HOURS
): Topic => {
  return {
    topicId,
    name,
    description,
    createdAt: Date.now(),
    retentionPeriodHours,
    messageCount: 0,
  };
};

export const updateTopic = (
  topic: Topic,
  updates: Partial<Omit<Topic, 'topicId' | 'createdAt'>>
): Topic => {
  return {
    ...topic,
    ...updates,
  };
};

export const incrementMessageCount = (
  topic: Topic,
  timestamp: number
): Topic => {
  return {
    ...topic,
    messageCount: topic.messageCount + 1,
    lastMessageTimestamp: timestamp,
  };
};

export default {
  createTopic,
  updateTopic,
  incrementMessageCount,
};
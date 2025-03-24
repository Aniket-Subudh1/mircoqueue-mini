import { ConsumerGroup, ConsumerOffset } from '../../common/types';

export const createConsumerGroup = (
  groupId: string,
  topicId: string,
  name: string,
  description?: string
): ConsumerGroup => {
  return {
    groupId,
    topicId,
    name,
    description,
    createdAt: Date.now(),
  };
};


export const createConsumerOffset = (
  groupId: string,
  topicId: string,
  lastSequenceNumber: number = 0
): ConsumerOffset => {
  return {
    groupId,
    topicId,
    lastSequenceNumber,
    lastConsumedTimestamp: Date.now(),
  };
};


export const updateConsumerGroupTimestamp = (
  consumerGroup: ConsumerGroup,
  timestamp: number
): ConsumerGroup => {
  return {
    ...consumerGroup,
    lastConsumedTimestamp: timestamp,
  };
};


export const updateConsumerOffset = (
  offset: ConsumerOffset,
  sequenceNumber: number
): ConsumerOffset => {
  return {
    ...offset,
    lastSequenceNumber: sequenceNumber,
    lastConsumedTimestamp: Date.now(),
  };
};

export default {
  createConsumerGroup,
  createConsumerOffset,
  updateConsumerGroupTimestamp,
  updateConsumerOffset,
};
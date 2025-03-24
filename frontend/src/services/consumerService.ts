import { get, post, del, put } from './api';
import { ConsumerGroup, CreateConsumerGroupRequest } from '@/types/consumer';

export const getConsumerGroups = async (topicId: string): Promise<ConsumerGroup[]> => {
  return get<ConsumerGroup[]>('/consumer-groups', { topicId });
};

export const createConsumerGroup = async (
  groupData: CreateConsumerGroupRequest
): Promise<ConsumerGroup> => {
  return post<ConsumerGroup>('/consumer-groups', groupData);
};

export const deleteConsumerGroup = async (
  groupId: string,
  topicId: string
): Promise<void> => {
  return del<void>(`/consumer-groups/${groupId}`, { params: { topicId } });
};

export const resetConsumerGroupOffset = async (
  groupId: string,
  topicId: string
): Promise<void> => {
  return post<void>(`/consumer-groups/${groupId}/reset`, { topicId });
};
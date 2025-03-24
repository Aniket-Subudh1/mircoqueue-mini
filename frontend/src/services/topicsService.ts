// frontend/src/services/topicsService.ts
import { get, post, del } from './api';
import { Topic, CreateTopicRequest } from '@/types/topic';

// Get all topics
export const getTopics = async (): Promise<Topic[]> => {
  return get<Topic[]>('/topics');
};

// Get a single topic by ID
export const getTopic = async (topicId: string): Promise<Topic> => {
  return get<Topic>(`/topics/${topicId}`);
};

// Create a new topic
export const createTopic = async (topicData: CreateTopicRequest): Promise<Topic> => {
  return post<Topic>('/topics', topicData);
};

// Delete a topic
export const deleteTopic = async (topicId: string): Promise<void> => {
  return del<void>(`/topics/${topicId}`);
};
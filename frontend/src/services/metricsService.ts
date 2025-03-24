import { get } from './api';
import { TopicMetrics, DashboardMetrics } from '@/types/metrics';

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  return get<DashboardMetrics>('/metrics');
};

export const getTopicMetrics = async (topicId: string): Promise<TopicMetrics> => {
  return get<TopicMetrics>(`/metrics/${topicId}`);
};
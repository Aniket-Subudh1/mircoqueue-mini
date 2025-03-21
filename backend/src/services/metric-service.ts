import { 
    TopicMetrics,
    SystemMetrics,
  } from '../common/types';
  import metricRepository from '../data/repositories/metric-repository';
  import topicRepository from '../data/repositories/topic-repository';
  import logger from '../common/logger';

  export const getTopicMetrics = async (topicId: string): Promise<TopicMetrics> => {
    logger.debug('Getting topic metrics', { topicId });
    
    // Verify the topic exists
    await topicRepository.getTopic(topicId);
    
    return metricRepository.calculateTopicMetrics(topicId);
  };
  
 
  export const getAllTopicMetrics = async (): Promise<TopicMetrics[]> => {
    logger.debug('Getting all topic metrics');
    
    // Get all topics
    const topics = await topicRepository.listTopics();
    
    // Calculate metrics for each topic
    const metricsPromises = topics.map(topic => 
      metricRepository.calculateTopicMetrics(topic.topicId)
    );
    
    return Promise.all(metricsPromises);
  };
  
  export const getSystemMetrics = async (): Promise<SystemMetrics> => {
    logger.debug('Getting system metrics');
    return metricRepository.calculateSystemMetrics();
  };
  

  export const collectAndPublishMetrics = async (): Promise<void> => {
    logger.debug('Collecting and publishing metrics');
    
    try {
      // Get system metrics
      const systemMetrics = await getSystemMetrics();
      
      // Get topic metrics for a subset of topics (to avoid overloading)
      const topics = await topicRepository.listTopics();
      const topicSample = topics.slice(0, 10); // Limit to 10 topics
      
      const topicMetrics = await Promise.all(
        topicSample.map(topic => metricRepository.calculateTopicMetrics(topic.topicId))
      );
      
      // Publish metrics to CloudWatch
      await metricRepository.pushMetricsToCloudWatch(topicMetrics, systemMetrics);
      
      logger.info('Metrics published successfully');
    } catch (error) {
      logger.error('Error collecting and publishing metrics', { error });
      // Don't rethrow - this is a background job
    }
  };
  
  
  export const getDashboardMetrics = async (): Promise<{
    system: SystemMetrics;
    topics: TopicMetrics[];
  }> => {
    logger.debug('Getting dashboard metrics');
    
    // Get system metrics
    const systemMetrics = await getSystemMetrics();
    
    // Get all topics
    const topics = await topicRepository.listTopics();
    
    // For large systems, limit the number of topics to avoid overloading
    const limitedTopics = topics.slice(0, 20); // Limit to 20 topics
    
    // Calculate metrics for each topic
    const topicMetrics = await Promise.all(
      limitedTopics.map(topic => metricRepository.calculateTopicMetrics(topic.topicId))
    );
    
    // Sort by message count descending
    topicMetrics.sort((a, b) => b.messageCount - a.messageCount);
    
    return {
      system: systemMetrics,
      topics: topicMetrics,
    };
  };
  
  export default {
    getTopicMetrics,
    getAllTopicMetrics,
    getSystemMetrics,
    collectAndPublishMetrics,
    getDashboardMetrics,
  };
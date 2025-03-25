import { 
    CreateTopicRequest, 
    Topic,
  } from '../common/types';
  import { generateTopicId } from '../common/utils';
  import { LIMITS } from '../common/constants';
  import { Errors } from '../common/errors';
  import topicRepository from '../data/repositories/topic-repository';
  import logger from '../common/logger';
  import config from '../common/config';
  
 
  export const createTopic = async (request: CreateTopicRequest): Promise<Topic> => {
    logger.debug('Creating topic', { request });
  
    // Validate topic name
    if (!request.name) {
      throw Errors.validationError('Topic name is required');
    }
  
    if (request.name.length > LIMITS.MAX_TOPIC_NAME_LENGTH) {
      throw Errors.validationError(
        `Topic name cannot exceed ${LIMITS.MAX_TOPIC_NAME_LENGTH} characters`
      );
    }
  
    // Validate description if provided
    if (request.description && request.description.length > LIMITS.MAX_DESCRIPTION_LENGTH) {
      throw Errors.validationError(
        `Topic description cannot exceed ${LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  
    // Validate retention period
    let retentionPeriodHours = request.retentionPeriodHours || LIMITS.DEFAULT_RETENTION_HOURS;
    if (retentionPeriodHours < 1) {
      throw Errors.validationError('Retention period must be at least 1 hour');
    }
    if (retentionPeriodHours > LIMITS.MAX_RETENTION_HOURS) {
      throw Errors.validationError(
        `Retention period cannot exceed ${LIMITS.MAX_RETENTION_HOURS} hours`
      );
    }
  
    // Check if topic with the same name already exists
    const existingTopic = await topicRepository.getTopicByName(request.name);
    if (existingTopic) {
      throw Errors.topicAlreadyExists(request.name);
    }
  
    // Check if max topics limit is reached
    const topics = await topicRepository.listTopics();
    if (topics.length >= config.topics.maxTopicsPerAccount) {
      throw Errors.validationError(
        `Maximum number of topics (${config.topics.maxTopicsPerAccount}) reached`
      );
    }
  
    // Create the topic
    const topic: Topic = {
      topicId: generateTopicId(),
      name: request.name,
      description: request.description,
      createdAt: Date.now(),
      retentionPeriodHours,
      messageCount: 0,
    };
  
    return topicRepository.createTopic(topic);
  };
  

  export const getTopic = async (topicId: string): Promise<Topic> => {
    logger.debug('Getting topic', { topicId });
    return topicRepository.getTopic(topicId);
  };
 
  export const listTopics = async (): Promise<Topic[]> => {
    logger.debug('Listing topics');
    return topicRepository.listTopics();
  };
  
  
  export const deleteTopic = async (topicId: string): Promise<void> => {
    logger.debug('Deleting topic', { topicId });
    return topicRepository.deleteTopic(topicId);
  };
  
 
  export const updateTopic = async (
    topicId: string,
    updates: {
      name?: string;
      description?: string;
      retentionPeriodHours?: number;
    }
  ): Promise<Topic> => {
    logger.debug('Updating topic', { topicId, updates });
  
    // Validate updates
    if (updates.name && updates.name.length > LIMITS.MAX_TOPIC_NAME_LENGTH) {
      throw Errors.validationError(
        `Topic name cannot exceed ${LIMITS.MAX_TOPIC_NAME_LENGTH} characters`
      );
    }
  
    if (updates.description && updates.description.length > LIMITS.MAX_DESCRIPTION_LENGTH) {
      throw Errors.validationError(
        `Topic description cannot exceed ${LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  
    if (updates.retentionPeriodHours) {
      if (updates.retentionPeriodHours < 1) {
        throw Errors.validationError('Retention period must be at least 1 hour');
      }
      if (updates.retentionPeriodHours > LIMITS.MAX_RETENTION_HOURS) {
        throw Errors.validationError(
          `Retention period cannot exceed ${LIMITS.MAX_RETENTION_HOURS} hours`
        );
      }
    }
  
    // Check if new name conflicts with existing topic
    if (updates.name) {
      const existingTopic = await topicRepository.getTopicByName(updates.name);
      if (existingTopic && existingTopic.topicId !== topicId) {
        throw Errors.topicAlreadyExists(updates.name);
      }
    }
  
    return topicRepository.updateTopic(topicId, updates);
  };
  
  export default {
    createTopic,
    getTopic,
    listTopics,
    deleteTopic,
    updateTopic,
  };
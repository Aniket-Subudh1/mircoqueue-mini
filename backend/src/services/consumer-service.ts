import { 
    ConsumerGroup,
    CreateConsumerGroupRequest,
    ConsumerOffset,
  } from '../common/types';
  import { generateConsumerGroupId } from '../common/utils';
  import { LIMITS } from '../common/constants';
  import { Errors } from '../common/errors';
  import consumerRepository from '../data/repositories/consumer-repository';
  import topicRepository from '../data/repositories/topic-repository';
  import logger from '../common/logger';
  

  export const createConsumerGroup = async (
    request: CreateConsumerGroupRequest
  ): Promise<ConsumerGroup> => {
    logger.debug('Creating consumer group', { request });
  
    // Validate consumer group name
    if (!request.name) {
      throw Errors.validationError('Consumer group name is required');
    }
  
    if (request.name.length > LIMITS.MAX_TOPIC_NAME_LENGTH) {
      throw Errors.validationError(
        `Consumer group name cannot exceed ${LIMITS.MAX_TOPIC_NAME_LENGTH} characters`
      );
    }
  
    // Validate description if provided
    if (request.description && request.description.length > LIMITS.MAX_DESCRIPTION_LENGTH) {
      throw Errors.validationError(
        `Consumer group description cannot exceed ${LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  
    // Verify the topic exists
    await topicRepository.getTopic(request.topicId);
  
    // Check if consumer group with the same name already exists for this topic
    const existingGroup = await consumerRepository.getConsumerGroupByName(
      request.name,
      request.topicId
    );
  
    if (existingGroup) {
      throw Errors.consumerGroupAlreadyExists(request.name, request.topicId);
    }
  
    // Create the consumer group
    const consumerGroup: ConsumerGroup = {
      groupId: generateConsumerGroupId(),
      topicId: request.topicId,
      name: request.name,
      description: request.description,
      createdAt: Date.now(),
    };
  
    return consumerRepository.createConsumerGroup(consumerGroup);
  };

  export const getConsumerGroup = async (
    groupId: string,
    topicId: string
  ): Promise<ConsumerGroup> => {
    logger.debug('Getting consumer group', { groupId, topicId });
    return consumerRepository.getConsumerGroup(groupId, topicId);
  };
  

  export const listConsumerGroups = async (topicId: string): Promise<ConsumerGroup[]> => {
    logger.debug('Listing consumer groups', { topicId });
    
    // Verify the topic exists
    await topicRepository.getTopic(topicId);
    
    return consumerRepository.listConsumerGroups(topicId);
  };
  

  export const deleteConsumerGroup = async (
    groupId: string,
    topicId: string
  ): Promise<void> => {
    logger.debug('Deleting consumer group', { groupId, topicId });
    return consumerRepository.deleteConsumerGroup(groupId, topicId);
  };
  
 
  export const getConsumerOffset = async (
    groupId: string,
    topicId: string
  ): Promise<ConsumerOffset | null> => {
    logger.debug('Getting consumer offset', { groupId, topicId });
    return consumerRepository.getConsumerOffset(groupId, topicId);
  };

  export const resetConsumerGroupOffset = async (
    groupId: string,
    topicId: string
  ): Promise<void> => {
    logger.debug('Resetting consumer group offset', { groupId, topicId });
    
    // Verify the consumer group exists
    await consumerRepository.getConsumerGroup(groupId, topicId);
    
    // Reset offset to 0
    await consumerRepository.updateConsumerOffset({
      groupId,
      topicId,
      lastSequenceNumber: 0,
      lastConsumedTimestamp: Date.now(),
    });
  };
  
  export default {
    createConsumerGroup,
    getConsumerGroup,
    listConsumerGroups,
    deleteConsumerGroup,
    getConsumerOffset,
    resetConsumerGroupOffset,
  };
import { dynamoClient } from '../clients/dynamo-client';
import { TABLES } from '../../common/constants';
import { ConsumerGroup, ConsumerOffset } from '../../common/types';
import { logger } from '../../common/logger';
import { Errors } from '../../common/errors';


export const createConsumerGroup = async (consumerGroup: ConsumerGroup): Promise<ConsumerGroup> => {
  logger.debug('Creating consumer group', {
    groupId: consumerGroup.groupId,
    topicId: consumerGroup.topicId,
  });

  try {
    await dynamoClient.put({
      TableName: TABLES.CONSUMER_GROUPS,
      Item: consumerGroup,
      ConditionExpression: 'attribute_not_exists(groupId) AND attribute_not_exists(topicId)',
    }).promise();

    return consumerGroup;
  } catch (error) {
    logger.error('Error creating consumer group', { error, consumerGroup });

    if ((error as any).code === 'ConditionalCheckFailedException') {
      throw Errors.consumerGroupAlreadyExists(consumerGroup.name, consumerGroup.topicId);
    }

    throw error;
  }
};


export const getConsumerGroup = async (groupId: string, topicId: string): Promise<ConsumerGroup> => {
  logger.debug('Getting consumer group', { groupId, topicId });

  try {
    const result = await dynamoClient.get({
      TableName: TABLES.CONSUMER_GROUPS,
      Key: { groupId, topicId },
    }).promise();

    if (!result.Item) {
      throw Errors.consumerGroupNotFound(groupId);
    }

    return result.Item as ConsumerGroup;
  } catch (error) {
    logger.error('Error getting consumer group', { error, groupId, topicId });

    if ((error as any).code === 'ResourceNotFoundException') {
      throw Errors.consumerGroupNotFound(groupId);
    }

    throw error;
  }
};

/**
 * Get a consumer group by name for a specific topic
 */
export const getConsumerGroupByName = async (
  name: string,
  topicId: string
): Promise<ConsumerGroup | null> => {
  logger.debug('Getting consumer group by name', { name, topicId });

  try {
    const result = await dynamoClient.scan({
      TableName: TABLES.CONSUMER_GROUPS,
      FilterExpression: '#name = :name AND topicId = :topicId',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':topicId': topicId,
      },
      Limit: 1,
    }).promise();

    if (result.Items && result.Items.length > 0) {
      return result.Items[0] as ConsumerGroup;
    }

    return null;
  } catch (error) {
    logger.error('Error getting consumer group by name', { error, name, topicId });
    throw error;
  }
};

/**
 * List all consumer groups for a topic
 */
export const listConsumerGroups = async (topicId: string): Promise<ConsumerGroup[]> => {
  logger.debug('Listing consumer groups', { topicId });

  try {
    const result = await dynamoClient.query({
      TableName: TABLES.CONSUMER_GROUPS,
      KeyConditionExpression: 'topicId = :topicId',
      ExpressionAttributeValues: {
        ':topicId': topicId,
      },
    }).promise();

    return (result.Items || []) as ConsumerGroup[];
  } catch (error) {
    logger.error('Error listing consumer groups', { error, topicId });
    throw error;
  }
};

export const deleteConsumerGroup = async (groupId: string, topicId: string): Promise<void> => {
  logger.debug('Deleting consumer group', { groupId, topicId });

  try {
    await dynamoClient.delete({
      TableName: TABLES.CONSUMER_GROUPS,
      Key: { groupId, topicId },
      ConditionExpression: 'attribute_exists(groupId) AND attribute_exists(topicId)',
    }).promise();

    // Also delete any offsets for this consumer group
    await dynamoClient.delete({
      TableName: TABLES.OFFSETS,
      Key: { groupId, topicId },
    }).promise();
  } catch (error) {
    logger.error('Error deleting consumer group', { error, groupId, topicId });

    if ((error as any).code === 'ConditionalCheckFailedException') {
      throw Errors.consumerGroupNotFound(groupId);
    }

    throw error;
  }
};


export const updateConsumerGroupTimestamp = async (
  groupId: string,
  topicId: string,
  timestamp: number
): Promise<void> => {
  logger.debug('Updating consumer group timestamp', { groupId, topicId, timestamp });

  try {
    await dynamoClient.update({
      TableName: TABLES.CONSUMER_GROUPS,
      Key: { groupId, topicId },
      UpdateExpression: 'SET lastConsumedTimestamp = :ts',
      ExpressionAttributeValues: {
        ':ts': timestamp,
      },
      ConditionExpression: 'attribute_exists(groupId) AND attribute_exists(topicId)',
    }).promise();
  } catch (error) {
    logger.error('Error updating consumer group timestamp', { error, groupId, topicId });

    if ((error as any).code === 'ConditionalCheckFailedException') {
      throw Errors.consumerGroupNotFound(groupId);
    }

    throw error;
  }
};

export const getConsumerOffset = async (
  groupId: string,
  topicId: string
): Promise<ConsumerOffset | null> => {
  logger.debug('Getting consumer offset', { groupId, topicId });

  try {
    const result = await dynamoClient.get({
      TableName: TABLES.OFFSETS,
      Key: { groupId, topicId },
    }).promise();

    if (!result.Item) {
      return null;
    }

    return result.Item as ConsumerOffset;
  } catch (error) {
    logger.error('Error getting consumer offset', { error, groupId, topicId });
    throw error;
  }
};

export const updateConsumerOffset = async (offset: ConsumerOffset): Promise<void> => {
  logger.debug('Updating consumer offset', {
    groupId: offset.groupId,
    topicId: offset.topicId,
    sequenceNumber: offset.lastSequenceNumber,
  });

  try {
    await dynamoClient.put({
      TableName: TABLES.OFFSETS,
      Item: offset,
    }).promise();
  } catch (error) {
    logger.error('Error updating consumer offset', { error, offset });
    throw error;
  }
};

export default {
  createConsumerGroup,
  getConsumerGroup,
  getConsumerGroupByName,
  listConsumerGroups,
  deleteConsumerGroup,
  updateConsumerGroupTimestamp,
  getConsumerOffset,
  updateConsumerOffset,
};
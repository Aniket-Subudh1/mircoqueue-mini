
import { dynamoClient } from '../clients/dynamo-client';
import { TABLES } from '../../common/constants';
import { Topic } from '../../common/types';
import { logger } from '../../common/logger';
import { Errors } from '../../common/errors';


export const createTopic = async (topic: Topic): Promise<Topic> => {
  logger.debug('Creating topic', { topicId: topic.topicId });
  
  try {
    await dynamoClient.put({
      TableName: TABLES.TOPICS,
      Item: topic,
      ConditionExpression: 'attribute_not_exists(topicId)',
    }).promise();
    
    return topic;
  } catch (error) {
    logger.error('Error creating topic', { error, topic });
    
    if ((error as any).code === 'ConditionalCheckFailedException') {
      throw Errors.topicAlreadyExists(topic.name);
    }
    
    throw error;
  }
};


export const getTopic = async (topicId: string): Promise<Topic> => {
  logger.debug('Getting topic', { topicId });
  
  try {
    const result = await dynamoClient.get({
      TableName: TABLES.TOPICS,
      Key: { topicId },
    }).promise();
    
    if (!result.Item) {
      throw Errors.topicNotFound(topicId);
    }
    
    return result.Item as Topic;
  } catch (error) {
    logger.error('Error getting topic', { error, topicId });
    
    if ((error as any).code === 'ResourceNotFoundException') {
      throw Errors.topicNotFound(topicId);
    }
    
    throw error;
  }
};

export const getTopicByName = async (name: string): Promise<Topic | null> => {
  logger.debug('Getting topic by name', { name });
  
  try {
    const result = await dynamoClient.scan({
      TableName: TABLES.TOPICS,
      FilterExpression: '#name = :name',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': name,
      },
      Limit: 1,
    }).promise();
    
    if (result.Items && result.Items.length > 0) {
      return result.Items[0] as Topic;
    }
    
    return null;
  } catch (error) {
    logger.error('Error getting topic by name', { error, name });
    throw error;
  }
};


export const listTopics = async (): Promise<Topic[]> => {
  logger.debug('Listing topics');
  
  try {
    const result = await dynamoClient.scan({
      TableName: TABLES.TOPICS,
    }).promise();
    
    return (result.Items || []) as Topic[];
  } catch (error) {
    logger.error('Error listing topics', { error });
    throw error;
  }
};


export const deleteTopic = async (topicId: string): Promise<void> => {
  logger.debug('Deleting topic', { topicId });
  
  try {
    await dynamoClient.delete({
      TableName: TABLES.TOPICS,
      Key: { topicId },
      ConditionExpression: 'attribute_exists(topicId)',
    }).promise();
  } catch (error) {
    logger.error('Error deleting topic', { error, topicId });
    
    if ((error as any).code === 'ConditionalCheckFailedException') {
      throw Errors.topicNotFound(topicId);
    }
    
    throw error;
  }
};


export const incrementMessageCount = async (topicId: string, timestamp: number): Promise<void> => {
  logger.debug('Incrementing topic message count', { topicId, timestamp });
  
  try {
    await dynamoClient.update({
      TableName: TABLES.TOPICS,
      Key: { topicId },
      UpdateExpression: 'SET messageCount = messageCount + :inc, lastMessageTimestamp = :ts',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':ts': timestamp,
      },
      ConditionExpression: 'attribute_exists(topicId)',
    }).promise();
  } catch (error) {
    logger.error('Error incrementing message count', { error, topicId });
    
    if ((error as any).code === 'ConditionalCheckFailedException') {
      throw Errors.topicNotFound(topicId);
    }
    
    throw error;
  }
};


export const updateTopic = async (
  topicId: string,
  updates: Partial<Omit<Topic, 'topicId' | 'createdAt'>>
): Promise<Topic> => {
  logger.debug('Updating topic', { topicId, updates });
  
  // Build update expression
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    }
  });
  
  if (updateExpressions.length === 0) {
    return getTopic(topicId);
  }
  
  try {
    await dynamoClient.update({
      TableName: TABLES.TOPICS,
      Key: { topicId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(topicId)',
      ReturnValues: 'NONE',
    }).promise();
    
    return getTopic(topicId);
  } catch (error) {
    logger.error('Error updating topic', { error, topicId });
    
    if ((error as any).code === 'ConditionalCheckFailedException') {
      throw Errors.topicNotFound(topicId);
    }
    
    throw error;
  }
};

export default {
  createTopic,
  getTopic,
  getTopicByName,
  listTopics,
  deleteTopic,
  incrementMessageCount,
  updateTopic,
};
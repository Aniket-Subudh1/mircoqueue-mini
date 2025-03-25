import { dynamoClient } from '../clients/dynamo-client';
import { s3Client } from '../clients/s3-client';
import { TABLES, BUCKETS } from '../../common/constants';
import { Message } from '../../common/types';
import { logger } from '../../common/logger';
import { Errors } from '../../common/errors';


export const storeMessage = async (
  message: Message,
  payload: string | Buffer
): Promise<Message> => {
  logger.debug('Storing message', {
    messageId: message.messageId,
    topicId: message.topicId,
  });

  try {
    // First store the payload in S3
    await s3Client.putObject({
      Bucket: BUCKETS.MESSAGES,
      Key: message.payloadKey,
      Body: payload,
      ContentType: message.contentType,
    }).promise();

    // Then store the message metadata in DynamoDB
    await dynamoClient.put({
      TableName: TABLES.MESSAGES,
      Item: message,
    }).promise();

    return message;
  } catch (error) {
    logger.error('Error storing message', { error, message });
    throw error;
  }
};


export const getMessageById = async (messageId: string): Promise<Message> => {
  logger.debug('Getting message by ID', { messageId });

  try {
    const result = await dynamoClient.query({
      TableName: TABLES.MESSAGES,
      IndexName: 'MessageIdIndex',
      KeyConditionExpression: 'messageId = :messageId',
      ExpressionAttributeValues: {
        ':messageId': messageId,
      },
      Limit: 1,
    }).promise();

    if (!result.Items || result.Items.length === 0) {
      throw Errors.messageNotFound(messageId);
    }

    return result.Items[0] as Message;
  } catch (error) {
    logger.error('Error getting message by ID', { error, messageId });

    if ((error as any).code === 'ResourceNotFoundException') {
      throw Errors.messageNotFound(messageId);
    }

    throw error;
  }
};


export const getMessages = async (
  topicId: string,
  fromSequence: number,
  limit: number
): Promise<Message[]> => {
  logger.debug('Getting messages', {
    topicId,
    fromSequence,
    limit,
  });

  try {
    const result = await dynamoClient.query({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'topicId = :topicId AND sequenceNumber > :seq',
      ExpressionAttributeValues: {
        ':topicId': topicId,
        ':seq': fromSequence,
      },
      Limit: limit,
      ScanIndexForward: true, // Ascending order by sequence number
    }).promise();

    return (result.Items || []) as Message[];
  } catch (error) {
    logger.error('Error getting messages', { error, topicId, fromSequence });
    throw error;
  }
};

export const getMessagePayload = async (payloadKey: string): Promise<string | Buffer> => {
  logger.debug('Getting message payload', { payloadKey });

  try {
    const result = await s3Client.getObject({
      Bucket: BUCKETS.MESSAGES,
      Key: payloadKey,
    }).promise();

    return result.Body as Buffer;
  } catch (error) {
    logger.error('Error getting message payload', { error, payloadKey });

    if ((error as any).code === 'NoSuchKey') {
      throw Errors.resourceNotFound('Message payload', payloadKey);
    }

    throw error;
  }
};


export const deleteMessage = async (message: Message): Promise<void> => {
  logger.debug('Deleting message', {
    messageId: message.messageId,
    topicId: message.topicId,
  });

  try {
    // Delete from DynamoDB
    await dynamoClient.delete({
      TableName: TABLES.MESSAGES,
      Key: {
        topicId: message.topicId,
        sequenceNumber: message.sequenceNumber,
      },
    }).promise();

    // Archive the payload in S3 (copy to archive bucket)
    await s3Client.copyObject({
      Bucket: BUCKETS.ARCHIVE,
      Key: message.payloadKey,
      CopySource: `${BUCKETS.MESSAGES}/${message.payloadKey}`,
    }).promise();

    // Delete from messages bucket
    await s3Client.deleteObject({
      Bucket: BUCKETS.MESSAGES,
      Key: message.payloadKey,
    }).promise();
  } catch (error) {
    logger.error('Error deleting message', { error, message });
    throw error;
  }
};


export const getNextSequenceNumber = async (topicId: string): Promise<number> => {
  logger.debug('Getting next sequence number', { topicId });

  try {
    // Try to get the topic's current highest sequence number
    const result = await dynamoClient.query({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'topicId = :topicId',
      ExpressionAttributeValues: {
        ':topicId': topicId,
      },
      Limit: 1,
      ScanIndexForward: false, // Descending order to get the highest sequence number
    }).promise();

    // If there are no messages yet, start from 1
    if (!result.Items || result.Items.length === 0) {
      return 1;
    }

    // Otherwise, increment the highest sequence number
    const highestSequence = (result.Items[0] as Message).sequenceNumber;
    return highestSequence + 1;
  } catch (error) {
    logger.error('Error getting next sequence number', { error, topicId });
    throw error;
  }
};


export const findExpiredMessages = async (batchSize: number): Promise<Message[]> => {
  logger.debug('Finding expired messages', { batchSize });

  try {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds

    const result = await dynamoClient.scan({
      TableName: TABLES.MESSAGES,
      FilterExpression: 'expiresAt < :now',
      ExpressionAttributeValues: {
        ':now': now,
      },
      Limit: batchSize,
    }).promise();

    return (result.Items || []) as Message[];
  } catch (error) {
    logger.error('Error finding expired messages', { error });
    throw error;
  }
};

export default {
  storeMessage,
  getMessageById,
  getMessages,
  getMessagePayload,
  deleteMessage,
  getNextSequenceNumber,
  findExpiredMessages,
};
import { dynamoClient } from '../clients/dynamo-client';
import { TABLES } from '../../common/constants';
import { TopicMetrics, SystemMetrics } from '../../common/types';
import { logger } from '../../common/logger';
import { Errors } from '../../common/errors';
import AWS from 'aws-sdk';

// Initialize CloudWatch client
const cloudWatch = new AWS.CloudWatch();

export const calculateTopicMetrics = async (topicId: string): Promise<TopicMetrics> => {
  logger.debug('Calculating topic metrics', { topicId });

  try {
    // Get the topic
    const topicResult = await dynamoClient.get({
      TableName: TABLES.TOPICS,
      Key: { topicId },
    }).promise();

    if (!topicResult.Item) {
      throw Errors.topicNotFound(topicId);
    }

    const topic = topicResult.Item;

    // Get the most recent messages for rate calculation (last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    // Count messages from the last hour
    const recentMessagesResult = await dynamoClient.scan({
      TableName: TABLES.MESSAGES,
      FilterExpression: '#ts >= :ts',
      ExpressionAttributeNames: {
        '#ts': 'timestamp',
      },
      ExpressionAttributeValues: {
        ':ts': oneHourAgo,
      },
      Select: 'COUNT',
    }).promise();

    const recentMessagesCount = recentMessagesResult.Count || 0;
    const publishRate = recentMessagesCount / 60; // messages per minute

    // Get size statistics for messages (sample recent 100 messages)
    const messageSizesResult = await dynamoClient.query({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'topicId = :topicId AND sequenceNumber >= :minSeq',
      ExpressionAttributeValues: {
        ':topicId': topicId,
        ':minSeq': 0,
      },
      Limit: 100,
      ScanIndexForward: false,
      ProjectionExpression: '#size',
      ExpressionAttributeNames: {
        '#size': 'size',
      },
    }).promise();

    const messageSizes = (messageSizesResult.Items || []).map((item) => item.size || 0);
    const totalSize = messageSizes.reduce((sum, size) => sum + size, 0);
    const averageMessageSize = messageSizes.length > 0
      ? Math.round(totalSize / messageSizes.length)
      : 0;

    // Get oldest message
    const oldestMessageResult = await dynamoClient.query({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'topicId = :topicId AND sequenceNumber >= :minSeq',
      ExpressionAttributeValues: {
        ':topicId': topicId,
        ':minSeq': 0, // Broad range
      },
      Limit: 1,
      ScanIndexForward: true, // Ascending order (oldest)
      ProjectionExpression: '#ts',
      ExpressionAttributeNames: {
        '#ts': 'timestamp',
      },
    }).promise();

    // Get newest message
    const newestMessageResult = await dynamoClient.query({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'topicId = :topicId AND sequenceNumber >= :minSeq',
      ExpressionAttributeValues: {
        ':topicId': topicId,
        ':minSeq': 0, // Broad range
      },
      Limit: 1,
      ScanIndexForward: false, // Descending order (newest)
      ProjectionExpression: '#ts',
      ExpressionAttributeNames: {
        '#ts': 'timestamp',
      },
    }).promise();

    const oldestMessage = oldestMessageResult.Items && oldestMessageResult.Items.length > 0
      ? oldestMessageResult.Items[0].timestamp
      : 0;

    const newestMessage = newestMessageResult.Items && newestMessageResult.Items.length > 0
      ? newestMessageResult.Items[0].timestamp
      : 0;

    // Get consumer groups to calculate consume rate
    const consumerGroupsResult = await dynamoClient.query({
      TableName: TABLES.CONSUMER_GROUPS,
      KeyConditionExpression: 'topicId = :topicId',
      ExpressionAttributeValues: {
        ':topicId': topicId,
      },
    }).promise();

    const consumerGroups = consumerGroupsResult.Items || [];

    // Calculate average consume rate
    let totalConsumeRate = 0;
    for (const group of consumerGroups) {
      const groupId = group.groupId;

      const offsetResult = await dynamoClient.get({
        TableName: TABLES.OFFSETS,
        Key: { groupId, topicId },
      }).promise();

      if (offsetResult.Item) {
        const lastConsumedTimestamp = offsetResult.Item.lastConsumedTimestamp || 0;
        const lastSequenceNumber = offsetResult.Item.lastSequenceNumber || 0;

        if (lastConsumedTimestamp > oneHourAgo) {
          const hoursSinceStart = (lastConsumedTimestamp - topic.createdAt) / (60 * 60 * 1000);
          if (hoursSinceStart > 0) {
            totalConsumeRate += lastSequenceNumber / (hoursSinceStart * 60); // per minute
          }
        }
      }
    }

    const consumeRate = consumerGroups.length > 0
      ? totalConsumeRate / consumerGroups.length
      : 0;

    return {
      topicId,
      name: topic.name,
      messageCount: topic.messageCount || 0,
      publishRate,
      consumeRate,
      averageMessageSize,
      oldestMessage,
      newestMessage,
    };
  } catch (error) {
    logger.error('Error calculating topic metrics', { error, topicId });
    throw error;
  }
};


export const calculateSystemMetrics = async (): Promise<SystemMetrics> => {
  logger.debug('Calculating system metrics');

  try {
    const [topicsResult, messagesResult, consumerGroupsResult] = await Promise.all([
      dynamoClient.scan({
        TableName: TABLES.TOPICS,
        Select: 'COUNT',
      }).promise(),
      dynamoClient.scan({
        TableName: TABLES.MESSAGES,
        Select: 'COUNT',
      }).promise(),
      dynamoClient.scan({
        TableName: TABLES.CONSUMER_GROUPS,
        Select: 'COUNT',
      }).promise(),
    ]);

    const totalTopics = topicsResult.Count || 0;
    const totalMessages = messagesResult.Count || 0;
    const totalConsumerGroups = consumerGroupsResult.Count || 0;

    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    const recentMessagesResult = await dynamoClient.scan({
      TableName: TABLES.MESSAGES,
      FilterExpression: '#ts >= :ts',
      ExpressionAttributeNames: {
        '#ts': 'timestamp',
      },
      ExpressionAttributeValues: {
        ':ts': oneHourAgo,
      },
      Select: 'COUNT',
    }).promise();

    const recentMessagesCount = recentMessagesResult.Count || 0;
    const averagePublishRate = recentMessagesCount / 60;

    let totalConsumeCount = 0;

    const consumerSampleResult = await dynamoClient.scan({
      TableName: TABLES.OFFSETS,
      Limit: 100,
    }).promise();

    const consumerSample = consumerSampleResult.Items || [];

    for (const offset of consumerSample) {
      if (offset.lastConsumedTimestamp > oneHourAgo) {
        totalConsumeCount += offset.lastSequenceNumber || 0;
      }
    }

    const averageConsumeRate = consumerSample.length > 0
      ? (totalConsumeCount / consumerSample.length) / 60
      : 0;

    let storageUsed = 0;

    const messageSizeSampleResult = await dynamoClient.scan({
      TableName: TABLES.MESSAGES,
      Limit: 100,
      ProjectionExpression: '#size',
      ExpressionAttributeNames: {
        '#size': 'size',
      },
    }).promise();

    const messageSizes = (messageSizeSampleResult.Items || []).map((item) => item.size || 0);

    if (messageSizes.length > 0) {
      const avgSize = messageSizes.reduce((sum, size) => sum + size, 0) / messageSizes.length;
      storageUsed = avgSize * totalMessages;
    }

    return {
      totalTopics,
      totalMessages,
      totalConsumerGroups,
      averagePublishRate,
      averageConsumeRate,
      storageUsed,
    };
  } catch (error) {
    logger.error('Error calculating system metrics', { error });
    throw error;
  }
};

export const pushMetricsToCloudWatch = async (
  topicMetrics: TopicMetrics[] = [],
  systemMetrics?: SystemMetrics
): Promise<void> => {
  try {
    const timestamp = new Date();
    const metricData: AWS.CloudWatch.MetricData = [];

    for (const topic of topicMetrics) {
      metricData.push(
        {
          MetricName: 'MessageCount',
          Dimensions: [
            { Name: 'TopicId', Value: topic.topicId },
            { Name: 'TopicName', Value: topic.name },
          ],
          Value: topic.messageCount,
          Timestamp: timestamp,
          Unit: 'Count',
        },
        {
          MetricName: 'PublishRate',
          Dimensions: [
            { Name: 'TopicId', Value: topic.topicId },
            { Name: 'TopicName', Value: topic.name },
          ],
          Value: topic.publishRate,
          Timestamp: timestamp,
          Unit: 'Count/Minute',
        },
        {
          MetricName: 'ConsumeRate',
          Dimensions: [
            { Name: 'TopicId', Value: topic.topicId },
            { Name: 'TopicName', Value: topic.name },
          ],
          Value: topic.consumeRate,
          Timestamp: timestamp,
          Unit: 'Count/Minute',
        },
        {
          MetricName: 'AverageMessageSize',
          Dimensions: [
            { Name: 'TopicId', Value: topic.topicId },
            { Name: 'TopicName', Value: topic.name },
          ],
          Value: topic.averageMessageSize,
          Timestamp: timestamp,
          Unit: 'Bytes',
        }
      );
    }

    if (systemMetrics) {
      metricData.push(
        {
          MetricName: 'TotalTopics',
          Value: systemMetrics.totalTopics,
          Timestamp: timestamp,
          Unit: 'Count',
        },
        {
          MetricName: 'TotalMessages',
          Value: systemMetrics.totalMessages,
          Timestamp: timestamp,
          Unit: 'Count',
        },
        {
          MetricName: 'TotalConsumerGroups',
          Value: systemMetrics.totalConsumerGroups,
          Timestamp: timestamp,
          Unit: 'Count',
        },
        {
          MetricName: 'AveragePublishRate',
          Value: systemMetrics.averagePublishRate,
          Timestamp: timestamp,
          Unit: 'Count/Minute',
        },
        {
          MetricName: 'AverageConsumeRate',
          Value: systemMetrics.averageConsumeRate,
          Timestamp: timestamp,
          Unit: 'Count/Minute',
        },
        {
          MetricName: 'StorageUsed',
          Value: systemMetrics.storageUsed,
          Timestamp: timestamp,
          Unit: 'Bytes',
        }
      );
    }

    const batchSize = 20;
    for (let i = 0; i < metricData.length; i += batchSize) {
      const batch = metricData.slice(i, i + batchSize);

      await cloudWatch.putMetricData({
        Namespace: 'MicroQueue',
        MetricData: batch,
      }).promise();
    }
  } catch (error) {
    logger.error('Error pushing metrics to CloudWatch', { error });
    throw error;
  }
};

export default {
  calculateTopicMetrics,
  calculateSystemMetrics,
  pushMetricsToCloudWatch,
};
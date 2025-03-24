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
    
    // Just count the messages from the last hour
    const recentMessagesResult = await dynamoClient.query({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'topicId = :topicId AND sequenceNumber > :seq',
      FilterExpression: '#ts >= :ts',
      ExpressionAttributeNames: {
        '#ts': 'timestamp',
      },
      ExpressionAttributeValues: {
        ':topicId': topicId,
        ':seq': 0,
        ':ts': oneHourAgo,
      },
      Select: 'COUNT',
    }).promise();

    const recentMessagesCount = recentMessagesResult.Count || 0;
    const publishRate = recentMessagesCount / 60; // messages per minute

    // Get the size statistics for messages
    const messageSizesResult = await dynamoClient.query({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'topicId = :topicId',
      ExpressionAttributeValues: {
        ':topicId': topicId,
      },
      Limit: 100, // Just sample the most recent 100 messages
      ScanIndexForward: false, // Descending order to get the most recent
      ProjectionExpression: 'size',
    }).promise();

    const messageSizes = (messageSizesResult.Items || []).map((item) => item.size || 0);
    const totalSize = messageSizes.reduce((sum, size) => sum + size, 0);
    const averageMessageSize = messageSizes.length > 0
      ? Math.round(totalSize / messageSizes.length)
      : 0;

    // Get oldest and newest messages
    const oldestMessageResult = await dynamoClient.query({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'topicId = :topicId',
      ExpressionAttributeValues: {
        ':topicId': topicId,
      },
      Limit: 1,
      ScanIndexForward: true, // Ascending order to get the oldest
      ProjectionExpression: 'timestamp',
    }).promise();

    const newestMessageResult = await dynamoClient.query({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'topicId = :topicId',
      ExpressionAttributeValues: {
        ':topicId': topicId,
      },
      Limit: 1,
      ScanIndexForward: false, // Descending order to get the newest
      ProjectionExpression: 'timestamp',
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
    
    // Calculate average consume rate from the last hour of activity
    let totalConsumeRate = 0;
    for (const group of consumerGroups) {
      const groupId = group.groupId;
      
      // Get offset
      const offsetResult = await dynamoClient.get({
        TableName: TABLES.OFFSETS,
        Key: { groupId, topicId },
      }).promise();
      
      if (offsetResult.Item) {
        const lastConsumedTimestamp = offsetResult.Item.lastConsumedTimestamp || 0;
        const lastSequenceNumber = offsetResult.Item.lastSequenceNumber || 0;
        
        // If consumed in the last hour, estimate rate
        if (lastConsumedTimestamp > oneHourAgo) {
          // Roughly estimate consume rate based on sequence number and timestamp
          const consumedMessages = lastSequenceNumber;
          const hoursSinceStart = (lastConsumedTimestamp - topic.createdAt) / (60 * 60 * 1000);
          
          if (hoursSinceStart > 0) {
            totalConsumeRate += consumedMessages / (hoursSinceStart * 60); // per minute
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
    // Get counts from DynamoDB
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

    // Calculate average publish rate (last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    const recentMessagesResult = await dynamoClient.scan({
      TableName: TABLES.MESSAGES,
      FilterExpression: '#timestamp >= :ts',
ExpressionAttributeNames: {
  '#timestamp': 'timestamp',
},
      ExpressionAttributeValues: {
        ':ts': oneHourAgo,
      },
      Select: 'COUNT',
    }).promise();

    const recentMessagesCount = recentMessagesResult.Count || 0;
    const averagePublishRate = recentMessagesCount / 60; // messages per minute

    // Estimate average consume rate
    let totalConsumeCount = 0;
    
    // Sample a subset of consumer groups for performance
    const consumerSampleResult = await dynamoClient.scan({
      TableName: TABLES.OFFSETS,
      Limit: 100, // Sample at most 100 consumer groups
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

    // Get S3 storage metrics from CloudWatch (this would work in a real AWS environment)
    // For a hackathon, we'll estimate based on DynamoDB data
    let storageUsed = 0;
    
    // Get sample of message sizes
    const messageSizeSampleResult = await dynamoClient.scan({
      TableName: TABLES.MESSAGES,
      Limit: 100,
      ProjectionExpression: 'size',
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

    // Add topic metrics
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

    // Add system metrics
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

    // Push metrics to CloudWatch in batches of 20 (CloudWatch API limit)
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
   
  }
};

export default {
  calculateTopicMetrics,
  calculateSystemMetrics,
  pushMetricsToCloudWatch,
};
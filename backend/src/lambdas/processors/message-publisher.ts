import { SQSEvent, SQSRecord, Context } from 'aws-lambda';
import { PublishMessageRequest } from '../../common/types';
import messageService from '../../services/message-service';
import logger from '../../common/logger';

interface PublishMessageEvent {
  topicId: string;
  message: PublishMessageRequest;
}

export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
  logger.info('Processing message publishing batch', { 
    recordCount: event.Records.length 
  });

  const batchItemFailures: { itemIdentifier: string }[] = [];

  // Process each SQS message
  for (const record of event.Records) {
    try {
      await processRecord(record);
    } catch (error) {
      logger.error('Error processing record', { error, messageId: record.messageId });
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};

async function processRecord(record: SQSRecord): Promise<void> {
  logger.debug('Processing record', { messageId: record.messageId });

  try {
    // Parse the message body
    const event = JSON.parse(record.body) as PublishMessageEvent;

    // Validate the event
    if (!event.topicId || !event.message) {
      throw new Error('Invalid message format: missing topicId or message');
    }

    // Publish the message to the topic
    await messageService.publishMessage(event.topicId, event.message);

    logger.debug('Successfully published message', { 
      messageId: record.messageId,
      topicId: event.topicId 
    });
  } catch (error) {
    logger.error('Error processing message', { error, messageId: record.messageId });
    throw error; 
  }
}
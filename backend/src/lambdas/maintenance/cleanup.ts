import { ScheduledEvent, Context } from 'aws-lambda';
import messageService from '../../services/message-service';
import logger from '../../common/logger';

export const handler = async (
  event: ScheduledEvent,
  context: Context
): Promise<{ batchSize: number; deletedCount: number }> => {
  logger.info('Starting message cleanup', { event });

  try {
    // Process a batch of expired messages
    const batchSize = 100; // Process 100 messages at a time
    const deletedCount = await messageService.cleanupExpiredMessages(batchSize);

    logger.info('Message cleanup completed', { deletedCount, batchSize });

    return {
      batchSize,
      deletedCount,
    };
  } catch (error) {
    logger.error('Error during message cleanup', { error });
    throw error;
  }
};
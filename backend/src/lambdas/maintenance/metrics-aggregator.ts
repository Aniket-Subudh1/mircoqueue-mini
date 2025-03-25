import { ScheduledEvent, Context } from 'aws-lambda';
import metricService from '../../services/metric-service';
import logger from '../../common/logger';

export const handler = async (
  event: ScheduledEvent,
  context: Context
): Promise<{ success: boolean }> => {
  logger.info('Starting metrics aggregation', { event });

  try {
    await metricService.collectAndPublishMetrics();

    logger.info('Metrics aggregation completed');

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Error during metrics aggregation', { error });
    
  
    return {
      success: false,
    };
  }
};
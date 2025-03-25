import { setupCluster } from './services/cluster-service';
import logger from './common/logger';

let initialized = false;

/**
 * Initialize resources on cold start
 */
export const bootstrap = async () => {
  // Only run once
  if (initialized) {
    return;
  }
  
  try {
    logger.info('Bootstrapping application');
    
    // Set up Raft cluster if not running locally with serverless-offline
    if (!process.env.IS_LOCAL) {
      await setupCluster();
    } else {
      logger.info('Skipping Raft cluster setup in local development mode');
    }
    
    initialized = true;
    logger.info('Bootstrap complete');
  } catch (error) {
    logger.error('Bootstrap error', { error });
    throw error;
  }
};

// Run bootstrap on module load
bootstrap().catch(error => {
  logger.error('Fatal bootstrap error', { error });
  // Don't exit process in Lambda environment
  if (process.env.IS_LOCAL) {
    process.exit(1);
  }
});

export default bootstrap;
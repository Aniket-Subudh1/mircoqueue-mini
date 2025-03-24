import { s3Client } from '../data/clients/s3-client';
import { BUCKETS } from '../common/constants';
import { logger } from '../common/logger';
import { Errors } from '../common/errors';

export const storePayload = async (
  key: string,
  payload: string | Buffer,
  contentType: string
): Promise<void> => {
  logger.debug('Storing payload in S3', { key, contentType });
  
  try {
    await s3Client.putObject({
      Bucket: BUCKETS.MESSAGES,
      Key: key,
      Body: payload,
      ContentType: contentType,
    }).promise();
  } catch (error) {
    logger.error('Error storing payload in S3', { error, key });
    throw error;
  }
};


export const getPayload = async (key: string): Promise<Buffer> => {
  logger.debug('Retrieving payload from S3', { key });
  
  try {
    const result = await s3Client.getObject({
      Bucket: BUCKETS.MESSAGES,
      Key: key,
    }).promise();
    
    return result.Body as Buffer;
  } catch (error) {
    logger.error('Error retrieving payload from S3', { error, key });
    
    if ((error as any).code === 'NoSuchKey') {
      throw Errors.resourceNotFound('Payload', key);
    }
    
    throw error;
  }
};


export const archivePayload = async (key: string): Promise<void> => {
  logger.debug('Archiving payload', { key });
  
  try {
  
    await s3Client.copyObject({
      Bucket: BUCKETS.ARCHIVE,
      Key: key,
      CopySource: `${BUCKETS.MESSAGES}/${key}`,
    }).promise();
    

    await s3Client.deleteObject({
      Bucket: BUCKETS.MESSAGES,
      Key: key,
    }).promise();
    
    logger.debug('Payload archived successfully', { key });
  } catch (error) {
    logger.error('Error archiving payload', { error, key });
    throw error;
  }
};

export const getPayloadSize = async (key: string): Promise<number> => {
  logger.debug('Getting payload size from S3', { key });
  
  try {
    const result = await s3Client.headObject({
      Bucket: BUCKETS.MESSAGES,
      Key: key,
    }).promise();
    
    return result.ContentLength || 0;
  } catch (error) {
    logger.error('Error getting payload size from S3', { error, key });
    
    if ((error as any).code === 'NoSuchKey') {
      throw Errors.resourceNotFound('Payload', key);
    }
    
    throw error;
  }
};


export const listTopicPayloads = async (topicId: string): Promise<string[]> => {
  logger.debug('Listing topic payloads', { topicId });
  
  try {
    const result = await s3Client.listObjectsV2({
      Bucket: BUCKETS.MESSAGES,
      Prefix: `${topicId}/`,
    }).promise();
    
    return (result.Contents || []).map(item => item.Key || '').filter(key => key !== '');
  } catch (error) {
    logger.error('Error listing topic payloads', { error, topicId });
    throw error;
  }
};

export default {
  storePayload,
  getPayload,
  archivePayload,
  getPayloadSize,
  listTopicPayloads,
};
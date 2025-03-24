import { Message } from '../../common/types';
import { CONTENT_TYPES } from '../../common/constants';
import { calculateExpirationTimestamp } from '../../common/utils';

export const createMessage = (
  messageId: string,
  topicId: string,
  payloadKey: string,
  sequenceNumber: number,
  size: number,
  contentType: string = CONTENT_TYPES.JSON,
  metadata?: Record<string, string>,
  retentionHours: number = 24
): Message => {
  const timestamp = Date.now();
  const expiresAt = Math.floor(calculateExpirationTimestamp(timestamp, retentionHours) / 1000);
  
  return {
    messageId,
    topicId,
    timestamp,
    sequenceNumber,
    payloadKey,
    contentType,
    size,
    metadata,
    expiresAt,
  };
};


export const updateMessage = (
  message: Message,
  updates: Partial<Message>
): Message => {
  return {
    ...message,
    ...updates,
  };
};

export default {
  createMessage,
  updateMessage,
};
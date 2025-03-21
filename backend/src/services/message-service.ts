import { 
    Message,
    PublishMessageRequest,
    PublishMessageResponse,
    ConsumeMessagesRequest,
    ConsumeMessagesResponse,
  } from '../common/types';
  import { 
    generateMessageId,
    generatePayloadKey,
    validateMessageSize,
    validateMetadata,
    determineContentType,
    calculateExpirationTimestamp,
  } from '../common/utils';
  import { LIMITS, CONTENT_TYPES } from '../common/constants';
  import { Errors } from '../common/errors';
  import messageRepository from '../data/repositories/message-repository';
  import topicRepository from '../data/repositories/topic-repository';
  import consumerRepository from '../data/repositories/consumer-repository';
  import logger from '../common/logger';
  
  
  export const publishMessage = async (
    topicId: string,
    request: PublishMessageRequest
  ): Promise<PublishMessageResponse> => {
    logger.debug('Publishing message', { topicId });
  
    // Validate message payload
    if (!request.payload) {
      throw Errors.validationError('Message payload is required');
    }
  
    // Validate message size
    validateMessageSize(request.payload);
  
    // Validate metadata if provided
    validateMetadata(request.metadata);
  
    // Get the topic to ensure it exists and get retention period
    const topic = await topicRepository.getTopic(topicId);
  
    // Get the next sequence number for this topic
    const sequenceNumber = await messageRepository.getNextSequenceNumber(topicId);
  
    // Determine content type
    const contentType = determineContentType(request.payload, request.contentType);
  
    // Generate message ID and payload key
    const messageId = generateMessageId();
    const payloadKey = generatePayloadKey(topicId, messageId);
  
    // Prepare message payload for storage
    const payload = typeof request.payload === 'string'
      ? request.payload
      : JSON.stringify(request.payload);
  
    // Calculate message size
    const size = Buffer.byteLength(payload, 'utf8');
  
    // Calculate expiration timestamp for TTL
    const timestamp = Date.now();
    const expiresAt = Math.floor(
      calculateExpirationTimestamp(timestamp, topic.retentionPeriodHours) / 1000
    ); // Convert to seconds for DynamoDB TTL
  
    // Create message object
    const message: Message = {
      messageId,
      topicId,
      timestamp,
      sequenceNumber,
      payloadKey,
      contentType,
      size,
      metadata: request.metadata,
      expiresAt,
    };
  
    // Store the message
    await messageRepository.storeMessage(message, payload);
  
    // Update topic message count
    await topicRepository.incrementMessageCount(topicId, timestamp);
  
    // Return the response
    return {
      messageId,
      topicId,
      timestamp,
      sequenceNumber,
    };
  };

  export const consumeMessages = async (
    topicId: string,
    request: ConsumeMessagesRequest
  ): Promise<ConsumeMessagesResponse> => {
    logger.debug('Consuming messages', { topicId, request });
  
    // Validate request
    if (!request.consumerGroupId) {
      throw Errors.validationError('Consumer group ID is required');
    }
  
    // Validate max messages
    const maxMessages = request.maxMessages || LIMITS.DEFAULT_MESSAGES_PER_CONSUME;
    if (maxMessages < 1) {
      throw Errors.validationError('Max messages must be at least 1');
    }
    if (maxMessages > LIMITS.MAX_MESSAGES_PER_CONSUME) {
      throw Errors.validationError(
        `Max messages cannot exceed ${LIMITS.MAX_MESSAGES_PER_CONSUME}`
      );
    }
  
    // Validate wait time
    const waitTimeSeconds = request.waitTimeSeconds || LIMITS.DEFAULT_WAIT_TIME_SECONDS;
    if (waitTimeSeconds < 0) {
      throw Errors.validationError('Wait time cannot be negative');
    }
    if (waitTimeSeconds > LIMITS.MAX_WAIT_TIME_SECONDS) {
      throw Errors.validationError(
        `Wait time cannot exceed ${LIMITS.MAX_WAIT_TIME_SECONDS} seconds`
      );
    }
  
    // Verify the topic exists
    await topicRepository.getTopic(topicId);
  
    // Verify the consumer group exists
    await consumerRepository.getConsumerGroup(request.consumerGroupId, topicId);
  
    // Get the current offset for this consumer group
    let fromSequence = 0;
    const offset = await consumerRepository.getConsumerOffset(request.consumerGroupId, topicId);
  
    if (offset) {
      fromSequence = offset.lastSequenceNumber;
    }
  
    // Get messages from this sequence number
    let messages = await messageRepository.getMessages(topicId, fromSequence, maxMessages);
  
    // If no messages and wait time > 0, implement long polling
    if (messages.length === 0 && waitTimeSeconds > 0) {
      const endTime = Date.now() + waitTimeSeconds * 1000;
      
      // Poll until we get messages or timeout
      while (messages.length === 0 && Date.now() < endTime) {
        // Wait a bit before polling again
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to get messages again
        messages = await messageRepository.getMessages(topicId, fromSequence, maxMessages);
      }
    }
  
    // If still no messages, return empty response
    if (messages.length === 0) {
      return {
        messages: [],
        nextSequenceNumber: fromSequence,
      };
    }
  
    // Load the payloads for each message
    const messagesWithPayloads = await Promise.all(
      messages.map(async (message) => {
        const payload = await messageRepository.getMessagePayload(message.payloadKey);
        
        return {
          messageId: message.messageId,
          payload: payload.toString('utf8'),
          timestamp: message.timestamp,
          sequenceNumber: message.sequenceNumber,
          contentType: message.contentType,
          metadata: message.metadata,
        };
      })
    );
  
    // Update the consumer offset
    const lastMessage = messages[messages.length - 1];
    await consumerRepository.updateConsumerOffset({
      groupId: request.consumerGroupId,
      topicId,
      lastSequenceNumber: lastMessage.sequenceNumber,
      lastConsumedTimestamp: Date.now(),
    });
  
    // Update consumer group timestamp
    await consumerRepository.updateConsumerGroupTimestamp(
      request.consumerGroupId,
      topicId,
      Date.now()
    );
  
    return {
      messages: messagesWithPayloads,
      nextSequenceNumber: lastMessage.sequenceNumber + 1,
    };
  };
  
 
  export const getMessageById = async (messageId: string): Promise<{
    message: Message;
    payload: string;
  }> => {
    logger.debug('Getting message by ID', { messageId });
  
    // Get message metadata
    const message = await messageRepository.getMessageById(messageId);
  
    // Get message payload
    const payload = await messageRepository.getMessagePayload(message.payloadKey);
  
    return {
      message,
      payload: payload.toString('utf8'),
    };
  };
  

  export const cleanupExpiredMessages = async (batchSize: number): Promise<number> => {
    logger.debug('Cleaning up expired messages', { batchSize });
  
    // Find expired messages
    const expiredMessages = await messageRepository.findExpiredMessages(batchSize);
  
    // If no expired messages, return 0
    if (expiredMessages.length === 0) {
      return 0;
    }
  
    // Delete each message
    let deletedCount = 0;
    for (const message of expiredMessages) {
      try {
        await messageRepository.deleteMessage(message);
        deletedCount++;
      } catch (error) {
        logger.error('Error deleting expired message', { error, messageId: message.messageId });
      }
    }
  
    return deletedCount;
  };
  
  export default {
    publishMessage,
    consumeMessages,
    getMessageById,
    cleanupExpiredMessages,
  };
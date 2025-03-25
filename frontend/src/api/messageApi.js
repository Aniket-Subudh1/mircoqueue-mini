import api from './index';


export const publishMessage = async (topicId, messageData) => {
  try {
    const response = await api.post(`/topics/${topicId}/messages`, messageData);
    return response.data.data;
  } catch (error) {
    console.error('Error publishing message:', error);
    throw error;
  }
};


export const consumeMessages = async (topicId, consumerGroupId, maxMessages = 10, waitTimeSeconds = 0) => {
  try {
    const response = await api.get(`/topics/${topicId}/messages`, {
      params: {
        consumerGroupId,
        maxMessages,
        waitTimeSeconds
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error consuming messages:', error);
    throw error;
  }
};

export default {
  publishMessage,
  consumeMessages
};
import api from './index';


export const getConsumerGroups = async (topicId) => {
  try {
    const response = await api.get('/consumer-groups', {
      params: { topicId }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching consumer groups:', error);
    throw error;
  }
};


export const createConsumerGroup = async (consumerGroupData) => {
  try {
    const response = await api.post('/consumer-groups', consumerGroupData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating consumer group:', error);
    throw error;
  }
};

export default {
  getConsumerGroups,
  createConsumerGroup
};
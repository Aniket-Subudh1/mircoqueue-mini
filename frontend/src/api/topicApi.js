
import api from './index';


export const getTopics = async () => {
  try {
    const response = await api.get('/topics');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};


export const createTopic = async (topicData) => {
  try {
    const response = await api.post('/topics', topicData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

// Delete a topic
export const deleteTopic = async (topicId) => {
  try {
    const response = await api.delete(`/topics/${topicId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting topic:', error);
    throw error;
  }
};

export default {
  getTopics,
  createTopic,
  deleteTopic
};
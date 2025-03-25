import api from './index';


export const getMetrics = async () => {
  try {
    const response = await api.get('/metrics');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

export default {
  getMetrics
};
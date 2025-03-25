// API client setup
import axios from 'axios';

// Base configuration for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/dev';

// Create an axios instance for API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error?.message || 'An error occurred';
    console.error('API Error:', errorMessage, error);
    return Promise.reject(error);
  }
);

export default api;
// frontend/src/services/api.ts
import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types/topic';
import config from '@/utils/env';

// Create an axios instance
const apiClient = axios.create({
  baseURL: `${config.API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You could add authorization token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if the response has the expected format
    if (response.data.success !== undefined) {
      return response.data;
    }
    // If not, wrap it in our ApiResponse format
    return { success: true, data: response.data };
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorData = error.response.data as any;
      
      // Log the error in development
      if (config.IS_DEV) {
        console.error('API Error Response:', errorData);
      }
      
      if (errorData.error) {
        return Promise.reject(errorData.error);
      }
      
      return Promise.reject({
        code: `HTTP_${error.response.status}`,
        message: errorData.message || 'Server error',
        details: errorData,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
      
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Setup Error:', error.message);
      
      return Promise.reject({
        code: 'REQUEST_SETUP_ERROR',
        message: error.message || 'Request configuration error.',
      });
    }
  }
);

// Generic GET request
export const get = async <T>(
  url: string,
  params?: Record<string, any>,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.get<any, ApiResponse<T>>(url, {
    ...config,
    params,
  });
  
  if (!response.success) {
    throw response.error;
  }
  
  return response.data as T;
};

// Generic POST request
export const post = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.post<any, ApiResponse<T>>(url, data, config);
  
  if (!response.success) {
    throw response.error;
  }
  
  return response.data as T;
};

// Generic PUT request
export const put = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.put<any, ApiResponse<T>>(url, data, config);
  
  if (!response.success) {
    throw response.error;
  }
  
  return response.data as T;
};

// Generic DELETE request
export const del = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.delete<any, ApiResponse<T>>(url, config);
  
  if (!response.success) {
    throw response.error;
  }
  
  return response.data as T;
};

export default apiClient;
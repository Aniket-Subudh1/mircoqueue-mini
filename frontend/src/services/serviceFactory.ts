import * as realTopicsService from './topicsService';
import * as realMessagesService from './messagesService';
import * as realConsumerService from './consumerService';
import * as realMetricsService from './metricsService';

import * as mockTopicsService from './mockData';
import * as mockMessagesService from './mockData';
import * as mockConsumerService from './mockData';
import * as mockMetricsService from './mockData';

import config from '@/utils/env';


const getIsMockDataEnabled = (): boolean => {
  const storedValue = localStorage.getItem('useMockData');
  if (storedValue !== null) {
    return storedValue === 'true';
  }
  return config.USE_MOCK_DATA;
};


export const toggleMockData = (useMock: boolean): void => {
  localStorage.setItem('useMockData', String(useMock));
 
  window.location.reload();
};


export const isMockDataEnabled = (): boolean => {
  return getIsMockDataEnabled();
};

export const topicsService = getIsMockDataEnabled()
  ? mockTopicsService
  : realTopicsService;

export const messagesService = getIsMockDataEnabled()
  ? mockMessagesService
  : realMessagesService;

export const consumerService = getIsMockDataEnabled()
  ? mockConsumerService
  : realConsumerService;

export const metricsService = getIsMockDataEnabled()
  ? mockMetricsService
  : realMetricsService;
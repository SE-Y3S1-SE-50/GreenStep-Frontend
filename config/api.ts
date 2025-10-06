import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:8000'  // Development - using localhost for authentication
    : 'http://localhost:8000', // Production
  
  TIMEOUT: 10000, // 10 seconds
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: 'api/auth/login',
      REGISTER: 'api/auth/register',
      LOGOUT: '/logout',
      CHECK_AUTH: '/check-cookie',
    },
    DASHBOARD: {
      TREES: '/dashboard/trees',
      CARE_RECORDS: '/dashboard/care-records',
      GROWTH_MEASUREMENTS: '/dashboard/growth-measurements',
      CARE_REMINDERS: '/dashboard/care-reminders',
      STATS: '/dashboard/stats',
      ANALYTICS: {
        REPORT: '/dashboard/analytics/report',
        GROWTH_TREND: '/dashboard/analytics/growth-trend',
        COMMUNITY: '/dashboard/analytics/community',
      },
    },
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Authentication required. Please log in.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
};
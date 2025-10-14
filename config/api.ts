import { Platform } from 'react-native';

// Get the local IP address for React Native
const getBaseUrl = () => {
  if (__DEV__) {
    // For Android Emulator, use 10.0.2.2
    // For iOS Simulator, use localhost
    // For physical devices, use your computer's IP address
    if (Platform.OS === 'android') {
      return 'https://green-step-backend.vercel.app'; // Android Emulator
      // return 'http://192.168.1.X:8000'; // Replace X with your computer's IP for physical device
    }
    return 'https://green-step-backend.vercel.app'; // iOS Simulator
  }
  return 'https://green-step-backend.vercel.app'; // Production
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  
  TIMEOUT: 30000, // 10 seconds
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/logout',
      CHECK_AUTH: '/api/check-cookie',
    },
    DASHBOARD: {
      TREES: '/api/dashboard/trees',
      CARE_RECORDS: '/api/dashboard/care-records',
      GROWTH_MEASUREMENTS: '/api/dashboard/growth-measurements',
      CARE_REMINDERS: '/api/dashboard/care-reminders',
      STATS: '/api/dashboard/stats',
      ANALYTICS: {
        REPORT: '/api/dashboard/analytics/report',
        GROWTH_TREND: '/api/dashboard/analytics/growth-trend',
        COMMUNITY: '/api/dashboard/analytics/community',
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
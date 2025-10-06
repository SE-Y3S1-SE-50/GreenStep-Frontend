import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Resolve a development base URL that works across simulators/emulators and physical devices
const resolveDevBaseUrl = (): string => {
  // 1) Prefer explicit env variable if provided (Expo reads EXPO_PUBLIC_* at runtime)
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.trim().length > 0) return envUrl;

  // 2) Try to derive LAN IP from Expo hostUri when running in dev over LAN
  //    This works for Expo Go on physical devices.
  const hostUri = (Constants as any)?.expoConfig?.hostUri || (Constants as any)?.manifest2?.extra?.expoClient?.hostUri || (Constants as any)?.manifest?.debuggerHost;
  if (hostUri && typeof hostUri === 'string') {
    const host = hostUri.split(':')[0];
    if (host && /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      return `http://${host}:8000/api`;
    }
  }

  // 3) Android emulator maps host machine to 10.0.2.2, use only when not a real device
  if (Platform.OS === 'android' && (Constants as any)?.isDevice === false) {
    return 'http://10.0.2.2:8000/api';
  }

  // 4) Fallback to localhost (works on iOS simulator & web)
  return 'http://localhost:8000/api';
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? resolveDevBaseUrl()  // Development
    : 'https://your-production-api.com/api', // Production
  
  TIMEOUT: 10000, // 10 seconds
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
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

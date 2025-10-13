import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockApi } from './mockClient';
import type { LeaderboardRow } from '../types/challenge';

// Prefer explicit backend base URL to work on device/simulator too.
// You can override via EXPO_PUBLIC_API_BASE_URL env var.
const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  withCredentials: true,
});

// Token management
const TOKEN_KEY = 'auth_token';

export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

export const removeStoredToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // Only remove token for specific 401 errors, not all of them
    if (error.response?.status === 401 && error.response?.data?.message === 'Access token required') {
      console.log('Received 401 with access token required, removing stored token');
      await removeStoredToken();
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  try {
    const { data, headers } = await api.post('/auth/login', payload);
    const setCookieHeader = headers['set-cookie'];
    if (setCookieHeader) {
      const tokenCookie = setCookieHeader.find((cookie: string) =>
        cookie.startsWith('token=')
      );
      if (tokenCookie) {
        const token = tokenCookie.split('token=')[1].split(';')[0];
        console.log('Extracted token from cookie, storing...');
        await storeToken(token);
        data.token = token;
      }
    }
    return {
      ...data,
      message: data.Message || 'Login successful'
    };
  } catch (error) {
    console.log('Real API failed, using mock data:', error);
    const mockData = await mockApi.login(payload);
    await storeToken(mockData.token);
    mockApi.setAuthenticated(mockData); // Set the mock API as authenticated
    return {
      ...mockData,
      message: 'Login successful'
    };
  }
};

export const register = async (payload: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return {
      ...data,
      message: data.message || 'Registration successful'
    };
  } catch (error) {
    console.log('Real API failed, using mock data:', error);
    const mockData = await mockApi.register(payload);
    await storeToken(mockData.token);
    mockApi.setAuthenticated(mockData); // Set the mock API as authenticated
    return {
      ...mockData,
      message: 'Registration successful'
    };
  }
};

export const checkCookie = async (): Promise<any> => {
  try {
    const { data } = await api.get('/auth/check');
    return data;
  } catch (error) {
    console.log('Real API failed, using mock data:', error);
    return await mockApi.checkAuth();
  }
};

export const logout = async (): Promise<LogoutResponse> => {
  try {
    const { data } = await api.post('/auth/logout');
    await removeStoredToken();
    return data;
  } catch (error) {
    console.log('Real API failed, using mock data:', error);
    await removeStoredToken();
    mockApi.setUnauthenticated();
    return await mockApi.logout();
  }
};

// Challenge API calls
export const getChallenges = async (): Promise<Challenge[]> => {
  try {
    const { data } = await api.get('/challenges');
    return data;
  } catch (error) {
    console.log('Real API failed, using mock data:', error);
    return await mockApi.getChallenges();
  }
};

export const joinChallenge = async (challengeId: string): Promise<Challenge> => {
  try {
    const { data } = await api.post(`/challenges/${challengeId}/join`);
    return data;
  } catch (error) {
    console.log('Real API failed, using mock data:', error);
    // Get current user ID from mock API
    const currentUser = mockApi.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return await mockApi.joinChallenge(challengeId);
  }
};

export const getUserChallenges = async (): Promise<Challenge[]> => {
  // Always use mock data for now
  console.log('Using mock data for getUserChallenges');
  if (!mockApi.isAuthenticated) {
    const mockUser = {
      id: '68e3a3640d66affeef00fc14',
      role: 'user',
      user: {
        id: '68e3a3640d66affeef00fc14',
        username: 'testuser5',
        firstName: 'Test',
        lastName: 'User',
        email: 'test5@example.com'
      }
    };
    mockApi.setAuthenticated(mockUser);
  }
  return await mockApi.getUserChallenges();
};

export const getCreatedChallenges = async (): Promise<Challenge[]> => {
  // Always use mock data for now
  console.log('Using mock data for getCreatedChallenges');
  if (!mockApi.isAuthenticated) {
    const mockUser = {
      id: '68e3a3640d66affeef00fc14',
      role: 'user',
      user: {
        id: '68e3a3640d66affeef00fc14',
        username: 'testuser5',
        firstName: 'Test',
        lastName: 'User',
        email: 'test5@example.com'
      }
    };
    mockApi.setAuthenticated(mockUser);
  }
  return await mockApi.getCreatedChallenges();
};

export const createChallenge = async (challengeData: CreateChallengeRequest): Promise<Challenge> => {
  try {
    const { data } = await api.post('/challenges', challengeData);
    return data;
  } catch (error) {
    console.log('Real API failed, using mock data:', error);
    return await mockApi.createChallenge(challengeData);
  }
};

export const updateChallengeProgress = async (challengeId: string, progress: number): Promise<Challenge> => {
  try {
    const { data } = await api.put(`/challenges/${challengeId}/progress`, { progress });
    return data;
  } catch (error) {
    console.log('Real API failed, using mock data:', error);
    return await mockApi.updateChallengeProgress(challengeId, progress);
  }
};

// User API calls
export const getUserProfile = async (): Promise<UserProfile> => {
  // Always use mock data for now
  console.log('Using mock data for getUserProfile');
  if (!mockApi.isAuthenticated) {
    const mockUser = {
      id: '68e3a3640d66affeef00fc14',
      role: 'user',
      user: {
        id: '68e3a3640d66affeef00fc14',
        username: 'testuser5',
        firstName: 'Test',
        lastName: 'User',
        email: 'test5@example.com'
      }
    };
    mockApi.setAuthenticated(mockUser);
  }
  return await mockApi.getUserProfile();
};

export const getUserStats = async (): Promise<UserStats> => {
  // Always use mock data for now
  console.log('Using mock data for getUserStats');
  if (!mockApi.isAuthenticated) {
    const mockUser = {
      id: '68e3a3640d66affeef00fc14',
      role: 'user',
      user: {
        id: '68e3a3640d66affeef00fc14',
        username: 'testuser5',
        firstName: 'Test',
        lastName: 'User',
        email: 'test5@example.com'
      }
    };
    mockApi.setAuthenticated(mockUser);
  }
  return await mockApi.getUserStats();
};

export const getUserAchievements = async (): Promise<Achievement[]> => {
  // Always use mock data for now
  console.log('Using mock data for getUserAchievements');
  if (!mockApi.isAuthenticated) {
    const mockUser = {
      id: '68e3a3640d66affeef00fc14',
      role: 'user',
      user: {
        id: '68e3a3640d66affeef00fc14',
        username: 'testuser5',
        firstName: 'Test',
        lastName: 'User',
        email: 'test5@example.com'
      }
    };
    mockApi.setAuthenticated(mockUser);
  }
  return await mockApi.getUserAchievements();
};

// Leaderboard API calls
export const getLeaderboard = async (): Promise<LeaderboardRow[]> => {
  try {
    const { data } = await api.get('/leaderboard');
    return data;
  } catch (error) {
    console.log('Real API failed, using mock data for leaderboard:', error);
    return await mockApi.getLeaderboard();
  }
};

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  success: boolean;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  token?: string;
  Message?: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface RegisterResponse {
  message: string;
  success: boolean;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  token?: string;
  Message?: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  category: 'energy' | 'waste' | 'transport' | 'water' | 'food' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  duration: number;
  target: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  participants: Array<{
    user: {
      id: string;
    };
    joinedAt: string;
    progress: number;
    completed: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  category: 'energy' | 'waste' | 'transport' | 'water' | 'food' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  duration: number;
  target: number;
  unit: string;
}

export interface UserProfile {
  success: boolean;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    stats: {
      currentLevel: number;
      totalPoints: number;
      totalChallengesCompleted: number;
      totalChallengesJoined: number;
      pointsToNextLevel: number;
    };
    achievements: Array<{
      challengeTitle: string;
      pointsEarned: number;
      completedAt: string;
    }>;
    badges: Array<{
      name: string;
      icon: string;
      description: string;
      pointsRequired: number;
      category: string;
    }>;
  };
}

export interface UserStats {
  currentLevel: number;
  totalPoints: number;
  totalChallengesCompleted: number;
  totalChallengesJoined: number;
  pointsToNextLevel: number;
}

export interface Achievement {
  id: string;
  challengeTitle: string;
  pointsEarned: number;
  completedAt: string;
  challengeId: string;
}
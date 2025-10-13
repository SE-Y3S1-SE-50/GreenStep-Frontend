import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://green-step-backend.vercel.app/api';

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// Token Management
export const TOKEN_KEY = 'auth_token';

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

// Request Interceptor - Add auth token
api.interceptors.request.use(async (config) => {
  try {
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error adding token to request:', error);
  }
  return config;
});

// Response Interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeStoredToken();
    }
    return Promise.reject(error);
  }
);

// Type Definitions
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface LoginResponse {
  Message: string;
  success: boolean;
  role: string;
  id: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface RegisterResponse {
  message: string;
  success?: boolean;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  duration: number;
  target: number;
  unit: string;
  imageUrl?: string;
  participants: Array<{
    user: {
      _id: string;
      username: string;
    };
    progress: number;
  }>;
  createdAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
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
    badges: Array<{
      name: string;
      icon: string;
      description: string;
      earnedAt: string;
    }>;
    achievements: Array<{
      challengeTitle: string;
      pointsEarned: number;
      completedAt: string;
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

export interface CreateChallengeRequest {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  duration: number;
  target: number;
  unit: string;
  imageUrl?: string;
}

// API Functions
export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  try {
    const { data, headers } = await api.post('/auth/login', payload);
    
    // Store token from response body (our backend sends it there)
    if (data.token) {
      await storeToken(data.token);
    } else {
      // Fallback: Extract token from cookie if available
      const setCookieHeader = headers['set-cookie'];
      if (setCookieHeader) {
        const tokenCookie = setCookieHeader.find((cookie: string) => 
          cookie.startsWith('token=')
        );
        if (tokenCookie) {
          const token = tokenCookie.split('token=')[1].split(';')[0];
          await storeToken(token);
          data.token = token;
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (payload: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const checkCookie = async () => {
  try {
    const { data } = await api.get('/users/check-auth');
    return data;
  } catch (error) {
    console.error('Auth check error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    // Clear token first
    await removeStoredToken();
    
    // Call logout endpoint (it's at root level, not under /api)
    const baseUrl = apiBaseUrl.replace('/api', '');
    const response = await axios.post(`${baseUrl}/logout`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Logout API error:', error);
    // Token is already cleared, so we can still return success
    return { success: true, message: 'Logged out successfully' };
  }
};

export const getChallenges = async (): Promise<Challenge[]> => {
  try {
    const { data } = await api.get('/challenges');
    return data;
  } catch (error) {
    console.error('Get challenges error:', error);
    throw error;
  }
};

export const joinChallenge = async (challengeId: string): Promise<Challenge> => {
  try {
    console.log('🔵 Frontend: Attempting to join challenge:', challengeId);
    const { data } = await api.post(`/challenges/${challengeId}/join`);
    console.log('🔵 Frontend: Join response:', data);
    return data.success ? data.challenge : data;
  } catch (error: any) {
    console.error('🔴 Frontend: Join challenge error:', error);
    
    // Log more details about the error
    if (error.response) {
      console.error('🔴 Frontend: Error response status:', error.response.status);
      console.error('🔴 Frontend: Error response data:', error.response.data);
      console.error('🔴 Frontend: Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('🔴 Frontend: No response received:', error.request);
    } else {
      console.error('🔴 Frontend: Error message:', error.message);
    }
    
    throw error;
  }
};

export const createChallenge = async (challengeData: CreateChallengeRequest): Promise<Challenge> => {
  try {
    const { data } = await api.post('/challenges', challengeData);
    return data;
  } catch (error) {
    console.error('Create challenge error:', error);
    throw error;
  }
};

export const getUserChallenges = async (): Promise<Challenge[]> => {
  try {
    const { data } = await api.get('/challenges/user/my-challenges');
    return data;
  } catch (error) {
    console.error('Get user challenges error:', error);
    throw error;
  }
};

export const getCreatedChallenges = async (): Promise<Challenge[]> => {
  try {
    const { data } = await api.get('/challenges/user/created');
    return data;
  } catch (error) {
    console.error('Get created challenges error:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const { data } = await api.get('/users/profile');
    return data.success ? data : { success: true, user: data };
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const { data } = await api.get('/users/stats');
    return data;
  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
};

export const getUserAchievements = async () => {
  try {
    const { data } = await api.get('/users/achievements');
    return data;
  } catch (error) {
    console.error('Get user achievements error:', error);
    throw error;
  }
};

export const getChallenge = async (id: string): Promise<Challenge> => {
  try {
    const { data } = await api.get(`/challenges/${id}`);
    return data;
  } catch (error) {
    console.error('Get challenge error:', error);
    throw error;
  }
};

export const updateChallengeProgress = async (id: string, progress: number): Promise<Challenge> => {
  try {
    const { data } = await api.put(`/challenges/${id}/progress`, { progress });
    return data.challenge;
  } catch (error) {
    console.error('Update progress error:', error);
    throw error;
  }
};

export const getLeaderboard = async (challengeId: string) => {
  try {
    const { data } = await api.get(`/challenges/${challengeId}/leaderboard`);
    return data;
  } catch (error) {
    console.error('Get leaderboard error:', error);
    throw error;
  }
};

// Alias for compatibility
export const postProgress = updateChallengeProgress;

export default api;
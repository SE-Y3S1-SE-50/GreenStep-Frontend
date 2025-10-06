import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { API_CONFIG } from '../config/api';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    restoreSession();
  }, []);

  // Protected route logic
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!user && !inAuthGroup && !inOnboarding) {
      // User is not authenticated and not in auth or onboarding, redirect to login
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // User is authenticated but on auth page, redirect to dashboard
      router.replace('/(tabs)/dashboard');
    }
  }, [user, segments, isLoading]);

  const restoreSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login to:', `${API_CONFIG.BASE_URL}/api/auth/login`);
      console.log('🔐 With credentials:', { username });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('🔐 Response status:', response.status);
      const data = await response.json();
      console.log('🔐 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Create user object from response
      const userData: User = {
        id: data.userId || 'temp-id',
        username: username,
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        role: data.role || 'user',
      };

      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error: any) {
      console.error('🔐 Login error:', error);
      console.error('🔐 Error details:', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('📝 Attempting registration to:', `${API_CONFIG.BASE_URL}/api/auth/register`);
      console.log('📝 With data:', { ...userData, password: '***' });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('📝 Response status:', response.status);
      const resData = await response.json();
      console.log('📝 Response data:', resData);

      if (!response.ok) {
        throw new Error(resData.message || 'Registration failed');
      }

      return true;
    } catch (error: any) {
      console.error('📝 Registration error:', error);
      console.error('📝 Error details:', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
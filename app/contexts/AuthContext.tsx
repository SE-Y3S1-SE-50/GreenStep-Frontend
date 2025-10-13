import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

const API_URL = 'https://green-step-backend.vercel.app/api/auth';

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
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    restoreSession();
  }, []);

  // Protected route logic
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';

    console.log('Auth navigation check:', { 
      user: !!user, 
      inAuthGroup, 
      inOnboarding,
      inTabs,
      segments 
    });

    // Only redirect if we're authenticated and not already in tabs
    if (user && inAuthGroup) {
      console.log('User authenticated, redirecting to dashboard');
      router.replace('/(tabs)/dashboard');
    }
    // Only redirect to login if not authenticated and not in auth/onboarding
    else if (!user && !inAuthGroup && !inOnboarding && inTabs) {
      console.log('User not authenticated, redirecting to login');
      router.replace('/auth/login');
    }
  }, [user, segments, loading]);

  const restoreSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('auth_token');
      
      console.log('Restoring session:', { 
        hasUser: !!storedUser, 
        hasToken: !!storedToken 
      });
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('🔐 Attempting login to:', API_URL + '/login');
      console.log('🔐 With credentials:', { username });
      
      const response = await fetch(`${API_URL}/login`, {
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
        username: data.username || username,
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        role: data.role || 'user',
      };

      // Store user data and token
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Store token if provided (for API calls)
      if (data.token) {
        await AsyncStorage.setItem('auth_token', data.token);
      }

      setUser(userData);
      console.log('🔐 Login successful, user set');

      return true;
    } catch (error: any) {
      console.error('🔐 Login error:', error);
      console.error('🔐 Error details:', error.message);
      return false;
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      console.log('📝 Attempting registration to:', API_URL + '/register');
      console.log('📝 With data:', { ...userData, password: '***' });
      
      const response = await fetch(`${API_URL}/register`, {
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
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear stored data
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('auth_token');
      
      // Clear user state
      setUser(null);
      
      console.log('🚪 Logout successful, redirecting to login');
      
      // Redirect to login
      router.replace('/auth/login');
    } catch (error) {
      console.error('🚪 Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
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
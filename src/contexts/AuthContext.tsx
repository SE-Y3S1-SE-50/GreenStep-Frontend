import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkCookie, logout as logoutApi, getStoredToken, removeStoredToken, storeToken } from '../api/client';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    role: string;
    user?: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (userData: { id: string; role: string; user?: any }) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      
      // First check if we have a stored token
      const storedToken = await getStoredToken();
      console.log('Stored token:', storedToken ? 'Found' : 'Not found');
      
      if (!storedToken) {
        console.log('No stored token found, user not authenticated');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        return;
      }
      
      console.log('Verifying token with backend...');
      const userData = await checkCookie();
      console.log('Auth check successful:', userData);
      setAuthState({
        isAuthenticated: true,
        user: userData,
        loading: false,
      });
    } catch (error) {
      console.log('Auth check failed:', error);
      // Remove invalid token
      await removeStoredToken();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  const login = (userData: { id: string; role: string; user?: any }) => {
    console.log('Setting authenticated state for user:', userData);
    
    // Use the actual user data from the API response
    const completeUserData = {
      id: userData.id,
      role: userData.role,
      user: userData.user || {
        id: userData.id,
        username: 'user',
        firstName: 'User',
        lastName: 'Name',
        email: 'user@example.com'
      }
    };
    
    console.log('Complete user data set:', completeUserData);
    setAuthState({
      isAuthenticated: true,
      user: completeUserData,
      loading: false,
    });
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Starting logout process...');
      
      // Clear authentication state immediately - this is the most important part
      console.log('AuthContext: Clearing authentication state...');
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
      
      // Clear stored token
      console.log('AuthContext: Removing stored token...');
      await removeStoredToken();
      
      // Call logout API (but don't wait for it)
      console.log('AuthContext: Calling logout API...');
      logoutApi().catch(error => {
        console.error('AuthContext: Logout API error:', error);
      });
      
      console.log('AuthContext: Logout completed successfully');
      
      // Return a promise that resolves immediately
      return Promise.resolve();
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Even if logout API fails, we still want to clear local state
      console.log('AuthContext: Logout API failed, but local state cleared');
      return Promise.resolve();
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { startMocks, stopMocks } from '../src/mocks';
import { AuthProvider } from '../src/contexts/AuthContext';

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    // Only start mocks if explicitly enabled
    if (process.env.EXPO_PUBLIC_USE_MOCKS === 'true') {
      console.log('Starting mocks...');
      startMocks();
    } else {
      console.log('Using real backend, mocks disabled');
      stopMocks(); // Ensure mocks are completely disabled
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthenticatedStack />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthenticatedStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
      <Stack.Screen name="auth/register" options={{ title: 'Register' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="challenge/[id]" options={{ title: 'Challenge' }} />
      <Stack.Screen name="challenge/create" options={{ title: 'Create Challenge' }} />
      <Stack.Screen name="recommendations" options={{ presentation: 'modal', title: 'Recommendations' }} />
    </Stack>
  );
}



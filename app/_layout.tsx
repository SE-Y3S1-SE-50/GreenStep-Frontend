import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '../contexts/AuthContext';
import { DashboardProvider } from '../contexts/DashboardContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('onboarding_completed');
      console.log('Onboarding status:', completed);
      setHasCompletedOnboarding(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inAuth = segments[0] === 'auth';
    const inTabs = segments[0] === '(tabs)';

    console.log('Navigation check:', { 
      hasCompletedOnboarding, 
      inOnboarding, 
      inAuth, 
      inTabs,
      segments 
    });

    // If user hasn't completed onboarding and not on onboarding page
    if (!hasCompletedOnboarding && !inOnboarding) {
      console.log('Redirecting to onboarding...');
      router.replace('/onboarding');
    }
    // If user completed onboarding but is still on onboarding page
    else if (hasCompletedOnboarding && inOnboarding) {
      console.log('Redirecting to login...');
      router.replace('/auth/login');
    }
  }, [hasCompletedOnboarding, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DashboardProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Onboarding Flow */}
            <Stack.Screen name="onboarding" />

            {/* Auth Flow (Login/Register) */}
            <Stack.Screen name="auth" />

            {/* Tabs Group (contains protected tabs) */}
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="challenge/[id]" options={{ title: 'Challenge' }} />
            <Stack.Screen name="challenge/create" options={{ title: 'Create Challenge' }} />
            <Stack.Screen name="recommendations" options={{ presentation: 'modal', title: 'Recommendations' }} />
          </Stack>
        </DashboardProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});
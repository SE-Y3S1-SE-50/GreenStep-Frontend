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

function RootLayoutNav() {
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
      console.log('🔍 Onboarding check - Raw value:', completed);
      console.log('🔍 Onboarding check - Is completed:', completed === 'true');
      
      setHasCompletedOnboarding(completed === 'true');
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) {
      console.log('⏳ Still loading onboarding status...');
      return;
    }

    const inOnboarding = segments[0] === 'onboarding';
    const inAuth = segments[0] === 'auth';
    const inTabs = segments[0] === '(tabs)';

    console.log('🧭 Navigation check:', { 
      hasCompletedOnboarding, 
      inOnboarding, 
      inAuth, 
      inTabs,
      segments: segments.join('/'),
      currentPath: `/${segments.join('/')}`
    });

    // Priority 1: If user hasn't completed onboarding and not on onboarding page
    if (!hasCompletedOnboarding && !inOnboarding) {
      console.log('➡️ Redirecting to onboarding (user has not completed it)');
      router.replace('/onboarding');
      return;
    }

    // Priority 2: If user completed onboarding but is still on onboarding page
    if (hasCompletedOnboarding && inOnboarding) {
      console.log('➡️ Redirecting from onboarding to login (already completed)');
      router.replace('/auth/login');
      return;
    }

    // Priority 3: If user completed onboarding and is in tabs, let auth context handle it
    if (hasCompletedOnboarding && inTabs) {
      console.log('✅ User in tabs - let auth context handle authentication');
      return;
    }

    console.log('✅ Navigation state is correct, no redirect needed');
  }, [hasCompletedOnboarding, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Onboarding Flow */}
      <Stack.Screen name="onboarding" />

      {/* Auth Flow (Login/Register) */}
      <Stack.Screen name="auth" />

      {/* Tabs Group (contains protected tabs) */}
      <Stack.Screen name="(tabs)" />
      
      {/* Additional screens */}
      <Stack.Screen name="challenge/[id]" options={{ title: 'Challenge' }} />
      <Stack.Screen name="challenge/create" options={{ title: 'Create Challenge' }} />
      <Stack.Screen name="recommendations" options={{ presentation: 'modal', title: 'Recommendations' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DashboardProvider>
          <RootLayoutNav />
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
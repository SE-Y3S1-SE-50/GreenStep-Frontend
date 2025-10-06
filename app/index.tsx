import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete
    
    // Navigate based on authentication state
    const timer = setTimeout(() => {
      if (user) {
        console.log('User authenticated, redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('User not authenticated, redirecting to login');
        router.replace('/auth/login');
      }
    }, 100); // Small delay to ensure navigation is ready

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  // Show loading screen while checking authentication
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
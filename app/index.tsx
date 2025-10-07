import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decideInitialRoute = async () => {
      const completed = await AsyncStorage.getItem('onboarding_completed');
      if (completed === 'true') {
        router.replace('/auth/login');
      } else {
        router.replace('/onboarding');
      }
      setLoading(false);
    };
    decideInitialRoute();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return null;
}

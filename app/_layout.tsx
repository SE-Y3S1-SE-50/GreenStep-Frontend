import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { DashboardProvider } from '../contexts/DashboardContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
      </DashboardProvider>
    </AuthProvider>
  );
}

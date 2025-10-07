import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../contexts/AuthContext";
import { DashboardProvider } from "../contexts/DashboardContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, refetchOnWindowFocus: false },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DashboardProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="challenge/[id]" options={{ title: "Challenge" }} />
            <Stack.Screen name="challenge/create" options={{ title: "Create Challenge" }} />
            <Stack.Screen
              name="recommendations"
              options={{ presentation: "modal", title: "Recommendations" }}
            />
          </Stack>
        </DashboardProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

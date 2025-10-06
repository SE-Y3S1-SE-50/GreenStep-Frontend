import { Platform } from 'react-native';
import { api } from '../api/client';

export async function startMocks() {
  if (Platform.OS === 'web') {
    const { startBrowserMocks } = await import('./browser');
    await startBrowserMocks();
    return;
  }
  // Native: swap Axios adapter to in-memory adapter
  const { axiosInMemoryAdapter } = await import('./nativeAdapter');
  if (api && api.defaults) {
    // @ts-expect-error types for adapter assignment
    api.defaults.adapter = axiosInMemoryAdapter;
  }
}

export function stopMocks() {
  // Reset to default adapter for real API calls
  if (api && api.defaults) {
    // @ts-expect-error types for adapter assignment
    api.defaults.adapter = undefined;
  }
}



import { api } from '../api/client';
import { axiosInMemoryAdapter } from './nativeAdapter';

export async function startBrowserMocks() {
  if (typeof window === 'undefined') return;
  if ((window as any).__msw_started) return;
  // Use the same in-memory Axios adapter on web to avoid Service Worker setup
  if (api && api.defaults) {
    (api.defaults as any).adapter = axiosInMemoryAdapter as any;
  }
  (window as any).__msw_started = true;
}



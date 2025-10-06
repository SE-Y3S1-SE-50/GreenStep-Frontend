import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { handlers } from './handlers';
import { http } from 'msw';

type Match = ReturnType<typeof http.get>;

// Very small Axios adapter that routes /api requests to our handlers in-memory for native
export async function axiosInMemoryAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const url = config.baseURL ? `${config.baseURL}${config.url}` : config.url || '';
  if (!url || !url.startsWith('/api')) {
    throw new Error('In-memory adapter only supports /api URLs');
  }
  const method = (config.method || 'get').toUpperCase();

  // Find a handler by method+path pattern
  const match = handlers.find((h: any) => h.info?.method?.toUpperCase() === method && matchPath(h.info?.path, url));
  if (!match) {
    return {
      data: { message: 'No mock handler' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config,
    };
  }

  // Build a minimal request object to supply params/body
  const params = extractParams((match as any).info.path as string, url);
  const reqBody = config.data ? JSON.parse(config.data as any) : undefined;

  // Call the resolver
  const mswRes: any = await (match as any).resolver({
    params,
    request: {
      json: async () => reqBody,
    },
  });

  // Normalize HttpResponse
  const data = await (async () => {
    try {
      return mswRes?.body ?? mswRes?._body ?? (await mswRes?.json?.());
    } catch {
      return mswRes;
    }
  })();

  const status = mswRes?.init?.status ?? mswRes?.status ?? 200;

  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
  };
}

function matchPath(pattern: string, url: string) {
  const pathname = url.split('?')[0];
  const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
  return regex.test(pathname);
}

function extractParams(pattern: string, url: string): Record<string, string> {
  const pathname = url.split('?')[0];
  const pSeg = pattern.split('/');
  const uSeg = pathname.split('/');
  const params: Record<string, string> = {};
  pSeg.forEach((seg, i) => {
    if (seg.startsWith(':')) params[seg.slice(1)] = uSeg[i] || '';
  });
  return params;
}



import { QueryClient, QueryFunction } from '@tanstack/react-query';
import { config } from './config';

// API base URL - change this to match your backend server
const API_BASE_URL = config.apiBaseUrl;

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(options: {
  method: string;
  url: string;
  body?: unknown;
}): Promise<Response> {
  // If using mock data, return a mock response
  if (config.useMockData) {
    return new Response(JSON.stringify({ success: true, message: 'Mock response' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { method, url, body } = options;
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // If using mock data, return null to prevent API calls
    if (config.useMockData) {
      return null;
    }

    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    const res = await fetch(fullUrl, {
      credentials: 'include',
    });

    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

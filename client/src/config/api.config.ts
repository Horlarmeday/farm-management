/**
 * Shared API configuration for all components
 * Centralizes base URL, endpoints, and common settings
 */

// Environment-based API configuration
export const API_CONFIG = {
  // Base URL configuration
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5058',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      VERIFY_EMAIL: '/api/auth/verify-email',
    },
    FARMS: '/api/farms',
    LIVESTOCK: '/api/livestock',
    CROPS: '/api/crops',
    INVENTORY: '/api/inventory',
    FINANCE: '/api/finance',
    USERS: '/api/users',
    REPORTS: '/api/reports',
    DASHBOARD: '/api/dashboard',
    WEBSOCKET: '/socket.io',
  },
  
  // Request configuration
  REQUEST: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    MAX_RETRY_DELAY: 30000, // 30 seconds
  },
  
  // Cache configuration
  CACHE: {
    STATIC_CACHE: 'farm-manager-static-v1',
    DYNAMIC_CACHE: 'farm-manager-dynamic-v1',
    API_CACHE: 'farm-manager-api-v1',
    MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // Sync configuration
  SYNC: {
    BATCH_SIZE: 50,
    CONFLICT_RESOLUTION: 'server-wins' as const,
    MAX_CONFLICTS: 100,
  },
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint by key
export const getEndpoint = (key: string): string => {
  const keys = key.split('.');
  let endpoint: any = API_CONFIG.ENDPOINTS;
  
  for (const k of keys) {
    endpoint = endpoint[k];
    if (!endpoint) {
      throw new Error(`Endpoint not found: ${key}`);
    }
  }
  
  return endpoint;
};

export default API_CONFIG;

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, LoginCredentials, User } from '@/services/auth.service';
import { queryKeys } from '@/lib/queryKeys';
import { ApiError } from '@/services/api';

// Auth hook type
type AuthHook = {
  user: User | undefined;
  isLoading: boolean;
  error: any;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => void;
  logout: () => void;
  refetchUser: () => void;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  loginError: any;
  logoutError: any;
};

// Auth Context
const AuthContext = createContext<AuthHook | null>(null);

function useAuthLogic(): AuthHook {
  const queryClient = useQueryClient();

  // Get current user
  const {
    data: userResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => authService.getCurrentUser(),
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: authService.isAuthenticated(), // Only fetch if we have a token
  });

  const user = userResponse?.data;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Update user cache
        queryClient.setQueryData(queryKeys.auth.user(), {
          success: true,
          data: response.data.user,
        });
        // Invalidate all queries to refresh data
        queryClient.invalidateQueries();
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Redirect to login page could be handled by the component
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Still clear cache even if logout request failed
      queryClient.clear();
    },
  });

  return {
    // User data
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !error && authService.isAuthenticated(),
    
    // Actions
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    refetchUser: refetch,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
  };
}

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthLogic();
  
  return React.createElement(
    AuthContext.Provider,
    { value: auth },
    children
  );
}

// Main useAuth hook - can be used with or without context
export function useAuth(): AuthHook {
  const context = useContext(AuthContext);
  if (context) {
    return context;
  }
  // Fallback to direct hook if not in provider
  return useAuthLogic();
}
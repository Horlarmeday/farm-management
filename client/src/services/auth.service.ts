import { apiClient, ApiResponse } from './api';
import { TokenManager } from './api';

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
  role?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  role: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    refreshToken: string;
    accessToken: string;
  };
  refreshToken?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// Authentication service
export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    
    if (response.success && response.data) {
      // Store tokens
      TokenManager.setToken(response.data.tokens.accessToken);
      if (response.data.tokens.refreshToken) {
        TokenManager.setRefreshToken(response.data.tokens.refreshToken);
      }
    }
    
    return response;
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', userData);
    
    if (response.success && response.data) {
      // Store tokens
      TokenManager.setToken(response.data.tokens.accessToken);
      if (response.data.tokens.refreshToken) {
        TokenManager.setRefreshToken(response.data.tokens.refreshToken);
      }
    }
    
    return response;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      // Logout request failed - handled silently
    } finally {
      // Always clear local tokens
      TokenManager.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/api/auth/me');
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ token: string }>('/api/auth/refresh-token', {
      refreshToken,
    });

    if (response.success && response.data) {
      TokenManager.setToken(response.data.token);
    }

    return response;
  }

  /**
   * Change user password
   */
  static async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/change-password', data);
  }

  /**
   * Request password reset
   */
  static async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/forgot-password', data);
  }

  /**
   * Reset password with token
   */
  static async resetPassword(data: ResetPasswordData): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/reset-password', data);
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.get<void>(`/api/auth/verify-email/${token}`);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = TokenManager.getToken();
    if (!token) return false;
    
    // Check if token is expired
    return !TokenManager.isTokenExpired(token);
  }

  /**
   * Get current user from token (without API call)
   */
  static getCurrentUserFromToken(): User | null {
    const token = TokenManager.getToken();
    if (!token || TokenManager.isTokenExpired(token)) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user || null;
    } catch {
      return null;
    }
  }

  /**
   * Admin: Create new user
   */
  static async createUser(userData: RegisterData): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/api/auth/admin/create-user', userData);
  }
}

// Export for convenience
export const authService = AuthService;
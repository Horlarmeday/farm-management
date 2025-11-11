import { test as base, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { DashboardPage } from '../pages/dashboard.page';
import { TestDataGenerator, ApiUtils } from '../utils/test-helpers';

/**
 * Authentication fixture for E2E tests
 * Provides authenticated and unauthenticated test contexts
 */

interface AuthFixtures {
  authPage: AuthPage;
  dashboardPage: DashboardPage;
  authenticatedUser: {
    user: any;
    token: string;
    credentials: {
      email: string;
      password: string;
    };
  };
  adminUser: {
    user: any;
    token: string;
    credentials: {
      email: string;
      password: string;
    };
  };
}

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Auth page fixture
   */
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  /**
   * Dashboard page fixture
   */
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  /**
   * Authenticated regular user fixture
   * Creates a test user and logs them in
   */
  authenticatedUser: async ({ page, authPage }, use) => {
    // Generate test user data
    const userData = await TestDataGenerator.generateUser();
    
    try {
      // Create user via API
      const { user, token } = await ApiUtils.createTestUser(userData);
      
      // Store authentication state
      await page.context().addCookies([
        {
          name: 'auth-token',
          value: token,
          domain: 'localhost',
          path: '/'
        }
      ]);
      
      // Set localStorage auth state
      await page.addInitScript((authData) => {
        localStorage.setItem('auth-token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
      }, { user, token });
      
      const authenticatedUser = {
        user,
        token,
        credentials: {
          email: userData.email,
          password: userData.password
        }
      };
      
      await use(authenticatedUser);
      
      // Cleanup: Delete test user
      try {
        await ApiUtils.deleteTestUser(user.id, token);
      } catch (error) {
        console.warn('Failed to cleanup test user:', error);
      }
    } catch (error) {
      console.error('Failed to create authenticated user:', error);
      throw error;
    }
  },

  /**
   * Authenticated admin user fixture
   * Creates a test admin user and logs them in
   */
  adminUser: async ({ page, authPage }, use) => {
    // Generate admin user data
    const userData = {
      ...(await TestDataGenerator.generateUser()),
      role: 'admin'
    };
    
    try {
      // Create admin user via API
      const { user, token } = await ApiUtils.createTestUser(userData);
      
      // Store authentication state
      await page.context().addCookies([
        {
          name: 'auth-token',
          value: token,
          domain: 'localhost',
          path: '/'
        }
      ]);
      
      // Set localStorage auth state
      await page.addInitScript((authData) => {
        localStorage.setItem('auth-token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
      }, { user, token });
      
      const adminUser = {
        user,
        token,
        credentials: {
          email: userData.email,
          password: userData.password
        }
      };
      
      await use(adminUser);
      
      // Cleanup: Delete test admin user
      try {
        await ApiUtils.deleteTestUser(user.id, token);
      } catch (error) {
        console.warn('Failed to cleanup test admin user:', error);
      }
    } catch (error) {
      console.error('Failed to create authenticated admin user:', error);
      throw error;
    }
  }
});

/**
 * Authentication helper functions
 */
export class AuthFixtureHelpers {
  /**
   * Login user via UI
   */
  static async loginViaUI(
    authPage: AuthPage,
    credentials: { email: string; password: string }
  ): Promise<void> {
    await authPage.gotoLogin();
    await authPage.login(credentials.email, credentials.password);
    await authPage.verifyLoginSuccess();
  }

  /**
   * Logout user via UI
   */
  static async logoutViaUI(dashboardPage: DashboardPage): Promise<void> {
    await dashboardPage.logout();
  }

  /**
   * Register user via UI
   */
  static async registerViaUI(
    authPage: AuthPage,
    userData: any
  ): Promise<void> {
    await authPage.gotoRegister();
    await authPage.register(
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.password,
      userData.farmName
    );
    await authPage.verifyRegistrationSuccess();
  }

  /**
   * Verify user is authenticated
   */
  static async verifyAuthenticated(dashboardPage: DashboardPage): Promise<void> {
    await dashboardPage.gotoDashboard();
    await expect(dashboardPage.page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  /**
   * Verify user is not authenticated
   */
  static async verifyNotAuthenticated(authPage: AuthPage): Promise<void> {
    // Try to access protected route
    await authPage.page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(authPage.page).toHaveURL(/.*\/login/);
    await expect(authPage.page.locator('[data-testid="login-form"]')).toBeVisible();
  }

  /**
   * Clear authentication state
   */
  static async clearAuthState(page: any): Promise<void> {
    // Clear cookies
    await page.context().clearCookies();
    
    // Clear localStorage
    await page.evaluate(() => {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      localStorage.removeItem('refresh-token');
    });
    
    // Clear sessionStorage
    await page.evaluate(() => {
      sessionStorage.clear();
    });
  }

  /**
   * Set authentication state manually
   */
  static async setAuthState(
    page: any,
    user: any,
    token: string
  ): Promise<void> {
    // Set cookies
    await page.context().addCookies([
      {
        name: 'auth-token',
        value: token,
        domain: 'localhost',
        path: '/'
      }
    ]);
    
    // Set localStorage
    await page.addInitScript((authData) => {
      localStorage.setItem('auth-token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
    }, { user, token });
  }

  /**
   * Get current authentication state
   */
  static async getAuthState(page: any): Promise<{
    token: string | null;
    user: any | null;
  }> {
    return await page.evaluate(() => {
      const token = localStorage.getItem('auth-token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      return { token, user };
    });
  }

  /**
   * Wait for authentication state to change
   */
  static async waitForAuthStateChange(
    page: any,
    expectedState: 'authenticated' | 'unauthenticated',
    timeout: number = 5000
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const authState = await this.getAuthState(page);
      
      if (expectedState === 'authenticated' && authState.token && authState.user) {
        return;
      }
      
      if (expectedState === 'unauthenticated' && !authState.token && !authState.user) {
        return;
      }
      
      await page.waitForTimeout(100);
    }
    
    throw new Error(`Timeout waiting for auth state to change to ${expectedState}`);
  }

  /**
   * Verify user permissions
   */
  static async verifyUserPermissions(
    page: any,
    expectedPermissions: string[]
  ): Promise<void> {
    const authState = await this.getAuthState(page);
    
    if (!authState.user) {
      throw new Error('User not authenticated');
    }
    
    const userPermissions = authState.user.permissions || [];
    
    for (const permission of expectedPermissions) {
      if (!userPermissions.includes(permission)) {
        throw new Error(`User missing permission: ${permission}`);
      }
    }
  }

  /**
   * Verify user role
   */
  static async verifyUserRole(
    page: any,
    expectedRole: string
  ): Promise<void> {
    const authState = await this.getAuthState(page);
    
    if (!authState.user) {
      throw new Error('User not authenticated');
    }
    
    if (authState.user.role !== expectedRole) {
      throw new Error(`Expected role ${expectedRole}, got ${authState.user.role}`);
    }
  }

  /**
   * Create multiple test users
   */
  static async createMultipleTestUsers(count: number): Promise<Array<{
    user: any;
    token: string;
    credentials: { email: string; password: string };
  }>> {
    const users = [];
    
    for (let i = 0; i < count; i++) {
      const userData = await TestDataGenerator.generateUser();
      
      try {
        const { user, token } = await ApiUtils.createTestUser(userData);
        
        users.push({
          user,
          token,
          credentials: {
            email: userData.email,
            password: userData.password
          }
        });
      } catch (error) {
        console.error(`Failed to create test user ${i + 1}:`, error);
      }
    }
    
    return users;
  }

  /**
   * Cleanup multiple test users
   */
  static async cleanupMultipleTestUsers(
    users: Array<{ user: any; token: string }>
  ): Promise<void> {
    for (const { user, token } of users) {
      try {
        await ApiUtils.deleteTestUser(user.id, token);
      } catch (error) {
        console.warn(`Failed to cleanup test user ${user.id}:`, error);
      }
    }
  }

  /**
   * Switch user context
   */
  static async switchUserContext(
    page: any,
    newUser: { user: any; token: string }
  ): Promise<void> {
    // Clear current auth state
    await this.clearAuthState(page);
    
    // Set new auth state
    await this.setAuthState(page, newUser.user, newUser.token);
    
    // Refresh page to apply new context
    await page.reload();
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verify session persistence
   */
  static async verifySessionPersistence(
    page: any,
    user: { user: any; token: string }
  ): Promise<void> {
    // Set auth state
    await this.setAuthState(page, user.user, user.token);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify user is still authenticated
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify user is still authenticated after refresh
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  /**
   * Test token expiration handling
   */
  static async testTokenExpiration(page: any): Promise<void> {
    // Set expired token
    const expiredToken = 'expired.jwt.token';
    
    await page.context().addCookies([
      {
        name: 'auth-token',
        value: expiredToken,
        domain: 'localhost',
        path: '/'
      }
    ]);
    
    await page.addInitScript((token) => {
      localStorage.setItem('auth-token', token);
    }, expiredToken);
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should be redirected to login due to expired token
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  }
}

// Export the test function with fixtures
export { expect } from '@playwright/test';
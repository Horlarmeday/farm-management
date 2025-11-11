import { test, expect } from '../fixtures/auth.fixture';
import { AuthFixtureHelpers } from '../fixtures/auth.fixture';
import { TestDataGenerator } from '../utils/test-helpers';

/**
 * User Login E2E Tests
 * Tests the complete user login workflow
 */

test.describe('User Login', () => {
  let testUser: any;

  test.beforeAll(async () => {
    // Create a test user for login tests
    testUser = await TestDataGenerator.generateUser();
    // Note: In real implementation, this would create user in test database
  });

  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await AuthFixtureHelpers.clearAuthState(page);
  });

  test.afterEach(async ({ page }) => {
    // Clean up auth state after each test
    await AuthFixtureHelpers.clearAuthState(page);
  });

  test('should display login form correctly', async ({ authPage }) => {
    await authPage.gotoLogin();
    
    // Verify form elements are present
    await expect(authPage.page.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="login-button"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="remember-me-checkbox"]')).toBeVisible();
    
    // Verify navigation links
    await expect(authPage.page.locator('[data-testid="register-link"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="forgot-password-link"]')).toBeVisible();
    
    // Verify form validation messages are not shown initially
    await expect(authPage.page.locator('[data-testid="validation-error"]')).not.toBeVisible();
  });

  test('should login with valid credentials', async ({ authPage, dashboardPage }) => {
    await authPage.gotoLogin();
    
    // Login with test user credentials
    await authPage.login(testUser.email, testUser.password);
    
    // Verify login success
    await authPage.verifyLoginSuccess();
    
    // Verify user is redirected to dashboard
    await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
    
    // Verify user is authenticated
    await AuthFixtureHelpers.verifyAuthenticated(dashboardPage);
    
    // Verify user data is displayed correctly
    await expect(dashboardPage.page.locator('[data-testid="user-name"]')).toContainText(`${testUser.firstName} ${testUser.lastName}`);
  });

  test('should validate required fields', async ({ authPage }) => {
    await authPage.gotoLogin();
    
    // Try to submit empty form
    await authPage.page.click('[data-testid="login-button"]');
    
    // Verify validation errors are shown
    await expect(authPage.page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="password-error"]')).toBeVisible();
    
    // Verify form is not submitted
    await expect(authPage.page).toHaveURL(/.*\/login/);
  });

  test('should validate email format', async ({ authPage }) => {
    await authPage.gotoLogin();
    
    // Fill form with invalid email
    await authPage.page.fill('[data-testid="email-input"]', 'invalid-email');
    await authPage.page.fill('[data-testid="password-input"]', 'password123');
    
    await authPage.page.click('[data-testid="login-button"]');
    
    // Verify email validation error
    await expect(authPage.page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="email-error"]')).toContainText('valid email');
    
    // Verify form is not submitted
    await expect(authPage.page).toHaveURL(/.*\/login/);
  });

  test('should handle invalid credentials', async ({ authPage }) => {
    await authPage.gotoLogin();
    
    // Login with invalid credentials
    await authPage.login('invalid@example.com', 'wrongpassword');
    
    // Verify login error
    await expect(authPage.page.locator('[data-testid="login-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="login-error"]')).toContainText('Invalid credentials');
    
    // Verify user stays on login page
    await expect(authPage.page).toHaveURL(/.*\/login/);
    
    // Verify user is not authenticated
    await AuthFixtureHelpers.verifyNotAuthenticated(authPage.page);
  });

  test('should handle non-existent user', async ({ authPage }) => {
    await authPage.gotoLogin();
    
    // Login with non-existent user
    await authPage.login('nonexistent@example.com', 'password123');
    
    // Verify login error
    await expect(authPage.page.locator('[data-testid="login-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="login-error"]')).toContainText('User not found');
    
    // Verify user stays on login page
    await expect(authPage.page).toHaveURL(/.*\/login/);
  });

  test('should remember user when remember me is checked', async ({ authPage, dashboardPage, page }) => {
    await authPage.gotoLogin();
    
    // Check remember me checkbox
    await authPage.page.check('[data-testid="remember-me-checkbox"]');
    
    // Login with test user credentials
    await authPage.login(testUser.email, testUser.password);
    
    // Verify login success
    await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
    
    // Close browser and reopen (simulate browser restart)
    await page.context().close();
    const newContext = await page.context().browser()?.newContext();
    const newPage = await newContext!.newPage();
    
    // Navigate to dashboard
    await newPage.goto('/dashboard');
    
    // Verify user is still authenticated
    await expect(newPage.locator('[data-testid="user-name"]')).toBeVisible();
    
    await newContext?.close();
  });

  test('should not remember user when remember me is unchecked', async ({ authPage, dashboardPage, page }) => {
    await authPage.gotoLogin();
    
    // Ensure remember me checkbox is unchecked
    await authPage.page.uncheck('[data-testid="remember-me-checkbox"]');
    
    // Login with test user credentials
    await authPage.login(testUser.email, testUser.password);
    
    // Verify login success
    await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
    
    // Close browser and reopen (simulate browser restart)
    await page.context().close();
    const newContext = await page.context().browser()?.newContext();
    const newPage = await newContext!.newPage();
    
    // Navigate to dashboard
    await newPage.goto('/dashboard');
    
    // Verify user is redirected to login
    await expect(newPage).toHaveURL(/.*\/login/);
    
    await newContext?.close();
  });

  test('should navigate to registration page', async ({ authPage }) => {
    await authPage.gotoLogin();
    
    // Click register link
    await authPage.page.click('[data-testid="register-link"]');
    
    // Verify navigation to registration page
    await expect(authPage.page).toHaveURL(/.*\/register/);
    await expect(authPage.page.locator('[data-testid="register-form"]')).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ authPage }) => {
    await authPage.gotoLogin();
    
    // Click forgot password link
    await authPage.page.click('[data-testid="forgot-password-link"]');
    
    // Verify navigation to forgot password page
    await expect(authPage.page).toHaveURL(/.*\/forgot-password/);
    await expect(authPage.page.locator('[data-testid="forgot-password-form"]')).toBeVisible();
  });

  test('should handle server errors gracefully', async ({ authPage, page }) => {
    // Mock server error
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await authPage.gotoLogin();
    await authPage.login(testUser.email, testUser.password);
    
    // Verify error message is displayed
    await expect(authPage.page.locator('[data-testid="login-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="login-error"]')).toContainText('error');
    
    // Verify user stays on login page
    await expect(authPage.page).toHaveURL(/.*\/login/);
  });

  test('should handle network errors gracefully', async ({ authPage, page }) => {
    // Mock network error
    await page.route('**/api/auth/login', route => {
      route.abort('failed');
    });
    
    await authPage.gotoLogin();
    await authPage.login(testUser.email, testUser.password);
    
    // Verify network error message is displayed
    await expect(authPage.page.locator('[data-testid="login-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="login-error"]')).toContainText('network');
    
    // Verify user stays on login page
    await expect(authPage.page).toHaveURL(/.*\/login/);
  });

  test('should show loading state during login', async ({ authPage, page }) => {
    // Mock slow server response
    await page.route('**/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: testUser,
          token: 'mock-jwt-token'
        })
      });
    });
    
    await authPage.gotoLogin();
    
    // Fill form
    await authPage.page.fill('[data-testid="email-input"]', testUser.email);
    await authPage.page.fill('[data-testid="password-input"]', testUser.password);
    
    // Click login button
    await authPage.page.click('[data-testid="login-button"]');
    
    // Verify loading state
    await expect(authPage.page.locator('[data-testid="login-button"]')).toBeDisabled();
    await expect(authPage.page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for login to complete
    await expect(authPage.page.locator('[data-testid="loading-spinner"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('should handle account lockout after multiple failed attempts', async ({ authPage, page }) => {
    let attemptCount = 0;
    
    // Mock progressive lockout responses
    await page.route('**/api/auth/login', route => {
      attemptCount++;
      
      if (attemptCount >= 5) {
        route.fulfill({
          status: 423,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: 'Account locked due to too many failed attempts',
            lockoutTime: 900 // 15 minutes
          })
        });
      } else {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid credentials' })
        });
      }
    });
    
    await authPage.gotoLogin();
    
    // Attempt login 5 times with wrong password
    for (let i = 0; i < 5; i++) {
      await authPage.login(testUser.email, 'wrongpassword');
      
      if (i < 4) {
        await expect(authPage.page.locator('[data-testid="login-error"]')).toContainText('Invalid credentials');
      }
    }
    
    // Verify account lockout message
    await expect(authPage.page.locator('[data-testid="login-error"]')).toContainText('Account locked');
    await expect(authPage.page.locator('[data-testid="login-button"]')).toBeDisabled();
  });

  test('should support keyboard navigation', async ({ authPage }) => {
    await authPage.gotoLogin();
    
    // Test tab navigation through form fields
    await authPage.page.keyboard.press('Tab');
    await expect(authPage.page.locator('[data-testid="email-input"]')).toBeFocused();
    
    await authPage.page.keyboard.press('Tab');
    await expect(authPage.page.locator('[data-testid="password-input"]')).toBeFocused();
    
    await authPage.page.keyboard.press('Tab');
    await expect(authPage.page.locator('[data-testid="remember-me-checkbox"]')).toBeFocused();
    
    await authPage.page.keyboard.press('Tab');
    await expect(authPage.page.locator('[data-testid="login-button"]')).toBeFocused();
  });

  test('should handle form submission with Enter key', async ({ authPage, dashboardPage }) => {
    await authPage.gotoLogin();
    
    // Fill form using keyboard
    await authPage.page.fill('[data-testid="email-input"]', testUser.email);
    await authPage.page.fill('[data-testid="password-input"]', testUser.password);
    
    // Submit form with Enter key
    await authPage.page.keyboard.press('Enter');
    
    // Verify login success
    await authPage.verifyLoginSuccess();
    
    // Verify user is redirected to dashboard
    await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
  });

  test('should maintain form data on validation errors', async ({ authPage }) => {
    await authPage.gotoLogin();
    
    const email = 'invalid-email';
    const password = 'password123';
    
    // Fill form with invalid email
    await authPage.page.fill('[data-testid="email-input"]', email);
    await authPage.page.fill('[data-testid="password-input"]', password);
    
    await authPage.page.click('[data-testid="login-button"]');
    
    // Verify validation error
    await expect(authPage.page.locator('[data-testid="email-error"]')).toBeVisible();
    
    // Verify email field maintains its value
    await expect(authPage.page.locator('[data-testid="email-input"]')).toHaveValue(email);
    
    // Password field should be cleared for security
    await expect(authPage.page.locator('[data-testid="password-input"]')).toHaveValue('');
  });

  test('should handle special characters in credentials', async ({ authPage, dashboardPage }) => {
    const specialUser = {
      email: 'test+special@example.com',
      password: 'P@ssw0rd!#$%'
    };
    
    await authPage.gotoLogin();
    
    // Login with special characters
    await authPage.login(specialUser.email, specialUser.password);
    
    // Verify login success (assuming user exists)
    await authPage.verifyLoginSuccess();
    
    // Verify user is redirected to dashboard
    await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
  });

  test('should redirect to intended page after login', async ({ authPage, page }) => {
    // Try to access protected page without authentication
    await page.goto('/livestock');
    
    // Should be redirected to login with return URL
    await expect(page).toHaveURL(/.*\/login\?returnUrl=.*livestock/);
    
    // Login
    await authPage.login(testUser.email, testUser.password);
    
    // Should be redirected to originally intended page
    await expect(page).toHaveURL(/.*\/livestock/);
  });

  test('should handle concurrent login sessions', async ({ authPage, dashboardPage, context }) => {
    // Login in first tab
    await authPage.gotoLogin();
    await authPage.login(testUser.email, testUser.password);
    await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
    
    // Open second tab and login with same user
    const secondPage = await context.newPage();
    const secondAuthPage = new (authPage.constructor as any)(secondPage);
    
    await secondAuthPage.gotoLogin();
    await secondAuthPage.login(testUser.email, testUser.password);
    
    // Both sessions should be valid
    await expect(secondPage).toHaveURL(/.*\/dashboard/);
    await expect(dashboardPage.page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(secondPage.locator('[data-testid="user-name"]')).toBeVisible();
    
    await secondPage.close();
  });

  test('should handle session timeout', async ({ authPage, dashboardPage, page }) => {
    // Mock expired token response
    await page.route('**/api/**', route => {
      if (route.request().headers()['authorization']) {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Token expired' })
        });
      } else {
        route.continue();
      }
    });
    
    await authPage.gotoLogin();
    await authPage.login(testUser.email, testUser.password);
    
    // Navigate to dashboard
    await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
    
    // Try to make an authenticated request (e.g., load livestock data)
    await dashboardPage.page.click('[data-testid="livestock-nav"]');
    
    // Should be redirected to login due to expired token
    await expect(dashboardPage.page).toHaveURL(/.*\/login/);
    await expect(dashboardPage.page.locator('[data-testid="session-expired-message"]')).toBeVisible();
  });

  test('should clear sensitive data on logout', async ({ authPage, dashboardPage }) => {
    await authPage.gotoLogin();
    await authPage.login(testUser.email, testUser.password);
    
    // Verify login success
    await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
    
    // Logout
    await dashboardPage.page.click('[data-testid="user-menu"]');
    await dashboardPage.page.click('[data-testid="logout-button"]');
    
    // Verify redirect to login
    await expect(dashboardPage.page).toHaveURL(/.*\/login/);
    
    // Verify auth state is cleared
    await AuthFixtureHelpers.verifyNotAuthenticated(dashboardPage.page);
    
    // Try to access protected page
    await dashboardPage.page.goto('/dashboard');
    
    // Should be redirected back to login
    await expect(dashboardPage.page).toHaveURL(/.*\/login/);
  });
});
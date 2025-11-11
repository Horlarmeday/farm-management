import { test, expect } from '../fixtures/auth.fixture';
import { AuthFixtureHelpers } from '../fixtures/auth.fixture';
import { TestDataGenerator } from '../utils/test-helpers';

/**
 * User Registration E2E Tests
 * Tests the complete user registration workflow
 */

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await AuthFixtureHelpers.clearAuthState(page);
  });

  test.afterEach(async ({ page }) => {
    // Clean up auth state after each test
    await AuthFixtureHelpers.clearAuthState(page);
  });

  test('should display registration form correctly', async ({ authPage }) => {
    await authPage.gotoRegister();
    
    // Verify form elements are present
    await expect(authPage.page.locator('[data-testid="register-form"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="first-name-input"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="last-name-input"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="farm-name-input"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="register-button"]')).toBeVisible();
    
    // Verify navigation links
    await expect(authPage.page.locator('[data-testid="login-link"]')).toBeVisible();
    
    // Verify form validation messages are not shown initially
    await expect(authPage.page.locator('[data-testid="validation-error"]')).not.toBeVisible();
  });

  test('should register new user successfully', async ({ authPage, dashboardPage }) => {
    const userData = await TestDataGenerator.generateUser();
    
    await authPage.gotoRegister();
    
    // Fill registration form
    await authPage.register(
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.password,
      userData.farmName
    );
    
    // Verify registration success
    await authPage.verifyRegistrationSuccess();
    
    // Verify user is redirected to dashboard
    await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
    
    // Verify user is authenticated
    await AuthFixtureHelpers.verifyAuthenticated(dashboardPage);
    
    // Verify user data is displayed correctly
    await expect(dashboardPage.page.locator('[data-testid="user-name"]')).toContainText(`${userData.firstName} ${userData.lastName}`);
    await expect(dashboardPage.page.locator('[data-testid="farm-name"]')).toContainText(userData.farmName);
  });

  test('should validate required fields', async ({ authPage }) => {
    await authPage.gotoRegister();
    
    // Try to submit empty form
    await authPage.page.click('[data-testid="register-button"]');
    
    // Verify validation errors are shown
    await expect(authPage.page.locator('[data-testid="first-name-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="last-name-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="password-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="farm-name-error"]')).toBeVisible();
    
    // Verify form is not submitted
    await expect(authPage.page).toHaveURL(/.*\/register/);
  });

  test('should validate email format', async ({ authPage }) => {
    await authPage.gotoRegister();
    
    const userData = await TestDataGenerator.generateUser();
    
    // Fill form with invalid email
    await authPage.page.fill('[data-testid="first-name-input"]', userData.firstName);
    await authPage.page.fill('[data-testid="last-name-input"]', userData.lastName);
    await authPage.page.fill('[data-testid="email-input"]', 'invalid-email');
    await authPage.page.fill('[data-testid="password-input"]', userData.password);
    await authPage.page.fill('[data-testid="confirm-password-input"]', userData.password);
    await authPage.page.fill('[data-testid="farm-name-input"]', userData.farmName);
    
    await authPage.page.click('[data-testid="register-button"]');
    
    // Verify email validation error
    await expect(authPage.page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="email-error"]')).toContainText('valid email');
    
    // Verify form is not submitted
    await expect(authPage.page).toHaveURL(/.*\/register/);
  });

  test('should validate password requirements', async ({ authPage }) => {
    await authPage.gotoRegister();
    
    const userData = await TestDataGenerator.generateUser();
    
    // Test weak password
    await authPage.page.fill('[data-testid="first-name-input"]', userData.firstName);
    await authPage.page.fill('[data-testid="last-name-input"]', userData.lastName);
    await authPage.page.fill('[data-testid="email-input"]', userData.email);
    await authPage.page.fill('[data-testid="password-input"]', '123');
    await authPage.page.fill('[data-testid="confirm-password-input"]', '123');
    await authPage.page.fill('[data-testid="farm-name-input"]', userData.farmName);
    
    await authPage.page.click('[data-testid="register-button"]');
    
    // Verify password validation error
    await expect(authPage.page.locator('[data-testid="password-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="password-error"]')).toContainText('8 characters');
    
    // Verify form is not submitted
    await expect(authPage.page).toHaveURL(/.*\/register/);
  });

  test('should validate password confirmation', async ({ authPage }) => {
    await authPage.gotoRegister();
    
    const userData = await TestDataGenerator.generateUser();
    
    // Fill form with mismatched passwords
    await authPage.page.fill('[data-testid="first-name-input"]', userData.firstName);
    await authPage.page.fill('[data-testid="last-name-input"]', userData.lastName);
    await authPage.page.fill('[data-testid="email-input"]', userData.email);
    await authPage.page.fill('[data-testid="password-input"]', userData.password);
    await authPage.page.fill('[data-testid="confirm-password-input"]', 'different-password');
    await authPage.page.fill('[data-testid="farm-name-input"]', userData.farmName);
    
    await authPage.page.click('[data-testid="register-button"]');
    
    // Verify password confirmation error
    await expect(authPage.page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="confirm-password-error"]')).toContainText('match');
    
    // Verify form is not submitted
    await expect(authPage.page).toHaveURL(/.*\/register/);
  });

  test('should handle duplicate email registration', async ({ authPage }) => {
    const userData = await TestDataGenerator.generateUser();
    
    // First registration
    await authPage.gotoRegister();
    await authPage.register(
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.password,
      userData.farmName
    );
    
    // Verify first registration success
    await authPage.verifyRegistrationSuccess();
    
    // Logout
    await authPage.page.goto('/logout');
    await AuthFixtureHelpers.clearAuthState(authPage.page);
    
    // Try to register with same email
    await authPage.gotoRegister();
    
    const duplicateUserData = await TestDataGenerator.generateUser();
    duplicateUserData.email = userData.email; // Use same email
    
    await authPage.register(
      duplicateUserData.firstName,
      duplicateUserData.lastName,
      duplicateUserData.email,
      duplicateUserData.password,
      duplicateUserData.farmName
    );
    
    // Verify duplicate email error
    await expect(authPage.page.locator('[data-testid="registration-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="registration-error"]')).toContainText('already exists');
    
    // Verify user stays on registration page
    await expect(authPage.page).toHaveURL(/.*\/register/);
  });

  test('should navigate to login page', async ({ authPage }) => {
    await authPage.gotoRegister();
    
    // Click login link
    await authPage.page.click('[data-testid="login-link"]');
    
    // Verify navigation to login page
    await expect(authPage.page).toHaveURL(/.*\/login/);
    await expect(authPage.page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('should handle server errors gracefully', async ({ authPage, page }) => {
    // Mock server error
    await page.route('**/api/auth/register', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    const userData = await TestDataGenerator.generateUser();
    
    await authPage.gotoRegister();
    await authPage.register(
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.password,
      userData.farmName
    );
    
    // Verify error message is displayed
    await expect(authPage.page.locator('[data-testid="registration-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="registration-error"]')).toContainText('error');
    
    // Verify user stays on registration page
    await expect(authPage.page).toHaveURL(/.*\/register/);
  });

  test('should handle network errors gracefully', async ({ authPage, page }) => {
    // Mock network error
    await page.route('**/api/auth/register', route => {
      route.abort('failed');
    });
    
    const userData = await TestDataGenerator.generateUser();
    
    await authPage.gotoRegister();
    await authPage.register(
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.password,
      userData.farmName
    );
    
    // Verify network error message is displayed
    await expect(authPage.page.locator('[data-testid="registration-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="registration-error"]')).toContainText('network');
    
    // Verify user stays on registration page
    await expect(authPage.page).toHaveURL(/.*\/register/);
  });

  test('should show loading state during registration', async ({ authPage, page }) => {
    // Mock slow server response
    await page.route('**/api/auth/register', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          user: await TestDataGenerator.generateUser(),
          token: 'mock-jwt-token'
        })
      });
    });
    
    const userData = await TestDataGenerator.generateUser();
    
    await authPage.gotoRegister();
    
    // Fill form
    await authPage.page.fill('[data-testid="first-name-input"]', userData.firstName);
    await authPage.page.fill('[data-testid="last-name-input"]', userData.lastName);
    await authPage.page.fill('[data-testid="email-input"]', userData.email);
    await authPage.page.fill('[data-testid="password-input"]', userData.password);
    await authPage.page.fill('[data-testid="confirm-password-input"]', userData.password);
    await authPage.page.fill('[data-testid="farm-name-input"]', userData.farmName);
    
    // Click register button
    await authPage.page.click('[data-testid="register-button"]');
    
    // Verify loading state
    await expect(authPage.page.locator('[data-testid="register-button"]')).toBeDisabled();
    await expect(authPage.page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for registration to complete
    await expect(authPage.page.locator('[data-testid="loading-spinner"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('should validate farm name requirements', async ({ authPage }) => {
    await authPage.gotoRegister();
    
    const userData = await TestDataGenerator.generateUser();
    
    // Test with very short farm name
    await authPage.page.fill('[data-testid="first-name-input"]', userData.firstName);
    await authPage.page.fill('[data-testid="last-name-input"]', userData.lastName);
    await authPage.page.fill('[data-testid="email-input"]', userData.email);
    await authPage.page.fill('[data-testid="password-input"]', userData.password);
    await authPage.page.fill('[data-testid="confirm-password-input"]', userData.password);
    await authPage.page.fill('[data-testid="farm-name-input"]', 'A');
    
    await authPage.page.click('[data-testid="register-button"]');
    
    // Verify farm name validation error
    await expect(authPage.page.locator('[data-testid="farm-name-error"]')).toBeVisible();
    await expect(authPage.page.locator('[data-testid="farm-name-error"]')).toContainText('characters');
    
    // Verify form is not submitted
    await expect(authPage.page).toHaveURL(/.*\/register/);
  });

  test('should handle special characters in form fields', async ({ authPage, dashboardPage }) => {
    await authPage.gotoRegister();
    
    const userData = {
      firstName: "José",
      lastName: "García-López",
      email: "jose.garcia+test@example.com",
      password: "SecureP@ssw0rd!",
      farmName: "García's Organic Farm & Co."
    };
    
    // Fill registration form with special characters
    await authPage.register(
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.password,
      userData.farmName
    );
    
    // Verify registration success
    await authPage.verifyRegistrationSuccess();
    
    // Verify user is redirected to dashboard
    await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
    
    // Verify special characters are displayed correctly
    await expect(dashboardPage.page.locator('[data-testid="user-name"]')).toContainText(`${userData.firstName} ${userData.lastName}`);
    await expect(dashboardPage.page.locator('[data-testid="farm-name"]')).toContainText(userData.farmName);
  });

  test('should maintain form data on validation errors', async ({ authPage }) => {
    await authPage.gotoRegister();
    
    const userData = await TestDataGenerator.generateUser();
    
    // Fill form with invalid email but valid other fields
    await authPage.page.fill('[data-testid="first-name-input"]', userData.firstName);
    await authPage.page.fill('[data-testid="last-name-input"]', userData.lastName);
    await authPage.page.fill('[data-testid="email-input"]', 'invalid-email');
    await authPage.page.fill('[data-testid="password-input"]', userData.password);
    await authPage.page.fill('[data-testid="confirm-password-input"]', userData.password);
    await authPage.page.fill('[data-testid="farm-name-input"]', userData.farmName);
    
    await authPage.page.click('[data-testid="register-button"]');
    
    // Verify validation error
    await expect(authPage.page.locator('[data-testid="email-error"]')).toBeVisible();
    
    // Verify other form fields maintain their values
    await expect(authPage.page.locator('[data-testid="first-name-input"]')).toHaveValue(userData.firstName);
    await expect(authPage.page.locator('[data-testid="last-name-input"]')).toHaveValue(userData.lastName);
    await expect(authPage.page.locator('[data-testid="farm-name-input"]')).toHaveValue(userData.farmName);
    
    // Password fields should be cleared for security
    await expect(authPage.page.locator('[data-testid="password-input"]')).toHaveValue('');
    await expect(authPage.page.locator('[data-testid="confirm-password-input"]')).toHaveValue('');
  });

  test('should support keyboard navigation', async ({ authPage }) => {
    await authPage.gotoRegister();
    
    // Test tab navigation through form fields
    await authPage.page.keyboard.press('Tab');
    await expect(authPage.page.locator('[data-testid="first-name-input"]')).toBeFocused();
    
    await authPage.page.keyboard.press('Tab');
    await expect(authPage.page.locator('[data-testid="last-name-input"]')).toBeFocused();
    
    await authPage.page.keyboard.press('Tab');
    await expect(authPage.page.locator('[data-testid="email-input"]')).toBeFocused();
    
    await authPage.page.keyboard.press('Tab');
    await expect(authPage.page.locator('[data-testid="password-input"]')).toBeFocused();
    
    await authPage.page.keyboard.press('Tab');
    await expect(authPage.page.locator('[data-testid="confirm-password-input"]')).toBeFocused();
    
    await authPage.page.keyboard.press('Tab');
    await expect(authPage.page.locator('[data-testid="farm-name-input"]')).toBeFocused();
    
    await authPage.page.keyboard.press('Tab');
    await expect(authPage.page.locator('[data-testid="register-button"]')).toBeFocused();
  });

  test('should handle form submission with Enter key', async ({ authPage, dashboardPage }) => {
    const userData = await TestDataGenerator.generateUser();
    
    await authPage.gotoRegister();
    
    // Fill form using keyboard
    await authPage.page.fill('[data-testid="first-name-input"]', userData.firstName);
    await authPage.page.fill('[data-testid="last-name-input"]', userData.lastName);
    await authPage.page.fill('[data-testid="email-input"]', userData.email);
    await authPage.page.fill('[data-testid="password-input"]', userData.password);
    await authPage.page.fill('[data-testid="confirm-password-input"]', userData.password);
    await authPage.page.fill('[data-testid="farm-name-input"]', userData.farmName);
    
    // Submit form with Enter key
    await authPage.page.keyboard.press('Enter');
    
    // Verify registration success
    await authPage.verifyRegistrationSuccess();
    
    // Verify user is redirected to dashboard
    await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
  });
});
import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Authentication page object model
 * Handles login, registration, and password reset flows
 */
export class AuthPage extends BasePage {
  // Selectors
  private readonly selectors = {
    // Login form
    loginForm: '[data-testid="login-form"]',
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginButton: '[data-testid="login-button"]',
    
    // Registration form
    registerForm: '[data-testid="register-form"]',
    firstNameInput: '[data-testid="first-name-input"]',
    lastNameInput: '[data-testid="last-name-input"]',
    confirmPasswordInput: '[data-testid="confirm-password-input"]',
    registerButton: '[data-testid="register-button"]',
    
    // Navigation
    switchToRegister: '[data-testid="switch-to-register"]',
    switchToLogin: '[data-testid="switch-to-login"]',
    
    // Password reset
    forgotPasswordLink: '[data-testid="forgot-password-link"]',
    resetPasswordForm: '[data-testid="reset-password-form"]',
    resetEmailInput: '[data-testid="reset-email-input"]',
    resetButton: '[data-testid="reset-button"]',
    
    // Error messages
    errorMessage: '[data-testid="error-message"]',
    fieldError: '[data-testid*="field-error"]',
    
    // Success messages
    successMessage: '[data-testid="success-message"]'
  };

  constructor(page: Page) {
    super(page, '/auth/login');
  }

  /**
   * Navigate to login page
   */
  async gotoLogin(): Promise<void> {
    await this.page.goto('/auth/login');
    await this.waitForElement(this.selectors.loginForm);
  }

  /**
   * Navigate to registration page
   */
  async gotoRegister(): Promise<void> {
    await this.page.goto('/auth/register');
    await this.waitForElement(this.selectors.registerForm);
  }

  /**
   * Perform user login
   */
  async login(email: string, password: string): Promise<void> {
    await this.gotoLogin();
    
    await this.fillField(this.selectors.emailInput, email);
    await this.fillField(this.selectors.passwordInput, password);
    
    await this.waitForNavigation(async () => {
      await this.clickElement(this.selectors.loginButton);
    }, '**/dashboard');
    
    // Verify successful login by checking dashboard URL
    expect(this.getCurrentUrl()).toContain('/dashboard');
  }

  /**
   * Perform user registration
   */
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.gotoRegister();
    
    await this.fillField(this.selectors.firstNameInput, userData.firstName);
    await this.fillField(this.selectors.lastNameInput, userData.lastName);
    await this.fillField(this.selectors.emailInput, userData.email);
    await this.fillField(this.selectors.passwordInput, userData.password);
    await this.fillField(this.selectors.confirmPasswordInput, userData.password);
    
    await this.waitForNavigation(async () => {
      await this.clickElement(this.selectors.registerButton);
    }, '**/dashboard');
    
    // Verify successful registration
    expect(this.getCurrentUrl()).toContain('/dashboard');
  }

  /**
   * Switch from login to registration form
   */
  async switchToRegisterForm(): Promise<void> {
    await this.clickElement(this.selectors.switchToRegister);
    await this.waitForElement(this.selectors.registerForm);
  }

  /**
   * Switch from registration to login form
   */
  async switchToLoginForm(): Promise<void> {
    await this.clickElement(this.selectors.switchToLogin);
    await this.waitForElement(this.selectors.loginForm);
  }

  /**
   * Initiate password reset
   */
  async resetPassword(email: string): Promise<void> {
    await this.gotoLogin();
    await this.clickElement(this.selectors.forgotPasswordLink);
    
    await this.waitForElement(this.selectors.resetPasswordForm);
    await this.fillField(this.selectors.resetEmailInput, email);
    await this.clickElement(this.selectors.resetButton);
    
    // Verify success message
    await this.verifyToast('Password reset email sent', 'success');
  }

  /**
   * Verify login form validation
   */
  async verifyLoginValidation(): Promise<void> {
    await this.gotoLogin();
    
    // Try to submit empty form
    await this.clickElement(this.selectors.loginButton);
    
    // Check for validation errors
    const emailError = await this.elementExists('[data-testid="email-field-error"]');
    const passwordError = await this.elementExists('[data-testid="password-field-error"]');
    
    expect(emailError).toBeTruthy();
    expect(passwordError).toBeTruthy();
  }

  /**
   * Verify registration form validation
   */
  async verifyRegistrationValidation(): Promise<void> {
    await this.gotoRegister();
    
    // Try to submit empty form
    await this.clickElement(this.selectors.registerButton);
    
    // Check for validation errors
    const firstNameError = await this.elementExists('[data-testid="first-name-field-error"]');
    const lastNameError = await this.elementExists('[data-testid="last-name-field-error"]');
    const emailError = await this.elementExists('[data-testid="email-field-error"]');
    const passwordError = await this.elementExists('[data-testid="password-field-error"]');
    
    expect(firstNameError).toBeTruthy();
    expect(lastNameError).toBeTruthy();
    expect(emailError).toBeTruthy();
    expect(passwordError).toBeTruthy();
  }

  /**
   * Verify password mismatch validation
   */
  async verifyPasswordMismatch(): Promise<void> {
    await this.gotoRegister();
    
    await this.fillField(this.selectors.firstNameInput, 'Test');
    await this.fillField(this.selectors.lastNameInput, 'User');
    await this.fillField(this.selectors.emailInput, 'test@example.com');
    await this.fillField(this.selectors.passwordInput, 'password123');
    await this.fillField(this.selectors.confirmPasswordInput, 'different123');
    
    await this.clickElement(this.selectors.registerButton);
    
    // Check for password mismatch error
    const confirmPasswordError = await this.elementExists('[data-testid="confirm-password-field-error"]');
    expect(confirmPasswordError).toBeTruthy();
  }

  /**
   * Verify invalid login credentials
   */
  async verifyInvalidLogin(): Promise<void> {
    await this.gotoLogin();
    
    await this.fillField(this.selectors.emailInput, 'invalid@example.com');
    await this.fillField(this.selectors.passwordInput, 'wrongpassword');
    await this.clickElement(this.selectors.loginButton);
    
    // Check for error message
    await this.verifyToast('Invalid email or password', 'error');
  }

  /**
   * Verify email format validation
   */
  async verifyEmailValidation(): Promise<void> {
    await this.gotoLogin();
    
    await this.fillField(this.selectors.emailInput, 'invalid-email');
    await this.fillField(this.selectors.passwordInput, 'password123');
    await this.clickElement(this.selectors.loginButton);
    
    // Check for email format error
    const emailError = await this.elementExists('[data-testid="email-field-error"]');
    expect(emailError).toBeTruthy();
  }

  /**
   * Get current form type (login or register)
   */
  async getCurrentFormType(): Promise<'login' | 'register'> {
    const loginFormExists = await this.elementExists(this.selectors.loginForm);
    return loginFormExists ? 'login' : 'register';
  }

  /**
   * Check if user is already logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.goto('/dashboard');
      await this.page.waitForURL('**/dashboard', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    // Navigate to dashboard first
    await this.page.goto('/dashboard');
    
    // Click logout button (assuming it's in the header/nav)
    await this.clickElement('[data-testid="logout-button"]');
    
    // Wait for redirect to login page
    await this.page.waitForURL('**/auth/login');
  }
}
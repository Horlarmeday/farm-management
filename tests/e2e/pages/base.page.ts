import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page class with common functionality
 * All page objects should extend this class
 */
export class BasePage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string = '') {
    this.page = page;
    this.url = url;
  }

  /**
   * Navigate to the page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  /**
   * Wait for page to load completely
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout: number = 5000): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  /**
   * Fill form field with validation
   */
  async fillField(selector: string, value: string): Promise<void> {
    const field = await this.waitForElement(selector);
    await field.clear();
    await field.fill(value);
    
    // Verify the value was set correctly
    await expect(field).toHaveValue(value);
  }

  /**
   * Click element with wait
   */
  async clickElement(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.click();
  }

  /**
   * Wait for navigation after action
   */
  async waitForNavigation(action: () => Promise<void>, url?: string): Promise<void> {
    const navigationPromise = url 
      ? this.page.waitForURL(url)
      : this.page.waitForNavigation();
    
    await action();
    await navigationPromise;
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ state: 'attached', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get element text content
   */
  async getElementText(selector: string): Promise<string> {
    const element = await this.waitForElement(selector);
    return await element.textContent() || '';
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp, timeout: number = 10000): Promise<any> {
    const response = await this.page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
    
    return await response.json();
  }

  /**
   * Verify toast notification
   */
  async verifyToast(message: string, type: 'success' | 'error' | 'info' = 'success'): Promise<void> {
    const toastSelector = `[data-testid="toast-${type}"]`;
    const toast = await this.waitForElement(toastSelector);
    await expect(toast).toContainText(message);
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete(): Promise<void> {
    // Wait for any loading spinners to disappear
    await this.page.waitForFunction(() => {
      const spinners = document.querySelectorAll('[data-testid*="loading"], .loading, .spinner');
      return spinners.length === 0;
    }, { timeout: 10000 });
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string): Promise<void> {
    const fileInput = this.page.locator(selector);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Select dropdown option
   */
  async selectDropdownOption(selector: string, option: string): Promise<void> {
    const dropdown = await this.waitForElement(selector);
    await dropdown.click();
    
    const optionSelector = `[data-testid="option-${option}"], [value="${option}"]`;
    await this.clickElement(optionSelector);
  }

  /**
   * Verify page accessibility
   */
  async checkAccessibility(): Promise<void> {
    // This would integrate with axe-core for accessibility testing
    // Implementation depends on axe-playwright setup
    console.log('Accessibility check would run here');
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForLoad();
  }
}
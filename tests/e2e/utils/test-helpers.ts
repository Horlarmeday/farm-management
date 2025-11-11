import { Page } from '@playwright/test';

// Dynamic import wrapper for faker to handle ES module compatibility
let fakerInstance: any = null;

async function getFaker() {
  if (!fakerInstance) {
    const fakerModule = await import('@faker-js/faker');
    fakerInstance = fakerModule.faker;
  }
  return fakerInstance;
}

/**
 * Test utility functions for E2E testing
 */

/**
 * Generate test data for various entities
 */
export class TestDataGenerator {
  /**
   * Generate test user data
   */
  static async generateUser() {
    const faker = await getFaker();
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: 'TestPassword123!',
      farmName: faker.company.name() + ' Farm',
      phoneNumber: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: 'United States',
      },
    };
  }

  /**
   * Generate test livestock data
   */
  static async generateLivestock() {
    const faker = await getFaker();
    const types = ['Cattle', 'Poultry', 'Sheep', 'Goats', 'Pigs'];
    const breeds = {
      Cattle: ['Holstein', 'Angus', 'Hereford', 'Jersey'],
      Poultry: ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Brahma'],
      Sheep: ['Merino', 'Suffolk', 'Dorset', 'Romney'],
      Goats: ['Nubian', 'Boer', 'Alpine', 'Saanen'],
      Pigs: ['Yorkshire', 'Duroc', 'Hampshire', 'Landrace'],
    };

    const type = faker.helpers.arrayElement(types);
    const breed = faker.helpers.arrayElement(breeds[type as keyof typeof breeds]);

    return {
      tagId: faker.string.alphanumeric(8).toUpperCase(),
      type,
      breed,
      gender: faker.helpers.arrayElement(['Male', 'Female']),
      birthDate: faker.date.past({ years: 3 }).toISOString().split('T')[0],
      weight: faker.number.int({ min: 50, max: 800 }),
      healthStatus: faker.helpers.arrayElement(['Healthy', 'Sick', 'Under Treatment']),
      location: faker.helpers.arrayElement(['Pasture A', 'Barn 1', 'Pen 3', 'Field B']),
      notes: faker.lorem.sentence(),
    };
  }

  /**
   * Generate test inventory item data
   */
  static async generateInventoryItem() {
    const faker = await getFaker();
    const categories = ['Feed', 'Medicine', 'Equipment', 'Supplies', 'Seeds'];
    const units = ['kg', 'lbs', 'pieces', 'liters', 'gallons'];

    return {
      name: faker.commerce.productName(),
      category: faker.helpers.arrayElement(categories),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      quantity: faker.number.int({ min: 1, max: 1000 }),
      unit: faker.helpers.arrayElement(units),
      unitPrice: faker.number.float({ min: 1, max: 500, fractionDigits: 2 }),
      supplier: faker.company.name(),
      location: faker.helpers.arrayElement(['Warehouse A', 'Storage Room 1', 'Barn Storage']),
      minimumStock: faker.number.int({ min: 5, max: 50 }),
      expirationDate: faker.date.future({ years: 2 }).toISOString().split('T')[0],
      description: faker.lorem.sentence(),
    };
  }

  /**
   * Generate test financial transaction data
   */
  static async generateTransaction() {
    const faker = await getFaker();
    const types = ['income', 'expense'];
    const incomeCategories = ['Livestock Sales', 'Crop Sales', 'Dairy Sales', 'Other Income'];
    const expenseCategories = [
      'Feed',
      'Veterinary',
      'Equipment',
      'Labor',
      'Utilities',
      'Maintenance',
    ];

    const type = faker.helpers.arrayElement(types);
    const categories = type === 'income' ? incomeCategories : expenseCategories;

    return {
      type,
      category: faker.helpers.arrayElement(categories),
      amount: faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }).toString(),
      description: faker.lorem.sentence(),
      date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      reference: faker.string.alphanumeric(8).toUpperCase(),
      notes: faker.lorem.paragraph(),
    };
  }

  /**
   * Generate test budget data
   */
  static async generateBudget() {
    const faker = await getFaker();
    const categories = ['Feed', 'Veterinary', 'Equipment', 'Labor', 'Utilities', 'Marketing'];
    const periods = ['Monthly', 'Quarterly', 'Yearly'];

    return {
      name: faker.lorem.words(2) + ' Budget',
      category: faker.helpers.arrayElement(categories),
      amount: faker.number.float({ min: 500, max: 10000, fractionDigits: 2 }).toString(),
      period: faker.helpers.arrayElement(periods),
      startDate: faker.date.recent({ days: 7 }).toISOString().split('T')[0],
      endDate: faker.date.future({ years: 1 }).toISOString().split('T')[0],
    };
  }
}

/**
 * Database utilities for testing
 */
export class DatabaseUtils {
  /**
   * Clean up test data from database
   */
  static async cleanupTestData(): Promise<void> {
    // This would typically connect to test database and clean up
    // For now, we'll use API calls to clean up
    console.log('Cleaning up test data...');
  }

  /**
   * Seed test data into database
   */
  static async seedTestData(): Promise<void> {
    // This would typically seed the database with test data
    console.log('Seeding test data...');
  }

  /**
   * Reset database to initial state
   */
  static async resetDatabase(): Promise<void> {
    await this.cleanupTestData();
    await this.seedTestData();
  }
}

/**
 * API utilities for testing
 */
export class ApiUtils {
  /**
   * Create test user via API
   */
  static async createTestUser(userData: any): Promise<{ user: any; token: string }> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create test user: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Login test user via API
   */
  static async loginTestUser(
    email: string,
    password: string,
  ): Promise<{ user: any; token: string }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Failed to login test user: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete test user via API
   */
  static async deleteTestUser(userId: string, token: string): Promise<void> {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete test user: ${response.statusText}`);
    }
  }

  /**
   * Create test livestock via API
   */
  static async createTestLivestock(livestockData: any, token: string): Promise<any> {
    const response = await fetch('/api/livestock', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(livestockData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create test livestock: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create test inventory item via API
   */
  static async createTestInventoryItem(itemData: any, token: string): Promise<any> {
    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create test inventory item: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create test transaction via API
   */
  static async createTestTransaction(transactionData: any, token: string): Promise<any> {
    const response = await fetch('/api/financial/transactions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create test transaction: ${response.statusText}`);
    }

    return await response.json();
  }
}

/**
 * Browser utilities for testing
 */
export class BrowserUtils {
  /**
   * Take screenshot with timestamp
   */
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    await page.screenshot({ path: `tests/screenshots/${filename}`, fullPage: true });
  }

  /**
   * Wait for network to be idle
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 5000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Clear browser storage
   */
  static async clearBrowserStorage(page: Page): Promise<void> {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Clear cookies
    const context = page.context();
    await context.clearCookies();
  }

  /**
   * Set viewport size
   */
  static async setViewportSize(page: Page, width: number, height: number): Promise<void> {
    await page.setViewportSize({ width, height });
  }

  /**
   * Simulate slow network
   */
  static async simulateSlowNetwork(page: Page): Promise<void> {
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });
  }

  /**
   * Block specific resources
   */
  static async blockResources(page: Page, resourceTypes: string[]): Promise<void> {
    await page.route('**/*', async (route) => {
      if (resourceTypes.includes(route.request().resourceType())) {
        await route.abort();
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Mock API response
   */
  static async mockApiResponse(page: Page, url: string, response: any): Promise<void> {
    await page.route(url, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Intercept and log network requests
   */
  static async logNetworkRequests(page: Page): Promise<void> {
    page.on('request', (request) => {
      console.log(`Request: ${request.method()} ${request.url()}`);
    });

    page.on('response', (response) => {
      console.log(`Response: ${response.status()} ${response.url()}`);
    });
  }
}

/**
 * Accessibility utilities for testing
 */
export class AccessibilityUtils {
  /**
   * Check for accessibility violations
   */
  static async checkAccessibility(page: Page): Promise<void> {
    // This would typically use axe-core or similar tool
    // For now, we'll do basic checks

    // Check for alt text on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      console.warn(`Found ${imagesWithoutAlt} images without alt text`);
    }

    // Check for form labels
    const inputsWithoutLabels = await page
      .locator('input:not([aria-label]):not([aria-labelledby])')
      .count();
    if (inputsWithoutLabels > 0) {
      console.warn(`Found ${inputsWithoutLabels} inputs without labels`);
    }

    // Check for heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;

    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
      const currentLevel = parseInt(tagName.charAt(1));

      if (currentLevel > previousLevel + 1) {
        console.warn(`Heading hierarchy violation: ${tagName} follows h${previousLevel}`);
      }

      previousLevel = currentLevel;
    }
  }

  /**
   * Test keyboard navigation
   */
  static async testKeyboardNavigation(page: Page): Promise<void> {
    // Test tab navigation
    const focusableElements = await page
      .locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      .all();

    for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    // Test escape key
    await page.keyboard.press('Escape');

    // Test enter key on focused element
    await page.keyboard.press('Enter');
  }

  /**
   * Check color contrast
   */
  static async checkColorContrast(page: Page): Promise<void> {
    // This would typically use a color contrast checking library
    // For now, we'll log a placeholder
    console.log('Color contrast check would be performed here');
  }
}

/**
 * Performance utilities for testing
 */
export class PerformanceUtils {
  /**
   * Measure page load time
   */
  static async measurePageLoadTime(page: Page): Promise<number> {
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();

    return endTime - startTime;
  }

  /**
   * Measure time to first contentful paint
   */
  static async measureFCP(page: Page): Promise<number> {
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              resolve(entry.startTime);
            }
          }
        }).observe({ entryTypes: ['paint'] });
      });
    });

    return fcp as number;
  }

  /**
   * Monitor memory usage
   */
  static async monitorMemoryUsage(page: Page): Promise<any> {
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory;
    });

    return memoryInfo;
  }

  /**
   * Check for console errors
   */
  static async checkConsoleErrors(page: Page): Promise<string[]> {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }
}

/**
 * Wait utilities for testing
 */
export class WaitUtils {
  /**
   * Wait for element to be stable (not moving)
   */
  static async waitForElementStable(
    page: Page,
    selector: string,
    timeout: number = 5000,
  ): Promise<void> {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });

    // Wait for element to stop moving
    let previousBox = await element.boundingBox();
    let stableCount = 0;

    while (stableCount < 3) {
      await page.waitForTimeout(100);
      const currentBox = await element.boundingBox();

      if (
        previousBox &&
        currentBox &&
        previousBox.x === currentBox.x &&
        previousBox.y === currentBox.y &&
        previousBox.width === currentBox.width &&
        previousBox.height === currentBox.height
      ) {
        stableCount++;
      } else {
        stableCount = 0;
      }

      previousBox = currentBox;
    }
  }

  /**
   * Wait for API response
   */
  static async waitForApiResponse(
    page: Page,
    urlPattern: string,
    timeout: number = 10000,
  ): Promise<any> {
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes(urlPattern) && response.status() === 200,
      { timeout },
    );

    const response = await responsePromise;
    return await response.json();
  }

  /**
   * Wait for multiple conditions
   */
  static async waitForConditions(
    page: Page,
    conditions: (() => Promise<boolean>)[],
    timeout: number = 10000,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const results = await Promise.all(conditions.map((condition) => condition()));

      if (results.every((result) => result === true)) {
        return;
      }

      await page.waitForTimeout(100);
    }

    throw new Error('Timeout waiting for conditions to be met');
  }
}

/**
 * Export all utilities
 */
export {
  TestDataGenerator,
  DatabaseUtils,
  ApiUtils,
  BrowserUtils,
  AccessibilityUtils,
  PerformanceUtils,
  WaitUtils,
};
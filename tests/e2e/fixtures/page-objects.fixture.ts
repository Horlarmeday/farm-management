import { test as base } from './auth.fixture';
import { InventoryPage } from '../pages/inventory.page';
import { LivestockPage } from '../pages/livestock.page';
import { FinancialPage } from '../pages/financial.page';

/**
 * Page object fixtures for E2E tests
 * Extends auth fixtures with additional page objects
 */

interface PageObjectFixtures {
  inventoryPage: InventoryPage;
  livestockPage: LivestockPage;
  financialPage: FinancialPage;
}

/**
 * Extended test with page object fixtures
 */
export const test = base.extend<PageObjectFixtures>({
  /**
   * Inventory page fixture
   */
  inventoryPage: async ({ page }, use) => {
    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
  },

  /**
   * Livestock page fixture
   */
  livestockPage: async ({ page }, use) => {
    const livestockPage = new LivestockPage(page);
    await use(livestockPage);
  },

  /**
   * Financial page fixture
   */
  financialPage: async ({ page }, use) => {
    const financialPage = new FinancialPage(page);
    await use(financialPage);
  }
});

export { expect } from '@playwright/test';
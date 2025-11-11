import { test, expect } from '../fixtures/page-objects.fixture';
import { DataFixtureHelpers } from '../fixtures/data.fixture';
import { TestDataGenerator, DatabaseHelpers } from '../utils/test-helpers';

/**
 * Financial Reporting E2E Tests
 * Tests the complete financial reporting workflow
 */

test.describe('Financial Reporting', () => {
  let testUser: any;
  let testFarm: any;

  test.beforeAll(async () => {
    // Create test user and farm
    testUser = await TestDataGenerator.generateUser();
    testFarm = await TestDataGenerator.generateFarm();
    
    // Setup test data in database
    await DatabaseHelpers.createTestUser(testUser);
    await DatabaseHelpers.createTestFarm(testFarm, testUser.id);
  });

  test.afterAll(async () => {
    // Clean up test data
    await DatabaseHelpers.cleanupTestData();
  });

  test.beforeEach(async ({ authPage, financialPage }) => {
    // Login before each test
    await authPage.gotoLogin();
    await authPage.login(testUser.email, testUser.password);
    
    // Navigate to financial page
    await financialPage.goto();
  });

  test('should display financial dashboard correctly', async ({ financialPage }) => {
    // Verify page elements are present
    await expect(financialPage.page.locator('[data-testid="financial-dashboard"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="date-range-picker"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="financial-summary"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="transaction-list"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="add-transaction-button"]')).toBeVisible();
    
    // Verify summary cards
    await expect(financialPage.page.locator('[data-testid="total-income"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="total-expenses"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="net-profit"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="profit-margin"]')).toBeVisible();
    
    // Verify charts
    await expect(financialPage.page.locator('[data-testid="income-expense-chart"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="category-breakdown-chart"]')).toBeVisible();
  });

  test('should set date range for reports', async ({ financialPage }) => {
    // Set custom date range
    await financialPage.setDateRange('2024-01-01', '2024-01-31');
    
    // Verify date range is applied
    await expect(financialPage.page.locator('[data-testid="date-range-display"]')).toContainText('Jan 1, 2024 - Jan 31, 2024');
    
    // Verify data is filtered
    await expect(financialPage.page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="loading-indicator"]')).not.toBeVisible();
    
    // Test preset ranges
    await financialPage.page.click('[data-testid="preset-this-month"]');
    await expect(financialPage.page.locator('[data-testid="date-range-display"]')).toContainText('This Month');
    
    await financialPage.page.click('[data-testid="preset-last-quarter"]');
    await expect(financialPage.page.locator('[data-testid="date-range-display"]')).toContainText('Last Quarter');
    
    await financialPage.page.click('[data-testid="preset-this-year"]');
    await expect(financialPage.page.locator('[data-testid="date-range-display"]')).toContainText('This Year');
  });

  test('should add income transaction', async ({ financialPage }) => {
    const transactionData = await TestDataGenerator.generateTransaction('income');
    
    // Click add transaction button
    await financialPage.clickAddTransaction();
    
    // Verify add transaction modal is open
    await expect(financialPage.page.locator('[data-testid="add-transaction-modal"]')).toBeVisible();
    
    // Fill transaction form
    await financialPage.addTransaction(
      transactionData.type,
      transactionData.category,
      transactionData.amount,
      transactionData.description,
      transactionData.date,
      transactionData.reference,
      transactionData.paymentMethod
    );
    
    // Verify success message
    await expect(financialPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="success-message"]')).toContainText('Transaction added successfully');
    
    // Verify transaction appears in list
    await expect(financialPage.page.locator(`[data-testid="transaction-${transactionData.reference}"]`)).toBeVisible();
    await expect(financialPage.page.locator(`[data-testid="transaction-amount-${transactionData.reference}"]`)).toContainText(`+$${transactionData.amount}`);
    await expect(financialPage.page.locator(`[data-testid="transaction-category-${transactionData.reference}"]`)).toContainText(transactionData.category);
    
    // Verify summary is updated
    const totalIncome = await financialPage.getTotalIncome();
    expect(totalIncome).toBeGreaterThanOrEqual(transactionData.amount);
  });

  test('should add expense transaction', async ({ financialPage }) => {
    const transactionData = await TestDataGenerator.generateTransaction('expense');
    
    // Click add transaction button
    await financialPage.clickAddTransaction();
    
    // Fill transaction form
    await financialPage.addTransaction(
      transactionData.type,
      transactionData.category,
      transactionData.amount,
      transactionData.description,
      transactionData.date,
      transactionData.reference,
      transactionData.paymentMethod
    );
    
    // Verify success message
    await expect(financialPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify transaction appears in list
    await expect(financialPage.page.locator(`[data-testid="transaction-${transactionData.reference}"]`)).toBeVisible();
    await expect(financialPage.page.locator(`[data-testid="transaction-amount-${transactionData.reference}"]`)).toContainText(`-$${transactionData.amount}`);
    await expect(financialPage.page.locator(`[data-testid="transaction-category-${transactionData.reference}"]`)).toContainText(transactionData.category);
    
    // Verify summary is updated
    const totalExpenses = await financialPage.getTotalExpenses();
    expect(totalExpenses).toBeGreaterThanOrEqual(transactionData.amount);
  });

  test('should validate required fields when adding transaction', async ({ financialPage }) => {
    await financialPage.clickAddTransaction();
    
    // Try to submit empty form
    await financialPage.page.click('[data-testid="save-transaction-button"]');
    
    // Verify validation errors
    await expect(financialPage.page.locator('[data-testid="type-error"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="category-error"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="amount-error"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="description-error"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="date-error"]')).toBeVisible();
    
    // Verify modal stays open
    await expect(financialPage.page.locator('[data-testid="add-transaction-modal"]')).toBeVisible();
  });

  test('should validate amount field', async ({ financialPage }) => {
    await financialPage.clickAddTransaction();
    
    // Test negative amount
    await financialPage.page.fill('[data-testid="amount-input"]', '-100');
    await financialPage.page.click('[data-testid="save-transaction-button"]');
    
    await expect(financialPage.page.locator('[data-testid="amount-error"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="amount-error"]')).toContainText('must be positive');
    
    // Test zero amount
    await financialPage.page.fill('[data-testid="amount-input"]', '0');
    await financialPage.page.click('[data-testid="save-transaction-button"]');
    
    await expect(financialPage.page.locator('[data-testid="amount-error"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="amount-error"]')).toContainText('must be greater than 0');
    
    // Test invalid format
    await financialPage.page.fill('[data-testid="amount-input"]', 'abc');
    await financialPage.page.click('[data-testid="save-transaction-button"]');
    
    await expect(financialPage.page.locator('[data-testid="amount-error"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="amount-error"]')).toContainText('must be a valid number');
  });

  test('should validate date field', async ({ financialPage }) => {
    await financialPage.clickAddTransaction();
    
    // Test future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    await financialPage.page.fill('[data-testid="date-input"]', futureDateString);
    await financialPage.page.click('[data-testid="save-transaction-button"]');
    
    await expect(financialPage.page.locator('[data-testid="date-error"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="date-error"]')).toContainText('cannot be in the future');
  });

  test('should search transactions', async ({ financialPage }) => {
    // Add test transactions
    const transaction1 = await TestDataGenerator.generateTransaction('income', { description: 'Egg sales revenue' });
    const transaction2 = await TestDataGenerator.generateTransaction('expense', { description: 'Feed purchase' });
    
    await DataFixtureHelpers.createTestTransaction(transaction1, testFarm.id);
    await DataFixtureHelpers.createTestTransaction(transaction2, testFarm.id);
    
    // Refresh page to load new data
    await financialPage.page.reload();
    
    // Search by description
    await financialPage.searchTransactions('Egg sales');
    
    // Verify search results
    await expect(financialPage.page.locator(`[data-testid="transaction-${transaction1.reference}"]`)).toBeVisible();
    await expect(financialPage.page.locator(`[data-testid="transaction-${transaction2.reference}"]`)).not.toBeVisible();
    
    // Clear search and search by reference
    await financialPage.searchTransactions('');
    await financialPage.searchTransactions(transaction2.reference);
    
    // Verify search results
    await expect(financialPage.page.locator(`[data-testid="transaction-${transaction2.reference}"]`)).toBeVisible();
    await expect(financialPage.page.locator(`[data-testid="transaction-${transaction1.reference}"]`)).not.toBeVisible();
  });

  test('should filter transactions by type', async ({ financialPage }) => {
    // Add test transactions
    const incomeTransaction = await TestDataGenerator.generateTransaction('income');
    const expenseTransaction = await TestDataGenerator.generateTransaction('expense');
    
    await DataFixtureHelpers.createTestTransaction(incomeTransaction, testFarm.id);
    await DataFixtureHelpers.createTestTransaction(expenseTransaction, testFarm.id);
    
    // Refresh page
    await financialPage.page.reload();
    
    // Filter by income
    await financialPage.filterByType('income');
    
    // Verify only income transactions are shown
    await expect(financialPage.page.locator(`[data-testid="transaction-${incomeTransaction.reference}"]`)).toBeVisible();
    await expect(financialPage.page.locator(`[data-testid="transaction-${expenseTransaction.reference}"]`)).not.toBeVisible();
    
    // Filter by expense
    await financialPage.filterByType('expense');
    
    // Verify only expense transactions are shown
    await expect(financialPage.page.locator(`[data-testid="transaction-${expenseTransaction.reference}"]`)).toBeVisible();
    await expect(financialPage.page.locator(`[data-testid="transaction-${incomeTransaction.reference}"]`)).not.toBeVisible();
    
    // Show all transactions
    await financialPage.filterByType('all');
    
    // Verify both transactions are shown
    await expect(financialPage.page.locator(`[data-testid="transaction-${incomeTransaction.reference}"]`)).toBeVisible();
    await expect(financialPage.page.locator(`[data-testid="transaction-${expenseTransaction.reference}"]`)).toBeVisible();
  });

  test('should filter transactions by category', async ({ financialPage }) => {
    // Add test transactions of different categories
    const salesTransaction = await TestDataGenerator.generateTransaction('income', { category: 'Sales' });
    const feedTransaction = await TestDataGenerator.generateTransaction('expense', { category: 'Feed' });
    const equipmentTransaction = await TestDataGenerator.generateTransaction('expense', { category: 'Equipment' });
    
    await DataFixtureHelpers.createTestTransaction(salesTransaction, testFarm.id);
    await DataFixtureHelpers.createTestTransaction(feedTransaction, testFarm.id);
    await DataFixtureHelpers.createTestTransaction(equipmentTransaction, testFarm.id);
    
    // Refresh page
    await financialPage.page.reload();
    
    // Filter by Sales
    await financialPage.filterByCategory('Sales');
    
    // Verify only sales transactions are shown
    await expect(financialPage.page.locator(`[data-testid="transaction-${salesTransaction.reference}"]`)).toBeVisible();
    await expect(financialPage.page.locator(`[data-testid="transaction-${feedTransaction.reference}"]`)).not.toBeVisible();
    await expect(financialPage.page.locator(`[data-testid="transaction-${equipmentTransaction.reference}"]`)).not.toBeVisible();
    
    // Filter by Feed
    await financialPage.filterByCategory('Feed');
    
    // Verify only feed transactions are shown
    await expect(financialPage.page.locator(`[data-testid="transaction-${feedTransaction.reference}"]`)).toBeVisible();
    await expect(financialPage.page.locator(`[data-testid="transaction-${salesTransaction.reference}"]`)).not.toBeVisible();
    await expect(financialPage.page.locator(`[data-testid="transaction-${equipmentTransaction.reference}"]`)).not.toBeVisible();
  });

  test('should edit transaction', async ({ financialPage }) => {
    // Add test transaction
    const transactionData = await TestDataGenerator.generateTransaction('income');
    await DataFixtureHelpers.createTestTransaction(transactionData, testFarm.id);
    
    // Refresh page
    await financialPage.page.reload();
    
    // Click edit button
    await financialPage.editTransaction(transactionData.reference);
    
    // Verify edit modal is open
    await expect(financialPage.page.locator('[data-testid="edit-transaction-modal"]')).toBeVisible();
    
    // Update transaction information
    const updatedAmount = 1500;
    const updatedDescription = 'Updated description';
    
    await financialPage.page.fill('[data-testid="amount-input"]', updatedAmount.toString());
    await financialPage.page.fill('[data-testid="description-input"]', updatedDescription);
    
    // Save changes
    await financialPage.page.click('[data-testid="save-transaction-button"]');
    
    // Verify success message
    await expect(financialPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify updated information is displayed
    await expect(financialPage.page.locator(`[data-testid="transaction-amount-${transactionData.reference}"]`)).toContainText(updatedAmount.toString());
    await expect(financialPage.page.locator(`[data-testid="transaction-description-${transactionData.reference}"]`)).toContainText(updatedDescription);
  });

  test('should delete transaction', async ({ financialPage }) => {
    // Add test transaction
    const transactionData = await TestDataGenerator.generateTransaction('expense');
    await DataFixtureHelpers.createTestTransaction(transactionData, testFarm.id);
    
    // Refresh page
    await financialPage.page.reload();
    
    // Get initial total expenses
    const initialExpenses = await financialPage.getTotalExpenses();
    
    // Delete transaction
    await financialPage.deleteTransaction(transactionData.reference);
    
    // Confirm deletion
    await expect(financialPage.page.locator('[data-testid="confirm-delete-modal"]')).toBeVisible();
    await financialPage.page.click('[data-testid="confirm-delete-button"]');
    
    // Verify success message
    await expect(financialPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify transaction is removed from list
    await expect(financialPage.page.locator(`[data-testid="transaction-${transactionData.reference}"]`)).not.toBeVisible();
    
    // Verify summary is updated
    const newExpenses = await financialPage.getTotalExpenses();
    expect(newExpenses).toBeLessThan(initialExpenses);
  });

  test('should generate profit and loss report', async ({ financialPage, page }) => {
    // Add test transactions
    const incomeTransaction = await TestDataGenerator.generateTransaction('income', { amount: 5000 });
    const expenseTransaction = await TestDataGenerator.generateTransaction('expense', { amount: 2000 });
    
    await DataFixtureHelpers.createTestTransaction(incomeTransaction, testFarm.id);
    await DataFixtureHelpers.createTestTransaction(expenseTransaction, testFarm.id);
    
    // Refresh page
    await financialPage.page.reload();
    
    // Click reports button
    await financialPage.page.click('[data-testid="financial-reports-button"]');
    
    // Verify reports modal
    await expect(financialPage.page.locator('[data-testid="reports-modal"]')).toBeVisible();
    
    // Select profit and loss report
    await financialPage.page.click('[data-testid="profit-loss-report"]');
    
    // Set report parameters
    await financialPage.setDateRange('2024-01-01', '2024-12-31');
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Generate report
    await financialPage.page.click('[data-testid="generate-report-button"]');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('profit-loss');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should generate cash flow report', async ({ financialPage, page }) => {
    // Add test transactions
    const transactions = [
      await TestDataGenerator.generateTransaction('income', { amount: 3000, date: '2024-01-15' }),
      await TestDataGenerator.generateTransaction('expense', { amount: 1500, date: '2024-01-20' }),
      await TestDataGenerator.generateTransaction('income', { amount: 2500, date: '2024-02-10' }),
      await TestDataGenerator.generateTransaction('expense', { amount: 1000, date: '2024-02-25' })
    ];
    
    for (const transaction of transactions) {
      await DataFixtureHelpers.createTestTransaction(transaction, testFarm.id);
    }
    
    // Refresh page
    await financialPage.page.reload();
    
    // Generate cash flow report
    await financialPage.page.click('[data-testid="financial-reports-button"]');
    await financialPage.page.click('[data-testid="cash-flow-report"]');
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Generate report
    await financialPage.page.click('[data-testid="generate-report-button"]');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('cash-flow');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should generate tax summary report', async ({ financialPage, page }) => {
    // Add test transactions with tax implications
    const taxableIncome = await TestDataGenerator.generateTransaction('income', { 
      amount: 10000, 
      category: 'Sales',
      taxable: true 
    });
    const deductibleExpense = await TestDataGenerator.generateTransaction('expense', { 
      amount: 3000, 
      category: 'Feed',
      taxDeductible: true 
    });
    
    await DataFixtureHelpers.createTestTransaction(taxableIncome, testFarm.id);
    await DataFixtureHelpers.createTestTransaction(deductibleExpense, testFarm.id);
    
    // Refresh page
    await financialPage.page.reload();
    
    // Generate tax summary report
    await financialPage.page.click('[data-testid="financial-reports-button"]');
    await financialPage.page.click('[data-testid="tax-summary-report"]');
    
    // Set tax year
    await financialPage.page.selectOption('[data-testid="tax-year-select"]', '2024');
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Generate report
    await financialPage.page.click('[data-testid="generate-report-button"]');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('tax-summary');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should create budget', async ({ financialPage }) => {
    // Click create budget button
    await financialPage.page.click('[data-testid="create-budget-button"]');
    
    // Verify budget modal is open
    await expect(financialPage.page.locator('[data-testid="create-budget-modal"]')).toBeVisible();
    
    const budgetData = {
      name: 'Q1 2024 Budget',
      period: 'quarterly',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      categories: [
        { name: 'Sales', type: 'income', amount: 50000 },
        { name: 'Feed', type: 'expense', amount: 15000 },
        { name: 'Equipment', type: 'expense', amount: 8000 },
        { name: 'Labor', type: 'expense', amount: 12000 }
      ]
    };
    
    // Fill budget form
    await financialPage.page.fill('[data-testid="budget-name-input"]', budgetData.name);
    await financialPage.page.selectOption('[data-testid="budget-period-select"]', budgetData.period);
    await financialPage.page.fill('[data-testid="budget-start-date"]', budgetData.startDate);
    await financialPage.page.fill('[data-testid="budget-end-date"]', budgetData.endDate);
    
    // Add budget categories
    for (const category of budgetData.categories) {
      await financialPage.page.click('[data-testid="add-budget-category"]');
      await financialPage.page.fill('[data-testid="category-name-input"]:last-of-type', category.name);
      await financialPage.page.selectOption('[data-testid="category-type-select"]:last-of-type', category.type);
      await financialPage.page.fill('[data-testid="category-amount-input"]:last-of-type', category.amount.toString());
    }
    
    // Save budget
    await financialPage.page.click('[data-testid="save-budget-button"]');
    
    // Verify success message
    await expect(financialPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="success-message"]')).toContainText('Budget created successfully');
    
    // Verify budget appears in list
    await expect(financialPage.page.locator(`[data-testid="budget-${budgetData.name.replace(/\s+/g, '-').toLowerCase()}"]`)).toBeVisible();
  });

  test('should track budget vs actual performance', async ({ financialPage }) => {
    // Create budget first
    const budgetData = {
      name: 'Test Budget',
      categories: [
        { name: 'Sales', type: 'income', amount: 10000 },
        { name: 'Feed', type: 'expense', amount: 3000 }
      ]
    };
    
    await DataFixtureHelpers.createTestBudget(budgetData, testFarm.id);
    
    // Add actual transactions
    const actualSales = await TestDataGenerator.generateTransaction('income', { 
      category: 'Sales', 
      amount: 8500 
    });
    const actualFeed = await TestDataGenerator.generateTransaction('expense', { 
      category: 'Feed', 
      amount: 3200 
    });
    
    await DataFixtureHelpers.createTestTransaction(actualSales, testFarm.id);
    await DataFixtureHelpers.createTestTransaction(actualFeed, testFarm.id);
    
    // Refresh page
    await financialPage.page.reload();
    
    // Navigate to budget performance
    await financialPage.page.click('[data-testid="budget-performance-tab"]');
    
    // Verify budget vs actual comparison
    await expect(financialPage.page.locator('[data-testid="budget-performance-chart"]')).toBeVisible();
    
    // Verify variance indicators
    await expect(financialPage.page.locator('[data-testid="sales-variance"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="feed-variance"]')).toBeVisible();
    
    // Check variance calculations
    const salesVariance = await financialPage.page.locator('[data-testid="sales-variance-amount"]').textContent();
    const feedVariance = await financialPage.page.locator('[data-testid="feed-variance-amount"]').textContent();
    
    expect(salesVariance).toContain('-1500'); // 8500 - 10000
    expect(feedVariance).toContain('+200'); // 3200 - 3000
  });

  test('should export financial data', async ({ financialPage, page }) => {
    // Add test transaction
    const transactionData = await TestDataGenerator.generateTransaction('income');
    await DataFixtureHelpers.createTestTransaction(transactionData, testFarm.id);
    
    // Refresh page
    await financialPage.page.reload();
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await financialPage.page.click('[data-testid="export-financial-data-button"]');
    await financialPage.page.click('[data-testid="export-csv-option"]');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('financial-data');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should handle pagination for transactions', async ({ financialPage }) => {
    // Add many test transactions (more than page size)
    for (let i = 0; i < 25; i++) {
      const transactionData = await TestDataGenerator.generateTransaction(i % 2 === 0 ? 'income' : 'expense');
      await DataFixtureHelpers.createTestTransaction(transactionData, testFarm.id);
    }
    
    // Refresh page
    await financialPage.page.reload();
    
    // Verify pagination controls are visible
    await expect(financialPage.page.locator('[data-testid="pagination-controls"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="next-page-button"]')).toBeEnabled();
    
    // Go to next page
    await financialPage.page.click('[data-testid="next-page-button"]');
    
    // Verify page number changed
    await expect(financialPage.page.locator('[data-testid="current-page"]')).toContainText('2');
    
    // Verify previous button is enabled
    await expect(financialPage.page.locator('[data-testid="previous-page-button"]')).toBeEnabled();
  });

  test('should sort transactions by different columns', async ({ financialPage }) => {
    // Add test transactions with different data
    const transaction1 = await TestDataGenerator.generateTransaction('income', { amount: 1000, date: '2024-01-15' });
    const transaction2 = await TestDataGenerator.generateTransaction('expense', { amount: 2500, date: '2024-01-10' });
    const transaction3 = await TestDataGenerator.generateTransaction('income', { amount: 1500, date: '2024-01-20' });
    
    await DataFixtureHelpers.createTestTransaction(transaction1, testFarm.id);
    await DataFixtureHelpers.createTestTransaction(transaction2, testFarm.id);
    await DataFixtureHelpers.createTestTransaction(transaction3, testFarm.id);
    
    // Refresh page
    await financialPage.page.reload();
    
    // Sort by amount (ascending)
    await financialPage.page.click('[data-testid="sort-amount"]');
    
    // Verify sort order
    const amounts = await financialPage.page.locator('[data-testid^="transaction-amount-"]').allTextContents();
    const numericAmounts = amounts.map(a => parseFloat(a.replace(/[^0-9.-]/g, '')));
    
    for (let i = 1; i < numericAmounts.length; i++) {
      expect(Math.abs(numericAmounts[i])).toBeGreaterThanOrEqual(Math.abs(numericAmounts[i - 1]));
    }
    
    // Sort by date (descending)
    await financialPage.page.click('[data-testid="sort-date"]');
    await financialPage.page.click('[data-testid="sort-date"]'); // Second click for descending
    
    // Verify sort order by date (most recent first)
    const dates = await financialPage.page.locator('[data-testid^="transaction-date-"]').allTextContents();
    const parsedDates = dates.map(d => new Date(d));
    
    for (let i = 1; i < parsedDates.length; i++) {
      expect(parsedDates[i].getTime()).toBeLessThanOrEqual(parsedDates[i - 1].getTime());
    }
  });

  test('should handle server errors gracefully', async ({ financialPage, page }) => {
    // Mock server error for transaction creation
    await page.route('**/api/transactions', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      } else {
        route.continue();
      }
    });
    
    const transactionData = await TestDataGenerator.generateTransaction('income');
    
    // Try to add transaction
    await financialPage.clickAddTransaction();
    await financialPage.addTransaction(
      transactionData.type,
      transactionData.category,
      transactionData.amount,
      transactionData.description,
      transactionData.date,
      transactionData.reference,
      transactionData.paymentMethod
    );
    
    // Verify error message
    await expect(financialPage.page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="error-message"]')).toContainText('error');
    
    // Verify modal stays open
    await expect(financialPage.page.locator('[data-testid="add-transaction-modal"]')).toBeVisible();
  });

  test('should maintain data integrity during concurrent operations', async ({ financialPage, context }) => {
    const transactionData = await TestDataGenerator.generateTransaction('income');
    
    // Add transaction in first tab
    await financialPage.clickAddTransaction();
    await financialPage.addTransaction(
      transactionData.type,
      transactionData.category,
      transactionData.amount,
      transactionData.description,
      transactionData.date,
      transactionData.reference,
      transactionData.paymentMethod
    );
    
    // Open second tab and try to add transaction with same reference
    const secondPage = await context.newPage();
    await secondPage.goto('/financial');
    
    const secondFinancialPage = new (financialPage.constructor as any)(secondPage);
    await secondFinancialPage.clickAddTransaction();
    await secondFinancialPage.addTransaction(
      'expense',
      'Feed',
      500,
      'Different description',
      transactionData.date,
      transactionData.reference, // Same reference
      'Cash'
    );
    
    // Verify duplicate error in second tab
    await expect(secondPage.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(secondPage.locator('[data-testid="error-message"]')).toContainText('already exists');
    
    await secondPage.close();
  });

  test('should calculate financial metrics correctly', async ({ financialPage }) => {
    // Add test transactions with known values
    const transactions = [
      await TestDataGenerator.generateTransaction('income', { amount: 10000, category: 'Sales' }),
      await TestDataGenerator.generateTransaction('income', { amount: 5000, category: 'Services' }),
      await TestDataGenerator.generateTransaction('expense', { amount: 3000, category: 'Feed' }),
      await TestDataGenerator.generateTransaction('expense', { amount: 2000, category: 'Labor' }),
      await TestDataGenerator.generateTransaction('expense', { amount: 1000, category: 'Equipment' })
    ];
    
    for (const transaction of transactions) {
      await DataFixtureHelpers.createTestTransaction(transaction, testFarm.id);
    }
    
    // Refresh page
    await financialPage.page.reload();
    
    // Verify calculated metrics
    const totalIncome = await financialPage.getTotalIncome();
    const totalExpenses = await financialPage.getTotalExpenses();
    const netProfit = await financialPage.getNetProfit();
    const profitMargin = await financialPage.getProfitMargin();
    
    expect(totalIncome).toBe(15000); // 10000 + 5000
    expect(totalExpenses).toBe(6000); // 3000 + 2000 + 1000
    expect(netProfit).toBe(9000); // 15000 - 6000
    expect(profitMargin).toBe(60); // (9000 / 15000) * 100
  });

  test('should display financial trends and charts', async ({ financialPage }) => {
    // Add transactions across different months
    const monthlyTransactions = [
      await TestDataGenerator.generateTransaction('income', { amount: 8000, date: '2024-01-15' }),
      await TestDataGenerator.generateTransaction('expense', { amount: 3000, date: '2024-01-20' }),
      await TestDataGenerator.generateTransaction('income', { amount: 9500, date: '2024-02-15' }),
      await TestDataGenerator.generateTransaction('expense', { amount: 3500, date: '2024-02-20' }),
      await TestDataGenerator.generateTransaction('income', { amount: 11000, date: '2024-03-15' }),
      await TestDataGenerator.generateTransaction('expense', { amount: 4000, date: '2024-03-20' })
    ];
    
    for (const transaction of monthlyTransactions) {
      await DataFixtureHelpers.createTestTransaction(transaction, testFarm.id);
    }
    
    // Refresh page
    await financialPage.page.reload();
    
    // Set date range to show all data
    await financialPage.setDateRange('2024-01-01', '2024-03-31');
    
    // Verify charts are displayed
    await expect(financialPage.page.locator('[data-testid="income-expense-chart"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="category-breakdown-chart"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="monthly-trend-chart"]')).toBeVisible();
    
    // Verify chart data points
    const chartDataPoints = await financialPage.page.locator('[data-testid="chart-data-point"]').count();
    expect(chartDataPoints).toBeGreaterThan(0);
    
    // Verify trend indicators
    await expect(financialPage.page.locator('[data-testid="income-trend"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="expense-trend"]')).toBeVisible();
    await expect(financialPage.page.locator('[data-testid="profit-trend"]')).toBeVisible();
  });
});
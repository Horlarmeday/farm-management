import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Financial page object model
 * Handles financial reporting and management functionality
 */
export class FinancialPage extends BasePage {
  // Selectors
  private readonly selectors = {
    // Main container
    financialContainer: '[data-testid="financial-container"]',
    
    // Header and navigation
    pageTitle: '[data-testid="page-title"]',
    dashboardTab: '[data-testid="dashboard-tab"]',
    transactionsTab: '[data-testid="transactions-tab"]',
    reportsTab: '[data-testid="reports-tab"]',
    budgetTab: '[data-testid="budget-tab"]',
    
    // Dashboard widgets
    totalRevenueWidget: '[data-testid="total-revenue-widget"]',
    totalExpensesWidget: '[data-testid="total-expenses-widget"]',
    netProfitWidget: '[data-testid="net-profit-widget"]',
    cashFlowWidget: '[data-testid="cash-flow-widget"]',
    
    // Date range picker
    dateRangePicker: '[data-testid="date-range-picker"]',
    startDateInput: '[data-testid="start-date-input"]',
    endDateInput: '[data-testid="end-date-input"]',
    applyDateRangeButton: '[data-testid="apply-date-range"]',
    
    // Quick date filters
    thisMonthButton: '[data-testid="this-month-filter"]',
    lastMonthButton: '[data-testid="last-month-filter"]',
    thisQuarterButton: '[data-testid="this-quarter-filter"]',
    thisYearButton: '[data-testid="this-year-filter"]',
    
    // Transactions section
    addTransactionButton: '[data-testid="add-transaction-button"]',
    transactionsList: '[data-testid="transactions-list"]',
    transactionRow: '[data-testid="transaction-row"]',
    transactionSearch: '[data-testid="transaction-search"]',
    transactionTypeFilter: '[data-testid="transaction-type-filter"]',
    transactionCategoryFilter: '[data-testid="transaction-category-filter"]',
    
    // Transaction form
    transactionForm: '[data-testid="transaction-form"]',
    transactionTypeSelect: '[data-testid="transaction-type-select"]',
    transactionCategorySelect: '[data-testid="transaction-category-select"]',
    transactionAmountInput: '[data-testid="transaction-amount-input"]',
    transactionDescriptionInput: '[data-testid="transaction-description-input"]',
    transactionDateInput: '[data-testid="transaction-date-input"]',
    transactionReferenceInput: '[data-testid="transaction-reference-input"]',
    transactionNotesTextarea: '[data-testid="transaction-notes-textarea"]',
    saveTransactionButton: '[data-testid="save-transaction-button"]',
    cancelTransactionButton: '[data-testid="cancel-transaction-button"]',
    
    // Reports section
    profitLossReportButton: '[data-testid="profit-loss-report-button"]',
    cashFlowReportButton: '[data-testid="cash-flow-report-button"]',
    expenseReportButton: '[data-testid="expense-report-button"]',
    revenueReportButton: '[data-testid="revenue-report-button"]',
    taxReportButton: '[data-testid="tax-report-button"]',
    
    // Report display
    reportContainer: '[data-testid="report-container"]',
    reportTitle: '[data-testid="report-title"]',
    reportChart: '[data-testid="report-chart"]',
    reportTable: '[data-testid="report-table"]',
    exportReportButton: '[data-testid="export-report-button"]',
    printReportButton: '[data-testid="print-report-button"]',
    
    // Budget section
    createBudgetButton: '[data-testid="create-budget-button"]',
    budgetsList: '[data-testid="budgets-list"]',
    budgetCard: '[data-testid="budget-card"]',
    budgetProgress: '[data-testid="budget-progress"]',
    
    // Budget form
    budgetForm: '[data-testid="budget-form"]',
    budgetNameInput: '[data-testid="budget-name-input"]',
    budgetCategorySelect: '[data-testid="budget-category-select"]',
    budgetAmountInput: '[data-testid="budget-amount-input"]',
    budgetPeriodSelect: '[data-testid="budget-period-select"]',
    budgetStartDateInput: '[data-testid="budget-start-date-input"]',
    budgetEndDateInput: '[data-testid="budget-end-date-input"]',
    saveBudgetButton: '[data-testid="save-budget-button"]',
    
    // Charts and analytics
    revenueChart: '[data-testid="revenue-chart"]',
    expenseChart: '[data-testid="expense-chart"]',
    profitChart: '[data-testid="profit-chart"]',
    categoryBreakdownChart: '[data-testid="category-breakdown-chart"]',
    
    // Pagination
    pagination: '[data-testid="pagination"]',
    nextPageButton: '[data-testid="next-page"]',
    prevPageButton: '[data-testid="prev-page"]',
    pageInfo: '[data-testid="page-info"]',
    
    // Loading and empty states
    loadingSpinner: '[data-testid="financial-loading"]',
    emptyTransactions: '[data-testid="empty-transactions"]',
    emptyBudgets: '[data-testid="empty-budgets"]',
    
    // Bulk actions
    selectAllTransactions: '[data-testid="select-all-transactions"]',
    bulkActionsBar: '[data-testid="bulk-actions-bar"]',
    bulkDeleteButton: '[data-testid="bulk-delete-button"]',
    bulkCategorizeButton: '[data-testid="bulk-categorize-button"]',
    
    // Export options
    exportDropdown: '[data-testid="export-dropdown"]',
    exportCsvButton: '[data-testid="export-csv-button"]',
    exportPdfButton: '[data-testid="export-pdf-button"]',
    exportExcelButton: '[data-testid="export-excel-button"]'
  };

  constructor(page: Page) {
    super(page, '/financial');
  }

  /**
   * Navigate to financial page
   */
  async gotoFinancial(): Promise<void> {
    await this.page.goto('/financial');
    await this.waitForElement(this.selectors.financialContainer);
    await this.waitForLoadingComplete();
  }

  /**
   * Navigate to specific financial tab
   */
  async gotoTab(tab: 'dashboard' | 'transactions' | 'reports' | 'budget'): Promise<void> {
    const tabSelector = this.selectors[`${tab}Tab`];
    await this.clickElement(tabSelector);
    await this.waitForLoadingComplete();
  }

  /**
   * Set date range for financial data
   */
  async setDateRange(startDate: string, endDate: string): Promise<void> {
    await this.clickElement(this.selectors.dateRangePicker);
    await this.fillField(this.selectors.startDateInput, startDate);
    await this.fillField(this.selectors.endDateInput, endDate);
    await this.clickElement(this.selectors.applyDateRangeButton);
    await this.waitForLoadingComplete();
  }

  /**
   * Apply quick date filter
   */
  async applyQuickDateFilter(filter: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear'): Promise<void> {
    const filterSelector = this.selectors[`${filter}Button`];
    await this.clickElement(filterSelector);
    await this.waitForLoadingComplete();
  }

  /**
   * Get financial widget values
   */
  async getFinancialWidgets(): Promise<{
    totalRevenue: string;
    totalExpenses: string;
    netProfit: string;
    cashFlow: string;
  }> {
    return {
      totalRevenue: await this.getElementText(`${this.selectors.totalRevenueWidget} [data-testid="widget-value"]`),
      totalExpenses: await this.getElementText(`${this.selectors.totalExpensesWidget} [data-testid="widget-value"]`),
      netProfit: await this.getElementText(`${this.selectors.netProfitWidget} [data-testid="widget-value"]`),
      cashFlow: await this.getElementText(`${this.selectors.cashFlowWidget} [data-testid="widget-value"]`)
    };
  }

  /**
   * Add new transaction
   */
  async addTransaction(transactionData: {
    type: 'income' | 'expense';
    category: string;
    amount: string;
    description: string;
    date: string;
    reference?: string;
    notes?: string;
  }): Promise<void> {
    await this.gotoTab('transactions');
    await this.clickElement(this.selectors.addTransactionButton);
    await this.waitForElement(this.selectors.transactionForm);
    
    // Fill transaction form
    await this.selectDropdownOption(this.selectors.transactionTypeSelect, transactionData.type);
    await this.selectDropdownOption(this.selectors.transactionCategorySelect, transactionData.category);
    await this.fillField(this.selectors.transactionAmountInput, transactionData.amount);
    await this.fillField(this.selectors.transactionDescriptionInput, transactionData.description);
    await this.fillField(this.selectors.transactionDateInput, transactionData.date);
    
    if (transactionData.reference) {
      await this.fillField(this.selectors.transactionReferenceInput, transactionData.reference);
    }
    
    if (transactionData.notes) {
      await this.fillField(this.selectors.transactionNotesTextarea, transactionData.notes);
    }
    
    // Save transaction
    await this.clickElement(this.selectors.saveTransactionButton);
    await this.verifyToast('Transaction added successfully', 'success');
    await this.waitForElement(this.selectors.transactionsList);
  }

  /**
   * Search transactions
   */
  async searchTransactions(searchTerm: string): Promise<void> {
    await this.gotoTab('transactions');
    await this.fillField(this.selectors.transactionSearch, searchTerm);
    await this.waitForLoadingComplete();
  }

  /**
   * Filter transactions by type
   */
  async filterTransactionsByType(type: string): Promise<void> {
    await this.selectDropdownOption(this.selectors.transactionTypeFilter, type);
    await this.waitForLoadingComplete();
  }

  /**
   * Filter transactions by category
   */
  async filterTransactionsByCategory(category: string): Promise<void> {
    await this.selectDropdownOption(this.selectors.transactionCategoryFilter, category);
    await this.waitForLoadingComplete();
  }

  /**
   * Get transaction count
   */
  async getTransactionCount(): Promise<number> {
    const rows = this.page.locator(this.selectors.transactionRow);
    return await rows.count();
  }

  /**
   * Edit transaction
   */
  async editTransaction(transactionId: string, updates: Partial<{
    amount: string;
    description: string;
    category: string;
    notes: string;
  }>): Promise<void> {
    const transactionRow = this.page.locator(`[data-testid="transaction-${transactionId}"]`);
    const editButton = transactionRow.locator('[data-testid="edit-transaction-button"]');
    await editButton.click();
    
    await this.waitForElement(this.selectors.transactionForm);
    
    // Update fields
    if (updates.amount) {
      await this.fillField(this.selectors.transactionAmountInput, updates.amount);
    }
    
    if (updates.description) {
      await this.fillField(this.selectors.transactionDescriptionInput, updates.description);
    }
    
    if (updates.category) {
      await this.selectDropdownOption(this.selectors.transactionCategorySelect, updates.category);
    }
    
    if (updates.notes) {
      await this.fillField(this.selectors.transactionNotesTextarea, updates.notes);
    }
    
    // Save changes
    await this.clickElement(this.selectors.saveTransactionButton);
    await this.verifyToast('Transaction updated successfully', 'success');
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(transactionId: string): Promise<void> {
    const transactionRow = this.page.locator(`[data-testid="transaction-${transactionId}"]`);
    const deleteButton = transactionRow.locator('[data-testid="delete-transaction-button"]');
    await deleteButton.click();
    
    // Confirm deletion
    await this.clickElement('[data-testid="confirm-delete-button"]');
    await this.verifyToast('Transaction deleted successfully', 'success');
  }

  /**
   * Generate profit & loss report
   */
  async generateProfitLossReport(): Promise<void> {
    await this.gotoTab('reports');
    await this.clickElement(this.selectors.profitLossReportButton);
    await this.waitForElement(this.selectors.reportContainer);
    await this.waitForLoadingComplete();
  }

  /**
   * Generate cash flow report
   */
  async generateCashFlowReport(): Promise<void> {
    await this.gotoTab('reports');
    await this.clickElement(this.selectors.cashFlowReportButton);
    await this.waitForElement(this.selectors.reportContainer);
    await this.waitForLoadingComplete();
  }

  /**
   * Generate expense report
   */
  async generateExpenseReport(): Promise<void> {
    await this.gotoTab('reports');
    await this.clickElement(this.selectors.expenseReportButton);
    await this.waitForElement(this.selectors.reportContainer);
    await this.waitForLoadingComplete();
  }

  /**
   * Generate revenue report
   */
  async generateRevenueReport(): Promise<void> {
    await this.gotoTab('reports');
    await this.clickElement(this.selectors.revenueReportButton);
    await this.waitForElement(this.selectors.reportContainer);
    await this.waitForLoadingComplete();
  }

  /**
   * Export report
   */
  async exportReport(format: 'csv' | 'pdf' | 'excel'): Promise<void> {
    await this.clickElement(this.selectors.exportDropdown);
    
    const exportButton = this.selectors[`export${format.charAt(0).toUpperCase() + format.slice(1)}Button`];
    await this.clickElement(exportButton);
    
    // Wait for download
    const downloadPromise = this.page.waitForEvent('download');
    await downloadPromise;
    
    await this.verifyToast(`Report exported as ${format.toUpperCase()} successfully`, 'success');
  }

  /**
   * Print report
   */
  async printReport(): Promise<void> {
    await this.clickElement(this.selectors.printReportButton);
    
    // Wait for print dialog (this will open browser print dialog)
    await this.page.waitForTimeout(1000);
  }

  /**
   * Create budget
   */
  async createBudget(budgetData: {
    name: string;
    category: string;
    amount: string;
    period: string;
    startDate: string;
    endDate: string;
  }): Promise<void> {
    await this.gotoTab('budget');
    await this.clickElement(this.selectors.createBudgetButton);
    await this.waitForElement(this.selectors.budgetForm);
    
    // Fill budget form
    await this.fillField(this.selectors.budgetNameInput, budgetData.name);
    await this.selectDropdownOption(this.selectors.budgetCategorySelect, budgetData.category);
    await this.fillField(this.selectors.budgetAmountInput, budgetData.amount);
    await this.selectDropdownOption(this.selectors.budgetPeriodSelect, budgetData.period);
    await this.fillField(this.selectors.budgetStartDateInput, budgetData.startDate);
    await this.fillField(this.selectors.budgetEndDateInput, budgetData.endDate);
    
    // Save budget
    await this.clickElement(this.selectors.saveBudgetButton);
    await this.verifyToast('Budget created successfully', 'success');
    await this.waitForElement(this.selectors.budgetsList);
  }

  /**
   * Get budget progress
   */
  async getBudgetProgress(budgetName: string): Promise<{
    spent: string;
    remaining: string;
    percentage: number;
  }> {
    const budgetCard = this.page.locator(`[data-testid="budget-${budgetName.replace(/\s+/g, '-').toLowerCase()}"]`);
    
    return {
      spent: await budgetCard.locator('[data-testid="budget-spent"]').textContent() || '$0',
      remaining: await budgetCard.locator('[data-testid="budget-remaining"]').textContent() || '$0',
      percentage: parseInt(await budgetCard.locator('[data-testid="budget-percentage"]').textContent() || '0')
    };
  }

  /**
   * Edit budget
   */
  async editBudget(budgetName: string, updates: Partial<{
    amount: string;
    period: string;
  }>): Promise<void> {
    const budgetCard = this.page.locator(`[data-testid="budget-${budgetName.replace(/\s+/g, '-').toLowerCase()}"]`);
    const editButton = budgetCard.locator('[data-testid="edit-budget-button"]');
    await editButton.click();
    
    await this.waitForElement(this.selectors.budgetForm);
    
    // Update fields
    if (updates.amount) {
      await this.fillField(this.selectors.budgetAmountInput, updates.amount);
    }
    
    if (updates.period) {
      await this.selectDropdownOption(this.selectors.budgetPeriodSelect, updates.period);
    }
    
    // Save changes
    await this.clickElement(this.selectors.saveBudgetButton);
    await this.verifyToast('Budget updated successfully', 'success');
  }

  /**
   * Delete budget
   */
  async deleteBudget(budgetName: string): Promise<void> {
    const budgetCard = this.page.locator(`[data-testid="budget-${budgetName.replace(/\s+/g, '-').toLowerCase()}"]`);
    const deleteButton = budgetCard.locator('[data-testid="delete-budget-button"]');
    await deleteButton.click();
    
    // Confirm deletion
    await this.clickElement('[data-testid="confirm-delete-button"]');
    await this.verifyToast('Budget deleted successfully', 'success');
  }

  /**
   * Select multiple transactions for bulk actions
   */
  async selectTransactionsForBulkAction(transactionIds: string[]): Promise<void> {
    for (const transactionId of transactionIds) {
      const checkbox = this.page.locator(`[data-testid="select-transaction-${transactionId}"]`);
      await checkbox.check();
    }
    
    // Verify bulk actions bar appears
    await this.waitForElement(this.selectors.bulkActionsBar);
  }

  /**
   * Perform bulk delete transactions
   */
  async bulkDeleteTransactions(): Promise<void> {
    await this.clickElement(this.selectors.bulkDeleteButton);
    
    // Confirm bulk deletion
    await this.clickElement('[data-testid="confirm-bulk-delete-button"]');
    await this.verifyToast('Selected transactions deleted successfully', 'success');
  }

  /**
   * Perform bulk categorize transactions
   */
  async bulkCategorizeTransactions(category: string): Promise<void> {
    await this.clickElement(this.selectors.bulkCategorizeButton);
    
    await this.waitForElement('[data-testid="bulk-categorize-form"]');
    await this.selectDropdownOption('[data-testid="bulk-category-select"]', category);
    await this.clickElement('[data-testid="save-bulk-categorize-button"]');
    
    await this.verifyToast('Selected transactions categorized successfully', 'success');
  }

  /**
   * Navigate to next page
   */
  async goToNextPage(): Promise<void> {
    await this.clickElement(this.selectors.nextPageButton);
    await this.waitForLoadingComplete();
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.clickElement(this.selectors.prevPageButton);
    await this.waitForLoadingComplete();
  }

  /**
   * Verify chart is displayed
   */
  async verifyChartDisplayed(chartType: 'revenue' | 'expense' | 'profit' | 'categoryBreakdown'): Promise<void> {
    const chartSelector = this.selectors[`${chartType}Chart`];
    await expect(this.page.locator(chartSelector)).toBeVisible();
  }

  /**
   * Verify transaction exists
   */
  async verifyTransactionExists(transactionId: string): Promise<boolean> {
    return await this.elementExists(`[data-testid="transaction-${transactionId}"]`);
  }

  /**
   * Verify budget exists
   */
  async verifyBudgetExists(budgetName: string): Promise<boolean> {
    return await this.elementExists(`[data-testid="budget-${budgetName.replace(/\s+/g, '-').toLowerCase()}"]`);
  }

  /**
   * Verify empty state for transactions
   */
  async verifyEmptyTransactions(): Promise<void> {
    await expect(this.page.locator(this.selectors.emptyTransactions)).toBeVisible();
    await expect(this.page.locator(this.selectors.emptyTransactions)).toContainText('No transactions found');
  }

  /**
   * Verify empty state for budgets
   */
  async verifyEmptyBudgets(): Promise<void> {
    await expect(this.page.locator(this.selectors.emptyBudgets)).toBeVisible();
    await expect(this.page.locator(this.selectors.emptyBudgets)).toContainText('No budgets found');
  }

  /**
   * Get report title
   */
  async getReportTitle(): Promise<string> {
    return await this.getElementText(this.selectors.reportTitle);
  }

  /**
   * Verify report data is displayed
   */
  async verifyReportDataDisplayed(): Promise<void> {
    await expect(this.page.locator(this.selectors.reportTable)).toBeVisible();
    
    // Check if table has data rows
    const dataRows = this.page.locator(`${this.selectors.reportTable} tbody tr`);
    await expect(dataRows.first()).toBeVisible();
  }
}
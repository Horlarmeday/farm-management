import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Dashboard page object model
 * Handles main dashboard functionality and navigation
 */
export class DashboardPage extends BasePage {
  // Selectors
  private readonly selectors = {
    // Main dashboard
    dashboardContainer: '[data-testid="dashboard-container"]',
    welcomeMessage: '[data-testid="welcome-message"]',
    
    // Navigation
    sidebar: '[data-testid="sidebar"]',
    navLivestock: '[data-testid="nav-livestock"]',
    navInventory: '[data-testid="nav-inventory"]',
    navFinancial: '[data-testid="nav-financial"]',
    navReports: '[data-testid="nav-reports"]',
    navSettings: '[data-testid="nav-settings"]',
    
    // Header
    header: '[data-testid="header"]',
    userMenu: '[data-testid="user-menu"]',
    logoutButton: '[data-testid="logout-button"]',
    profileButton: '[data-testid="profile-button"]',
    
    // Dashboard widgets
    livestockSummary: '[data-testid="livestock-summary-widget"]',
    inventorySummary: '[data-testid="inventory-summary-widget"]',
    financialSummary: '[data-testid="financial-summary-widget"]',
    recentActivities: '[data-testid="recent-activities-widget"]',
    
    // Quick actions
    quickActions: '[data-testid="quick-actions"]',
    addLivestockButton: '[data-testid="quick-add-livestock"]',
    addInventoryButton: '[data-testid="quick-add-inventory"]',
    recordExpenseButton: '[data-testid="quick-record-expense"]',
    
    // Statistics
    totalLivestock: '[data-testid="total-livestock-count"]',
    totalInventoryValue: '[data-testid="total-inventory-value"]',
    monthlyRevenue: '[data-testid="monthly-revenue"]',
    monthlyExpenses: '[data-testid="monthly-expenses"]',
    
    // Alerts and notifications
    alertsPanel: '[data-testid="alerts-panel"]',
    lowStockAlerts: '[data-testid="low-stock-alerts"]',
    healthAlerts: '[data-testid="health-alerts"]',
    
    // Loading states
    dashboardLoading: '[data-testid="dashboard-loading"]',
    widgetLoading: '[data-testid*="widget-loading"]'
  };

  constructor(page: Page) {
    super(page, '/dashboard');
  }

  /**
   * Navigate to dashboard and wait for load
   */
  async gotoDashboard(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.waitForElement(this.selectors.dashboardContainer);
    await this.waitForLoadingComplete();
  }

  /**
   * Verify dashboard is loaded correctly
   */
  async verifyDashboardLoaded(): Promise<void> {
    // Check main container is visible
    await expect(this.page.locator(this.selectors.dashboardContainer)).toBeVisible();
    
    // Check navigation is present
    await expect(this.page.locator(this.selectors.sidebar)).toBeVisible();
    
    // Check header is present
    await expect(this.page.locator(this.selectors.header)).toBeVisible();
    
    // Verify welcome message
    const welcomeMessage = this.page.locator(this.selectors.welcomeMessage);
    await expect(welcomeMessage).toBeVisible();
  }

  /**
   * Navigate to livestock management
   */
  async navigateToLivestock(): Promise<void> {
    await this.waitForNavigation(async () => {
      await this.clickElement(this.selectors.navLivestock);
    }, '**/livestock');
  }

  /**
   * Navigate to inventory management
   */
  async navigateToInventory(): Promise<void> {
    await this.waitForNavigation(async () => {
      await this.clickElement(this.selectors.navInventory);
    }, '**/inventory');
  }

  /**
   * Navigate to financial management
   */
  async navigateToFinancial(): Promise<void> {
    await this.waitForNavigation(async () => {
      await this.clickElement(this.selectors.navFinancial);
    }, '**/financial');
  }

  /**
   * Navigate to reports
   */
  async navigateToReports(): Promise<void> {
    await this.waitForNavigation(async () => {
      await this.clickElement(this.selectors.navReports);
    }, '**/reports');
  }

  /**
   * Navigate to settings
   */
  async navigateToSettings(): Promise<void> {
    await this.waitForNavigation(async () => {
      await this.clickElement(this.selectors.navSettings);
    }, '**/settings');
  }

  /**
   * Get livestock summary data
   */
  async getLivestockSummary(): Promise<{
    total: number;
    healthy: number;
    needsAttention: number;
  }> {
    const widget = this.page.locator(this.selectors.livestockSummary);
    await expect(widget).toBeVisible();
    
    const totalText = await widget.locator('[data-testid="livestock-total"]').textContent();
    const healthyText = await widget.locator('[data-testid="livestock-healthy"]').textContent();
    const attentionText = await widget.locator('[data-testid="livestock-attention"]').textContent();
    
    return {
      total: parseInt(totalText || '0'),
      healthy: parseInt(healthyText || '0'),
      needsAttention: parseInt(attentionText || '0')
    };
  }

  /**
   * Get inventory summary data
   */
  async getInventorySummary(): Promise<{
    totalValue: number;
    lowStockItems: number;
    categories: number;
  }> {
    const widget = this.page.locator(this.selectors.inventorySummary);
    await expect(widget).toBeVisible();
    
    const valueText = await widget.locator('[data-testid="inventory-value"]').textContent();
    const lowStockText = await widget.locator('[data-testid="inventory-low-stock"]').textContent();
    const categoriesText = await widget.locator('[data-testid="inventory-categories"]').textContent();
    
    return {
      totalValue: parseFloat(valueText?.replace(/[^0-9.]/g, '') || '0'),
      lowStockItems: parseInt(lowStockText || '0'),
      categories: parseInt(categoriesText || '0')
    };
  }

  /**
   * Get financial summary data
   */
  async getFinancialSummary(): Promise<{
    monthlyRevenue: number;
    monthlyExpenses: number;
    profit: number;
  }> {
    const widget = this.page.locator(this.selectors.financialSummary);
    await expect(widget).toBeVisible();
    
    const revenueText = await widget.locator('[data-testid="monthly-revenue"]').textContent();
    const expensesText = await widget.locator('[data-testid="monthly-expenses"]').textContent();
    const profitText = await widget.locator('[data-testid="monthly-profit"]').textContent();
    
    const revenue = parseFloat(revenueText?.replace(/[^0-9.-]/g, '') || '0');
    const expenses = parseFloat(expensesText?.replace(/[^0-9.-]/g, '') || '0');
    const profit = parseFloat(profitText?.replace(/[^0-9.-]/g, '') || '0');
    
    return { monthlyRevenue: revenue, monthlyExpenses: expenses, profit };
  }

  /**
   * Use quick action to add livestock
   */
  async quickAddLivestock(): Promise<void> {
    await this.clickElement(this.selectors.addLivestockButton);
    // This should open a modal or navigate to add livestock page
    await this.page.waitForURL('**/livestock/add');
  }

  /**
   * Use quick action to add inventory
   */
  async quickAddInventory(): Promise<void> {
    await this.clickElement(this.selectors.addInventoryButton);
    // This should open a modal or navigate to add inventory page
    await this.page.waitForURL('**/inventory/add');
  }

  /**
   * Use quick action to record expense
   */
  async quickRecordExpense(): Promise<void> {
    await this.clickElement(this.selectors.recordExpenseButton);
    // This should open a modal or navigate to add expense page
    await this.page.waitForURL('**/financial/expenses/add');
  }

  /**
   * Check for low stock alerts
   */
  async checkLowStockAlerts(): Promise<string[]> {
    const alertsPanel = this.page.locator(this.selectors.lowStockAlerts);
    
    if (await alertsPanel.isVisible()) {
      const alertItems = alertsPanel.locator('[data-testid="alert-item"]');
      const count = await alertItems.count();
      const alerts: string[] = [];
      
      for (let i = 0; i < count; i++) {
        const alertText = await alertItems.nth(i).textContent();
        if (alertText) alerts.push(alertText);
      }
      
      return alerts;
    }
    
    return [];
  }

  /**
   * Check for health alerts
   */
  async checkHealthAlerts(): Promise<string[]> {
    const alertsPanel = this.page.locator(this.selectors.healthAlerts);
    
    if (await alertsPanel.isVisible()) {
      const alertItems = alertsPanel.locator('[data-testid="alert-item"]');
      const count = await alertItems.count();
      const alerts: string[] = [];
      
      for (let i = 0; i < count; i++) {
        const alertText = await alertItems.nth(i).textContent();
        if (alertText) alerts.push(alertText);
      }
      
      return alerts;
    }
    
    return [];
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(): Promise<Array<{
    type: string;
    description: string;
    timestamp: string;
  }>> {
    const widget = this.page.locator(this.selectors.recentActivities);
    await expect(widget).toBeVisible();
    
    const activityItems = widget.locator('[data-testid="activity-item"]');
    const count = await activityItems.count();
    const activities = [];
    
    for (let i = 0; i < count; i++) {
      const item = activityItems.nth(i);
      const type = await item.locator('[data-testid="activity-type"]').textContent() || '';
      const description = await item.locator('[data-testid="activity-description"]').textContent() || '';
      const timestamp = await item.locator('[data-testid="activity-timestamp"]').textContent() || '';
      
      activities.push({ type, description, timestamp });
    }
    
    return activities;
  }

  /**
   * Open user menu
   */
  async openUserMenu(): Promise<void> {
    await this.clickElement(this.selectors.userMenu);
  }

  /**
   * Logout from dashboard
   */
  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.waitForNavigation(async () => {
      await this.clickElement(this.selectors.logoutButton);
    }, '**/auth/login');
  }

  /**
   * Verify dashboard statistics are loaded
   */
  async verifyStatisticsLoaded(): Promise<void> {
    // Wait for all widgets to load
    await expect(this.page.locator(this.selectors.livestockSummary)).toBeVisible();
    await expect(this.page.locator(this.selectors.inventorySummary)).toBeVisible();
    await expect(this.page.locator(this.selectors.financialSummary)).toBeVisible();
    
    // Verify no loading states are visible
    await expect(this.page.locator(this.selectors.widgetLoading)).toHaveCount(0);
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard(): Promise<void> {
    await this.reload();
    await this.waitForElement(this.selectors.dashboardContainer);
    await this.waitForLoadingComplete();
  }
}
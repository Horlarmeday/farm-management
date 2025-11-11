import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Inventory page object model
 * Handles inventory management functionality
 */
export class InventoryPage extends BasePage {
  // Selectors
  private readonly selectors = {
    // Main container
    inventoryContainer: '[data-testid="inventory-container"]',
    
    // Header and actions
    pageTitle: '[data-testid="page-title"]',
    addItemButton: '[data-testid="add-item-button"]',
    importButton: '[data-testid="import-inventory-button"]',
    exportButton: '[data-testid="export-inventory-button"]',
    
    // Search and filters
    searchInput: '[data-testid="inventory-search"]',
    categoryFilter: '[data-testid="category-filter"]',
    statusFilter: '[data-testid="status-filter"]',
    locationFilter: '[data-testid="location-filter"]',
    lowStockFilter: '[data-testid="low-stock-filter"]',
    clearFiltersButton: '[data-testid="clear-filters"]',
    
    // Inventory list/grid
    inventoryGrid: '[data-testid="inventory-grid"]',
    inventoryCard: '[data-testid="inventory-card"]',
    inventoryTable: '[data-testid="inventory-table"]',
    inventoryRow: '[data-testid="inventory-row"]',
    
    // View toggle
    gridViewButton: '[data-testid="grid-view-button"]',
    tableViewButton: '[data-testid="table-view-button"]',
    
    // Item form (add/edit)
    itemForm: '[data-testid="item-form"]',
    nameInput: '[data-testid="item-name-input"]',
    categorySelect: '[data-testid="category-select"]',
    descriptionInput: '[data-testid="description-input"]',
    skuInput: '[data-testid="sku-input"]',
    quantityInput: '[data-testid="quantity-input"]',
    unitSelect: '[data-testid="unit-select"]',
    minStockInput: '[data-testid="min-stock-input"]',
    maxStockInput: '[data-testid="max-stock-input"]',
    costInput: '[data-testid="cost-input"]',
    priceInput: '[data-testid="price-input"]',
    locationSelect: '[data-testid="location-select"]',
    supplierInput: '[data-testid="supplier-input"]',
    expiryDateInput: '[data-testid="expiry-date-input"]',
    notesTextarea: '[data-testid="notes-textarea"]',
    saveButton: '[data-testid="save-item-button"]',
    cancelButton: '[data-testid="cancel-button"]',
    
    // Item details
    itemDetails: '[data-testid="item-details"]',
    editButton: '[data-testid="edit-item-button"]',
    deleteButton: '[data-testid="delete-item-button"]',
    
    // Stock management
    stockTab: '[data-testid="stock-tab"]',
    addStockButton: '[data-testid="add-stock-button"]',
    removeStockButton: '[data-testid="remove-stock-button"]',
    stockMovementForm: '[data-testid="stock-movement-form"]',
    movementTypeSelect: '[data-testid="movement-type-select"]',
    movementQuantityInput: '[data-testid="movement-quantity-input"]',
    movementReasonInput: '[data-testid="movement-reason-input"]',
    movementDateInput: '[data-testid="movement-date-input"]',
    stockHistoryList: '[data-testid="stock-history-list"]',
    
    // Purchase orders
    purchaseTab: '[data-testid="purchase-tab"]',
    createPurchaseOrderButton: '[data-testid="create-purchase-order-button"]',
    purchaseOrderForm: '[data-testid="purchase-order-form"]',
    purchaseOrdersList: '[data-testid="purchase-orders-list"]',
    
    // Low stock alerts
    lowStockAlert: '[data-testid="low-stock-alert"]',
    lowStockBadge: '[data-testid="low-stock-badge"]',
    reorderButton: '[data-testid="reorder-button"]',
    
    // Pagination
    pagination: '[data-testid="pagination"]',
    nextPageButton: '[data-testid="next-page"]',
    prevPageButton: '[data-testid="prev-page"]',
    pageInfo: '[data-testid="page-info"]',
    
    // Loading and empty states
    loadingSpinner: '[data-testid="inventory-loading"]',
    emptyState: '[data-testid="empty-inventory"]',
    
    // Bulk actions
    selectAllCheckbox: '[data-testid="select-all-items"]',
    bulkActionsBar: '[data-testid="bulk-actions-bar"]',
    bulkDeleteButton: '[data-testid="bulk-delete-button"]',
    bulkExportButton: '[data-testid="bulk-export-button"]',
    bulkUpdateButton: '[data-testid="bulk-update-button"]',
    
    // Reports
    reportsTab: '[data-testid="reports-tab"]',
    stockReportButton: '[data-testid="stock-report-button"]',
    valuationReportButton: '[data-testid="valuation-report-button"]',
    movementReportButton: '[data-testid="movement-report-button"]'
  };

  constructor(page: Page) {
    super(page, '/inventory');
  }

  /**
   * Navigate to inventory page
   */
  async gotoInventory(): Promise<void> {
    await this.page.goto('/inventory');
    await this.waitForElement(this.selectors.inventoryContainer);
    await this.waitForLoadingComplete();
  }

  /**
   * Add new inventory item
   */
  async addInventoryItem(itemData: {
    name: string;
    category: string;
    description?: string;
    sku?: string;
    quantity: string;
    unit: string;
    minStock?: string;
    maxStock?: string;
    cost?: string;
    price?: string;
    location?: string;
    supplier?: string;
    expiryDate?: string;
    notes?: string;
  }): Promise<void> {
    await this.clickElement(this.selectors.addItemButton);
    await this.waitForElement(this.selectors.itemForm);
    
    // Fill form fields
    await this.fillField(this.selectors.nameInput, itemData.name);
    await this.selectDropdownOption(this.selectors.categorySelect, itemData.category);
    
    if (itemData.description) {
      await this.fillField(this.selectors.descriptionInput, itemData.description);
    }
    
    if (itemData.sku) {
      await this.fillField(this.selectors.skuInput, itemData.sku);
    }
    
    await this.fillField(this.selectors.quantityInput, itemData.quantity);
    await this.selectDropdownOption(this.selectors.unitSelect, itemData.unit);
    
    if (itemData.minStock) {
      await this.fillField(this.selectors.minStockInput, itemData.minStock);
    }
    
    if (itemData.maxStock) {
      await this.fillField(this.selectors.maxStockInput, itemData.maxStock);
    }
    
    if (itemData.cost) {
      await this.fillField(this.selectors.costInput, itemData.cost);
    }
    
    if (itemData.price) {
      await this.fillField(this.selectors.priceInput, itemData.price);
    }
    
    if (itemData.location) {
      await this.selectDropdownOption(this.selectors.locationSelect, itemData.location);
    }
    
    if (itemData.supplier) {
      await this.fillField(this.selectors.supplierInput, itemData.supplier);
    }
    
    if (itemData.expiryDate) {
      await this.fillField(this.selectors.expiryDateInput, itemData.expiryDate);
    }
    
    if (itemData.notes) {
      await this.fillField(this.selectors.notesTextarea, itemData.notes);
    }
    
    // Save item
    await this.clickElement(this.selectors.saveButton);
    
    // Wait for success message and return to list
    await this.verifyToast('Inventory item added successfully', 'success');
    await this.waitForElement(this.selectors.inventoryContainer);
  }

  /**
   * Search for inventory items
   */
  async searchInventory(searchTerm: string): Promise<void> {
    await this.fillField(this.selectors.searchInput, searchTerm);
    await this.waitForLoadingComplete();
  }

  /**
   * Filter inventory by category
   */
  async filterByCategory(category: string): Promise<void> {
    await this.selectDropdownOption(this.selectors.categoryFilter, category);
    await this.waitForLoadingComplete();
  }

  /**
   * Filter inventory by location
   */
  async filterByLocation(location: string): Promise<void> {
    await this.selectDropdownOption(this.selectors.locationFilter, location);
    await this.waitForLoadingComplete();
  }

  /**
   * Filter to show only low stock items
   */
  async filterLowStock(): Promise<void> {
    await this.clickElement(this.selectors.lowStockFilter);
    await this.waitForLoadingComplete();
  }

  /**
   * Clear all filters
   */
  async clearFilters(): Promise<void> {
    await this.clickElement(this.selectors.clearFiltersButton);
    await this.waitForLoadingComplete();
  }

  /**
   * Get inventory item count from current view
   */
  async getInventoryCount(): Promise<number> {
    const isGridView = await this.elementExists(this.selectors.inventoryGrid);
    
    if (isGridView) {
      const cards = this.page.locator(this.selectors.inventoryCard);
      return await cards.count();
    } else {
      const rows = this.page.locator(this.selectors.inventoryRow);
      return await rows.count();
    }
  }

  /**
   * Click on inventory item to view details
   */
  async viewItemDetails(itemName: string): Promise<void> {
    const inventoryItem = this.page.locator(`[data-testid="inventory-item-${itemName.replace(/\s+/g, '-').toLowerCase()}"]`);
    await inventoryItem.click();
    await this.waitForElement(this.selectors.itemDetails);
  }

  /**
   * Edit inventory item
   */
  async editInventoryItem(itemName: string, updates: Partial<{
    quantity: string;
    cost: string;
    price: string;
    location: string;
    notes: string;
  }>): Promise<void> {
    await this.viewItemDetails(itemName);
    await this.clickElement(this.selectors.editButton);
    await this.waitForElement(this.selectors.itemForm);
    
    // Update fields
    if (updates.quantity) {
      await this.fillField(this.selectors.quantityInput, updates.quantity);
    }
    
    if (updates.cost) {
      await this.fillField(this.selectors.costInput, updates.cost);
    }
    
    if (updates.price) {
      await this.fillField(this.selectors.priceInput, updates.price);
    }
    
    if (updates.location) {
      await this.selectDropdownOption(this.selectors.locationSelect, updates.location);
    }
    
    if (updates.notes) {
      await this.fillField(this.selectors.notesTextarea, updates.notes);
    }
    
    // Save changes
    await this.clickElement(this.selectors.saveButton);
    await this.verifyToast('Inventory item updated successfully', 'success');
  }

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(itemName: string): Promise<void> {
    await this.viewItemDetails(itemName);
    await this.clickElement(this.selectors.deleteButton);
    
    // Confirm deletion in modal
    await this.clickElement('[data-testid="confirm-delete-button"]');
    await this.verifyToast('Inventory item deleted successfully', 'success');
  }

  /**
   * Add stock to inventory item
   */
  async addStock(itemName: string, stockData: {
    quantity: string;
    reason: string;
    date?: string;
  }): Promise<void> {
    await this.viewItemDetails(itemName);
    await this.clickElement(this.selectors.stockTab);
    await this.clickElement(this.selectors.addStockButton);
    
    await this.waitForElement(this.selectors.stockMovementForm);
    
    // Fill stock movement form
    await this.selectDropdownOption(this.selectors.movementTypeSelect, 'Add Stock');
    await this.fillField(this.selectors.movementQuantityInput, stockData.quantity);
    await this.fillField(this.selectors.movementReasonInput, stockData.reason);
    
    if (stockData.date) {
      await this.fillField(this.selectors.movementDateInput, stockData.date);
    }
    
    await this.clickElement('[data-testid="save-stock-movement-button"]');
    await this.verifyToast('Stock added successfully', 'success');
  }

  /**
   * Remove stock from inventory item
   */
  async removeStock(itemName: string, stockData: {
    quantity: string;
    reason: string;
    date?: string;
  }): Promise<void> {
    await this.viewItemDetails(itemName);
    await this.clickElement(this.selectors.stockTab);
    await this.clickElement(this.selectors.removeStockButton);
    
    await this.waitForElement(this.selectors.stockMovementForm);
    
    // Fill stock movement form
    await this.selectDropdownOption(this.selectors.movementTypeSelect, 'Remove Stock');
    await this.fillField(this.selectors.movementQuantityInput, stockData.quantity);
    await this.fillField(this.selectors.movementReasonInput, stockData.reason);
    
    if (stockData.date) {
      await this.fillField(this.selectors.movementDateInput, stockData.date);
    }
    
    await this.clickElement('[data-testid="save-stock-movement-button"]');
    await this.verifyToast('Stock removed successfully', 'success');
  }

  /**
   * Create purchase order for item
   */
  async createPurchaseOrder(itemName: string, orderData: {
    supplier: string;
    quantity: string;
    unitCost: string;
    expectedDate: string;
    notes?: string;
  }): Promise<void> {
    await this.viewItemDetails(itemName);
    await this.clickElement(this.selectors.purchaseTab);
    await this.clickElement(this.selectors.createPurchaseOrderButton);
    
    await this.waitForElement(this.selectors.purchaseOrderForm);
    
    // Fill purchase order form
    await this.fillField('[data-testid="po-supplier-input"]', orderData.supplier);
    await this.fillField('[data-testid="po-quantity-input"]', orderData.quantity);
    await this.fillField('[data-testid="po-unit-cost-input"]', orderData.unitCost);
    await this.fillField('[data-testid="po-expected-date-input"]', orderData.expectedDate);
    
    if (orderData.notes) {
      await this.fillField('[data-testid="po-notes-input"]', orderData.notes);
    }
    
    await this.clickElement('[data-testid="save-purchase-order-button"]');
    await this.verifyToast('Purchase order created successfully', 'success');
  }

  /**
   * Check for low stock alerts
   */
  async checkLowStockAlerts(): Promise<number> {
    const alerts = this.page.locator(this.selectors.lowStockAlert);
    return await alerts.count();
  }

  /**
   * Reorder item from low stock alert
   */
  async reorderFromAlert(itemName: string): Promise<void> {
    const alertItem = this.page.locator(`[data-testid="low-stock-alert-${itemName.replace(/\s+/g, '-').toLowerCase()}"]`);
    const reorderButton = alertItem.locator(this.selectors.reorderButton);
    await reorderButton.click();
    
    // This should open purchase order form
    await this.waitForElement(this.selectors.purchaseOrderForm);
  }

  /**
   * Switch to grid view
   */
  async switchToGridView(): Promise<void> {
    await this.clickElement(this.selectors.gridViewButton);
    await this.waitForElement(this.selectors.inventoryGrid);
  }

  /**
   * Switch to table view
   */
  async switchToTableView(): Promise<void> {
    await this.clickElement(this.selectors.tableViewButton);
    await this.waitForElement(this.selectors.inventoryTable);
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
   * Get current page information
   */
  async getPageInfo(): Promise<{ current: number; total: number; showing: string }> {
    const pageInfoText = await this.getElementText(this.selectors.pageInfo);
    // Parse text like "Showing 1-10 of 25 results (Page 1 of 3)"
    const matches = pageInfoText.match(/Showing (\d+-\d+) of (\d+) results \(Page (\d+) of (\d+)\)/);
    
    if (matches) {
      return {
        current: parseInt(matches[3]),
        total: parseInt(matches[4]),
        showing: matches[1]
      };
    }
    
    return { current: 1, total: 1, showing: '0-0' };
  }

  /**
   * Select multiple items for bulk actions
   */
  async selectItemsForBulkAction(itemNames: string[]): Promise<void> {
    for (const itemName of itemNames) {
      const checkbox = this.page.locator(`[data-testid="select-item-${itemName.replace(/\s+/g, '-').toLowerCase()}"]`);
      await checkbox.check();
    }
    
    // Verify bulk actions bar appears
    await this.waitForElement(this.selectors.bulkActionsBar);
  }

  /**
   * Perform bulk delete
   */
  async bulkDeleteItems(): Promise<void> {
    await this.clickElement(this.selectors.bulkDeleteButton);
    
    // Confirm bulk deletion
    await this.clickElement('[data-testid="confirm-bulk-delete-button"]');
    await this.verifyToast('Selected items deleted successfully', 'success');
  }

  /**
   * Perform bulk update
   */
  async bulkUpdateItems(updates: {
    location?: string;
    category?: string;
    supplier?: string;
  }): Promise<void> {
    await this.clickElement(this.selectors.bulkUpdateButton);
    
    await this.waitForElement('[data-testid="bulk-update-form"]');
    
    if (updates.location) {
      await this.selectDropdownOption('[data-testid="bulk-location-select"]', updates.location);
    }
    
    if (updates.category) {
      await this.selectDropdownOption('[data-testid="bulk-category-select"]', updates.category);
    }
    
    if (updates.supplier) {
      await this.fillField('[data-testid="bulk-supplier-input"]', updates.supplier);
    }
    
    await this.clickElement('[data-testid="save-bulk-update-button"]');
    await this.verifyToast('Selected items updated successfully', 'success');
  }

  /**
   * Export inventory data
   */
  async exportInventoryData(): Promise<void> {
    await this.clickElement(this.selectors.exportButton);
    
    // Wait for download to start
    const downloadPromise = this.page.waitForEvent('download');
    await downloadPromise;
    
    await this.verifyToast('Inventory data exported successfully', 'success');
  }

  /**
   * Generate stock report
   */
  async generateStockReport(): Promise<void> {
    await this.clickElement(this.selectors.reportsTab);
    await this.clickElement(this.selectors.stockReportButton);
    
    // Wait for report generation
    await this.verifyToast('Stock report generated successfully', 'success');
  }

  /**
   * Generate valuation report
   */
  async generateValuationReport(): Promise<void> {
    await this.clickElement(this.selectors.reportsTab);
    await this.clickElement(this.selectors.valuationReportButton);
    
    // Wait for report generation
    await this.verifyToast('Valuation report generated successfully', 'success');
  }

  /**
   * Verify inventory item exists
   */
  async verifyItemExists(itemName: string): Promise<boolean> {
    return await this.elementExists(`[data-testid="inventory-item-${itemName.replace(/\s+/g, '-').toLowerCase()}"]`);
  }

  /**
   * Verify item has low stock badge
   */
  async verifyLowStockBadge(itemName: string): Promise<boolean> {
    const item = this.page.locator(`[data-testid="inventory-item-${itemName.replace(/\s+/g, '-').toLowerCase()}"]`);
    const badge = item.locator(this.selectors.lowStockBadge);
    return await badge.isVisible();
  }

  /**
   * Verify empty state when no inventory
   */
  async verifyEmptyState(): Promise<void> {
    await expect(this.page.locator(this.selectors.emptyState)).toBeVisible();
    await expect(this.page.locator(this.selectors.emptyState)).toContainText('No inventory items found');
  }

  /**
   * Get item stock level
   */
  async getItemStockLevel(itemName: string): Promise<number> {
    const item = this.page.locator(`[data-testid="inventory-item-${itemName.replace(/\s+/g, '-').toLowerCase()}"]`);
    const stockElement = item.locator('[data-testid="item-stock-level"]');
    const stockText = await stockElement.textContent();
    return parseInt(stockText || '0');
  }

  /**
   * Get total inventory value
   */
  async getTotalInventoryValue(): Promise<string> {
    const valueElement = this.page.locator('[data-testid="total-inventory-value"]');
    return await valueElement.textContent() || '$0.00';
  }
}
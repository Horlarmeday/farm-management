import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Livestock page object model
 * Handles livestock management functionality
 */
export class LivestockPage extends BasePage {
  // Selectors
  private readonly selectors = {
    // Main container
    livestockContainer: '[data-testid="livestock-container"]',
    
    // Header and actions
    pageTitle: '[data-testid="page-title"]',
    addLivestockButton: '[data-testid="add-livestock-button"]',
    importButton: '[data-testid="import-livestock-button"]',
    exportButton: '[data-testid="export-livestock-button"]',
    
    // Search and filters
    searchInput: '[data-testid="livestock-search"]',
    typeFilter: '[data-testid="type-filter"]',
    statusFilter: '[data-testid="status-filter"]',
    ageFilter: '[data-testid="age-filter"]',
    clearFiltersButton: '[data-testid="clear-filters"]',
    
    // Livestock list/grid
    livestockGrid: '[data-testid="livestock-grid"]',
    livestockCard: '[data-testid="livestock-card"]',
    livestockTable: '[data-testid="livestock-table"]',
    livestockRow: '[data-testid="livestock-row"]',
    
    // View toggle
    gridViewButton: '[data-testid="grid-view-button"]',
    tableViewButton: '[data-testid="table-view-button"]',
    
    // Livestock form (add/edit)
    livestockForm: '[data-testid="livestock-form"]',
    tagNumberInput: '[data-testid="tag-number-input"]',
    typeSelect: '[data-testid="type-select"]',
    breedInput: '[data-testid="breed-input"]',
    genderSelect: '[data-testid="gender-select"]',
    birthDateInput: '[data-testid="birth-date-input"]',
    weightInput: '[data-testid="weight-input"]',
    statusSelect: '[data-testid="status-select"]',
    notesTextarea: '[data-testid="notes-textarea"]',
    saveButton: '[data-testid="save-livestock-button"]',
    cancelButton: '[data-testid="cancel-button"]',
    
    // Livestock details
    livestockDetails: '[data-testid="livestock-details"]',
    editButton: '[data-testid="edit-livestock-button"]',
    deleteButton: '[data-testid="delete-livestock-button"]',
    
    // Health tracking
    healthTab: '[data-testid="health-tab"]',
    addHealthRecordButton: '[data-testid="add-health-record-button"]',
    healthRecordForm: '[data-testid="health-record-form"]',
    healthRecordsList: '[data-testid="health-records-list"]',
    
    // Breeding tracking
    breedingTab: '[data-testid="breeding-tab"]',
    addBreedingRecordButton: '[data-testid="add-breeding-record-button"]',
    breedingRecordForm: '[data-testid="breeding-record-form"]',
    breedingRecordsList: '[data-testid="breeding-records-list"]',
    
    // Production tracking (for poultry)
    productionTab: '[data-testid="production-tab"]',
    addProductionRecordButton: '[data-testid="add-production-record-button"]',
    productionRecordForm: '[data-testid="production-record-form"]',
    productionRecordsList: '[data-testid="production-records-list"]',
    
    // Pagination
    pagination: '[data-testid="pagination"]',
    nextPageButton: '[data-testid="next-page"]',
    prevPageButton: '[data-testid="prev-page"]',
    pageInfo: '[data-testid="page-info"]',
    
    // Loading and empty states
    loadingSpinner: '[data-testid="livestock-loading"]',
    emptyState: '[data-testid="empty-livestock"]',
    
    // Bulk actions
    selectAllCheckbox: '[data-testid="select-all-livestock"]',
    bulkActionsBar: '[data-testid="bulk-actions-bar"]',
    bulkDeleteButton: '[data-testid="bulk-delete-button"]',
    bulkExportButton: '[data-testid="bulk-export-button"]'
  };

  constructor(page: Page) {
    super(page, '/livestock');
  }

  /**
   * Navigate to livestock page
   */
  async gotoLivestock(): Promise<void> {
    await this.page.goto('/livestock');
    await this.waitForElement(this.selectors.livestockContainer);
    await this.waitForLoadingComplete();
  }

  /**
   * Add new livestock
   */
  async addLivestock(livestockData: {
    tagNumber: string;
    type: string;
    breed: string;
    gender: string;
    birthDate: string;
    weight?: string;
    status?: string;
    notes?: string;
  }): Promise<void> {
    await this.clickElement(this.selectors.addLivestockButton);
    await this.waitForElement(this.selectors.livestockForm);
    
    // Fill form fields
    await this.fillField(this.selectors.tagNumberInput, livestockData.tagNumber);
    await this.selectDropdownOption(this.selectors.typeSelect, livestockData.type);
    await this.fillField(this.selectors.breedInput, livestockData.breed);
    await this.selectDropdownOption(this.selectors.genderSelect, livestockData.gender);
    await this.fillField(this.selectors.birthDateInput, livestockData.birthDate);
    
    if (livestockData.weight) {
      await this.fillField(this.selectors.weightInput, livestockData.weight);
    }
    
    if (livestockData.status) {
      await this.selectDropdownOption(this.selectors.statusSelect, livestockData.status);
    }
    
    if (livestockData.notes) {
      await this.fillField(this.selectors.notesTextarea, livestockData.notes);
    }
    
    // Save livestock
    await this.clickElement(this.selectors.saveButton);
    
    // Wait for success message and return to list
    await this.verifyToast('Livestock added successfully', 'success');
    await this.waitForElement(this.selectors.livestockContainer);
  }

  /**
   * Search for livestock
   */
  async searchLivestock(searchTerm: string): Promise<void> {
    await this.fillField(this.selectors.searchInput, searchTerm);
    await this.waitForLoadingComplete();
  }

  /**
   * Filter livestock by type
   */
  async filterByType(type: string): Promise<void> {
    await this.selectDropdownOption(this.selectors.typeFilter, type);
    await this.waitForLoadingComplete();
  }

  /**
   * Filter livestock by status
   */
  async filterByStatus(status: string): Promise<void> {
    await this.selectDropdownOption(this.selectors.statusFilter, status);
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
   * Get livestock count from current view
   */
  async getLivestockCount(): Promise<number> {
    const isGridView = await this.elementExists(this.selectors.livestockGrid);
    
    if (isGridView) {
      const cards = this.page.locator(this.selectors.livestockCard);
      return await cards.count();
    } else {
      const rows = this.page.locator(this.selectors.livestockRow);
      return await rows.count();
    }
  }

  /**
   * Click on livestock item to view details
   */
  async viewLivestockDetails(tagNumber: string): Promise<void> {
    const livestockItem = this.page.locator(`[data-testid="livestock-item-${tagNumber}"]`);
    await livestockItem.click();
    await this.waitForElement(this.selectors.livestockDetails);
  }

  /**
   * Edit livestock information
   */
  async editLivestock(tagNumber: string, updates: Partial<{
    breed: string;
    weight: string;
    status: string;
    notes: string;
  }>): Promise<void> {
    await this.viewLivestockDetails(tagNumber);
    await this.clickElement(this.selectors.editButton);
    await this.waitForElement(this.selectors.livestockForm);
    
    // Update fields
    if (updates.breed) {
      await this.fillField(this.selectors.breedInput, updates.breed);
    }
    
    if (updates.weight) {
      await this.fillField(this.selectors.weightInput, updates.weight);
    }
    
    if (updates.status) {
      await this.selectDropdownOption(this.selectors.statusSelect, updates.status);
    }
    
    if (updates.notes) {
      await this.fillField(this.selectors.notesTextarea, updates.notes);
    }
    
    // Save changes
    await this.clickElement(this.selectors.saveButton);
    await this.verifyToast('Livestock updated successfully', 'success');
  }

  /**
   * Delete livestock
   */
  async deleteLivestock(tagNumber: string): Promise<void> {
    await this.viewLivestockDetails(tagNumber);
    await this.clickElement(this.selectors.deleteButton);
    
    // Confirm deletion in modal
    await this.clickElement('[data-testid="confirm-delete-button"]');
    await this.verifyToast('Livestock deleted successfully', 'success');
  }

  /**
   * Add health record
   */
  async addHealthRecord(tagNumber: string, healthData: {
    date: string;
    type: string;
    description: string;
    veterinarian?: string;
    cost?: string;
  }): Promise<void> {
    await this.viewLivestockDetails(tagNumber);
    await this.clickElement(this.selectors.healthTab);
    await this.clickElement(this.selectors.addHealthRecordButton);
    
    await this.waitForElement(this.selectors.healthRecordForm);
    
    // Fill health record form
    await this.fillField('[data-testid="health-date-input"]', healthData.date);
    await this.selectDropdownOption('[data-testid="health-type-select"]', healthData.type);
    await this.fillField('[data-testid="health-description-input"]', healthData.description);
    
    if (healthData.veterinarian) {
      await this.fillField('[data-testid="veterinarian-input"]', healthData.veterinarian);
    }
    
    if (healthData.cost) {
      await this.fillField('[data-testid="health-cost-input"]', healthData.cost);
    }
    
    await this.clickElement('[data-testid="save-health-record-button"]');
    await this.verifyToast('Health record added successfully', 'success');
  }

  /**
   * Add production record (for poultry)
   */
  async addProductionRecord(tagNumber: string, productionData: {
    date: string;
    type: string;
    quantity: string;
    quality?: string;
  }): Promise<void> {
    await this.viewLivestockDetails(tagNumber);
    await this.clickElement(this.selectors.productionTab);
    await this.clickElement(this.selectors.addProductionRecordButton);
    
    await this.waitForElement(this.selectors.productionRecordForm);
    
    // Fill production record form
    await this.fillField('[data-testid="production-date-input"]', productionData.date);
    await this.selectDropdownOption('[data-testid="production-type-select"]', productionData.type);
    await this.fillField('[data-testid="production-quantity-input"]', productionData.quantity);
    
    if (productionData.quality) {
      await this.selectDropdownOption('[data-testid="production-quality-select"]', productionData.quality);
    }
    
    await this.clickElement('[data-testid="save-production-record-button"]');
    await this.verifyToast('Production record added successfully', 'success');
  }

  /**
   * Switch to grid view
   */
  async switchToGridView(): Promise<void> {
    await this.clickElement(this.selectors.gridViewButton);
    await this.waitForElement(this.selectors.livestockGrid);
  }

  /**
   * Switch to table view
   */
  async switchToTableView(): Promise<void> {
    await this.clickElement(this.selectors.tableViewButton);
    await this.waitForElement(this.selectors.livestockTable);
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
   * Select multiple livestock for bulk actions
   */
  async selectLivestockForBulkAction(tagNumbers: string[]): Promise<void> {
    for (const tagNumber of tagNumbers) {
      const checkbox = this.page.locator(`[data-testid="select-livestock-${tagNumber}"]`);
      await checkbox.check();
    }
    
    // Verify bulk actions bar appears
    await this.waitForElement(this.selectors.bulkActionsBar);
  }

  /**
   * Perform bulk delete
   */
  async bulkDeleteLivestock(): Promise<void> {
    await this.clickElement(this.selectors.bulkDeleteButton);
    
    // Confirm bulk deletion
    await this.clickElement('[data-testid="confirm-bulk-delete-button"]');
    await this.verifyToast('Selected livestock deleted successfully', 'success');
  }

  /**
   * Export livestock data
   */
  async exportLivestockData(): Promise<void> {
    await this.clickElement(this.selectors.exportButton);
    
    // Wait for download to start
    const downloadPromise = this.page.waitForEvent('download');
    await downloadPromise;
    
    await this.verifyToast('Livestock data exported successfully', 'success');
  }

  /**
   * Verify livestock appears in list
   */
  async verifyLivestockExists(tagNumber: string): Promise<boolean> {
    return await this.elementExists(`[data-testid="livestock-item-${tagNumber}"]`);
  }

  /**
   * Verify empty state when no livestock
   */
  async verifyEmptyState(): Promise<void> {
    await expect(this.page.locator(this.selectors.emptyState)).toBeVisible();
    await expect(this.page.locator(this.selectors.emptyState)).toContainText('No livestock found');
  }
}
import { test, expect } from '../fixtures/page-objects.fixture';
import { DataFixtureHelpers } from '../fixtures/data.fixture';
import { TestDataGenerator, DatabaseHelpers } from '../utils/test-helpers';

/**
 * Livestock Tracking E2E Tests
 * Tests the complete livestock management workflow
 */

test.describe('Livestock Tracking', () => {
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

  test.beforeEach(async ({ authPage, livestockPage }) => {
    // Login before each test
    await authPage.gotoLogin();
    await authPage.login(testUser.email, testUser.password);
    
    // Navigate to livestock page
    await livestockPage.goto();
  });

  test('should display livestock dashboard correctly', async ({ livestockPage }) => {
    // Verify page elements are present
    await expect(livestockPage.page.locator('[data-testid="livestock-dashboard"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="add-livestock-button"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="livestock-search"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="livestock-filters"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="livestock-table"]')).toBeVisible();
    
    // Verify statistics cards
    await expect(livestockPage.page.locator('[data-testid="total-livestock-count"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="healthy-livestock-count"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="sick-livestock-count"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="breeding-livestock-count"]')).toBeVisible();
  });

  test('should add new livestock successfully', async ({ livestockPage }) => {
    const livestockData = await TestDataGenerator.generateLivestock();
    
    // Click add livestock button
    await livestockPage.clickAddLivestock();
    
    // Verify add livestock modal is open
    await expect(livestockPage.page.locator('[data-testid="add-livestock-modal"]')).toBeVisible();
    
    // Fill livestock form
    await livestockPage.addLivestock(
      livestockData.tagNumber,
      livestockData.type,
      livestockData.breed,
      livestockData.gender,
      livestockData.birthDate,
      livestockData.weight,
      livestockData.healthStatus
    );
    
    // Verify success message
    await expect(livestockPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="success-message"]')).toContainText('Livestock added successfully');
    
    // Verify livestock appears in table
    await expect(livestockPage.page.locator(`[data-testid="livestock-row-${livestockData.tagNumber}"]`)).toBeVisible();
    await expect(livestockPage.page.locator(`[data-testid="livestock-tag-${livestockData.tagNumber}"]`)).toContainText(livestockData.tagNumber);
    await expect(livestockPage.page.locator(`[data-testid="livestock-type-${livestockData.tagNumber}"]`)).toContainText(livestockData.type);
    
    // Verify statistics are updated
    const totalCount = await livestockPage.getTotalLivestockCount();
    expect(totalCount).toBeGreaterThan(0);
  });

  test('should validate required fields when adding livestock', async ({ livestockPage }) => {
    await livestockPage.clickAddLivestock();
    
    // Try to submit empty form
    await livestockPage.page.click('[data-testid="save-livestock-button"]');
    
    // Verify validation errors
    await expect(livestockPage.page.locator('[data-testid="tag-number-error"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="type-error"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="breed-error"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="gender-error"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="birth-date-error"]')).toBeVisible();
    
    // Verify modal stays open
    await expect(livestockPage.page.locator('[data-testid="add-livestock-modal"]')).toBeVisible();
  });

  test('should prevent duplicate tag numbers', async ({ livestockPage }) => {
    const livestockData = await TestDataGenerator.generateLivestock();
    
    // Add first livestock
    await livestockPage.clickAddLivestock();
    await livestockPage.addLivestock(
      livestockData.tagNumber,
      livestockData.type,
      livestockData.breed,
      livestockData.gender,
      livestockData.birthDate,
      livestockData.weight,
      livestockData.healthStatus
    );
    
    // Wait for success
    await expect(livestockPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Try to add livestock with same tag number
    await livestockPage.clickAddLivestock();
    await livestockPage.addLivestock(
      livestockData.tagNumber, // Same tag number
      'Goat',
      'Boer',
      'Female',
      '2023-01-15',
      45,
      'Healthy'
    );
    
    // Verify duplicate error
    await expect(livestockPage.page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="error-message"]')).toContainText('Tag number already exists');
  });

  test('should search livestock by tag number', async ({ livestockPage }) => {
    // Add test livestock
    const livestockData = await TestDataGenerator.generateLivestock();
    await DataFixtureHelpers.createTestLivestock(livestockData, testFarm.id);
    
    // Refresh page to load new data
    await livestockPage.page.reload();
    
    // Search for livestock
    await livestockPage.searchLivestock(livestockData.tagNumber);
    
    // Verify search results
    await expect(livestockPage.page.locator(`[data-testid="livestock-row-${livestockData.tagNumber}"]`)).toBeVisible();
    
    // Verify other livestock are hidden
    const visibleRows = await livestockPage.page.locator('[data-testid^="livestock-row-"]').count();
    expect(visibleRows).toBe(1);
  });

  test('should filter livestock by type', async ({ livestockPage }) => {
    // Add test livestock of different types
    const cattleData = await TestDataGenerator.generateLivestock({ type: 'Cattle' });
    const poultryData = await TestDataGenerator.generateLivestock({ type: 'Poultry' });
    
    await DataFixtureHelpers.createTestLivestock(cattleData, testFarm.id);
    await DataFixtureHelpers.createTestLivestock(poultryData, testFarm.id);
    
    // Refresh page
    await livestockPage.page.reload();
    
    // Filter by cattle
    await livestockPage.filterByType('Cattle');
    
    // Verify only cattle are shown
    await expect(livestockPage.page.locator(`[data-testid="livestock-row-${cattleData.tagNumber}"]`)).toBeVisible();
    await expect(livestockPage.page.locator(`[data-testid="livestock-row-${poultryData.tagNumber}"]`)).not.toBeVisible();
    
    // Filter by poultry
    await livestockPage.filterByType('Poultry');
    
    // Verify only poultry are shown
    await expect(livestockPage.page.locator(`[data-testid="livestock-row-${poultryData.tagNumber}"]`)).toBeVisible();
    await expect(livestockPage.page.locator(`[data-testid="livestock-row-${cattleData.tagNumber}"]`)).not.toBeVisible();
  });

  test('should filter livestock by health status', async ({ livestockPage }) => {
    // Add test livestock with different health statuses
    const healthyData = await TestDataGenerator.generateLivestock({ healthStatus: 'Healthy' });
    const sickData = await TestDataGenerator.generateLivestock({ healthStatus: 'Sick' });
    
    await DataFixtureHelpers.createTestLivestock(healthyData, testFarm.id);
    await DataFixtureHelpers.createTestLivestock(sickData, testFarm.id);
    
    // Refresh page
    await livestockPage.page.reload();
    
    // Filter by healthy
    await livestockPage.filterByHealthStatus('Healthy');
    
    // Verify only healthy livestock are shown
    await expect(livestockPage.page.locator(`[data-testid="livestock-row-${healthyData.tagNumber}"]`)).toBeVisible();
    await expect(livestockPage.page.locator(`[data-testid="livestock-row-${sickData.tagNumber}"]`)).not.toBeVisible();
    
    // Filter by sick
    await livestockPage.filterByHealthStatus('Sick');
    
    // Verify only sick livestock are shown
    await expect(livestockPage.page.locator(`[data-testid="livestock-row-${sickData.tagNumber}"]`)).toBeVisible();
    await expect(livestockPage.page.locator(`[data-testid="livestock-row-${healthyData.tagNumber}"]`)).not.toBeVisible();
  });

  test('should edit livestock information', async ({ livestockPage }) => {
    // Add test livestock
    const livestockData = await TestDataGenerator.generateLivestock();
    await DataFixtureHelpers.createTestLivestock(livestockData, testFarm.id);
    
    // Refresh page
    await livestockPage.page.reload();
    
    // Click edit button
    await livestockPage.editLivestock(livestockData.tagNumber);
    
    // Verify edit modal is open
    await expect(livestockPage.page.locator('[data-testid="edit-livestock-modal"]')).toBeVisible();
    
    // Update livestock information
    const updatedWeight = 75;
    const updatedHealthStatus = 'Sick';
    
    await livestockPage.page.fill('[data-testid="weight-input"]', updatedWeight.toString());
    await livestockPage.page.selectOption('[data-testid="health-status-select"]', updatedHealthStatus);
    
    // Save changes
    await livestockPage.page.click('[data-testid="save-livestock-button"]');
    
    // Verify success message
    await expect(livestockPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify updated information is displayed
    await expect(livestockPage.page.locator(`[data-testid="livestock-weight-${livestockData.tagNumber}"]`)).toContainText(updatedWeight.toString());
    await expect(livestockPage.page.locator(`[data-testid="livestock-health-${livestockData.tagNumber}"]`)).toContainText(updatedHealthStatus);
  });

  test('should delete livestock', async ({ livestockPage }) => {
    // Add test livestock
    const livestockData = await TestDataGenerator.generateLivestock();
    await DataFixtureHelpers.createTestLivestock(livestockData, testFarm.id);
    
    // Refresh page
    await livestockPage.page.reload();
    
    // Get initial count
    const initialCount = await livestockPage.getTotalLivestockCount();
    
    // Delete livestock
    await livestockPage.deleteLivestock(livestockData.tagNumber);
    
    // Confirm deletion
    await expect(livestockPage.page.locator('[data-testid="confirm-delete-modal"]')).toBeVisible();
    await livestockPage.page.click('[data-testid="confirm-delete-button"]');
    
    // Verify success message
    await expect(livestockPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify livestock is removed from table
    await expect(livestockPage.page.locator(`[data-testid="livestock-row-${livestockData.tagNumber}"]`)).not.toBeVisible();
    
    // Verify count is updated
    const newCount = await livestockPage.getTotalLivestockCount();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should add health record', async ({ livestockPage }) => {
    // Add test livestock
    const livestockData = await TestDataGenerator.generateLivestock();
    await DataFixtureHelpers.createTestLivestock(livestockData, testFarm.id);
    
    // Refresh page
    await livestockPage.page.reload();
    
    // Click on livestock to view details
    await livestockPage.page.click(`[data-testid="livestock-row-${livestockData.tagNumber}"]`);
    
    // Verify livestock details modal
    await expect(livestockPage.page.locator('[data-testid="livestock-details-modal"]')).toBeVisible();
    
    // Navigate to health records tab
    await livestockPage.page.click('[data-testid="health-records-tab"]');
    
    // Add health record
    await livestockPage.page.click('[data-testid="add-health-record-button"]');
    
    const healthRecord = {
      date: '2024-01-15',
      type: 'Vaccination',
      description: 'Annual vaccination',
      veterinarian: 'Dr. Smith',
      cost: 25.00
    };
    
    await livestockPage.addHealthRecord(
      healthRecord.date,
      healthRecord.type,
      healthRecord.description,
      healthRecord.veterinarian,
      healthRecord.cost
    );
    
    // Verify health record is added
    await expect(livestockPage.page.locator('[data-testid="health-record-item"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="health-record-type"]')).toContainText(healthRecord.type);
    await expect(livestockPage.page.locator('[data-testid="health-record-description"]')).toContainText(healthRecord.description);
  });

  test('should add production record', async ({ livestockPage }) => {
    // Add test livestock (dairy cow)
    const livestockData = await TestDataGenerator.generateLivestock({ type: 'Cattle', breed: 'Holstein' });
    await DataFixtureHelpers.createTestLivestock(livestockData, testFarm.id);
    
    // Refresh page
    await livestockPage.page.reload();
    
    // Click on livestock to view details
    await livestockPage.page.click(`[data-testid="livestock-row-${livestockData.tagNumber}"]`);
    
    // Navigate to production records tab
    await livestockPage.page.click('[data-testid="production-records-tab"]');
    
    // Add production record
    await livestockPage.page.click('[data-testid="add-production-record-button"]');
    
    const productionRecord = {
      date: '2024-01-15',
      type: 'Milk',
      quantity: 25.5,
      unit: 'liters',
      quality: 'Grade A'
    };
    
    await livestockPage.addProductionRecord(
      productionRecord.date,
      productionRecord.type,
      productionRecord.quantity,
      productionRecord.unit,
      productionRecord.quality
    );
    
    // Verify production record is added
    await expect(livestockPage.page.locator('[data-testid="production-record-item"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="production-record-type"]')).toContainText(productionRecord.type);
    await expect(livestockPage.page.locator('[data-testid="production-record-quantity"]')).toContainText(productionRecord.quantity.toString());
  });

  test('should add breeding record', async ({ livestockPage }) => {
    // Add test livestock
    const livestockData = await TestDataGenerator.generateLivestock({ gender: 'Female' });
    await DataFixtureHelpers.createTestLivestock(livestockData, testFarm.id);
    
    // Refresh page
    await livestockPage.page.reload();
    
    // Click on livestock to view details
    await livestockPage.page.click(`[data-testid="livestock-row-${livestockData.tagNumber}"]`);
    
    // Navigate to breeding records tab
    await livestockPage.page.click('[data-testid="breeding-records-tab"]');
    
    // Add breeding record
    await livestockPage.page.click('[data-testid="add-breeding-record-button"]');
    
    const breedingRecord = {
      matingDate: '2024-01-15',
      sireId: 'BULL001',
      expectedDueDate: '2024-10-15',
      breedingMethod: 'Natural',
      notes: 'First breeding'
    };
    
    await livestockPage.addBreedingRecord(
      breedingRecord.matingDate,
      breedingRecord.sireId,
      breedingRecord.expectedDueDate,
      breedingRecord.breedingMethod,
      breedingRecord.notes
    );
    
    // Verify breeding record is added
    await expect(livestockPage.page.locator('[data-testid="breeding-record-item"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="breeding-record-sire"]')).toContainText(breedingRecord.sireId);
    await expect(livestockPage.page.locator('[data-testid="breeding-record-method"]')).toContainText(breedingRecord.breedingMethod);
  });

  test('should perform bulk actions', async ({ livestockPage }) => {
    // Add multiple test livestock
    const livestock1 = await TestDataGenerator.generateLivestock();
    const livestock2 = await TestDataGenerator.generateLivestock();
    const livestock3 = await TestDataGenerator.generateLivestock();
    
    await DataFixtureHelpers.createTestLivestock(livestock1, testFarm.id);
    await DataFixtureHelpers.createTestLivestock(livestock2, testFarm.id);
    await DataFixtureHelpers.createTestLivestock(livestock3, testFarm.id);
    
    // Refresh page
    await livestockPage.page.reload();
    
    // Select multiple livestock
    await livestockPage.page.check(`[data-testid="livestock-checkbox-${livestock1.tagNumber}"]`);
    await livestockPage.page.check(`[data-testid="livestock-checkbox-${livestock2.tagNumber}"]`);
    
    // Verify bulk actions are enabled
    await expect(livestockPage.page.locator('[data-testid="bulk-actions-toolbar"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="bulk-delete-button"]')).toBeEnabled();
    await expect(livestockPage.page.locator('[data-testid="bulk-update-button"]')).toBeEnabled();
    
    // Perform bulk health status update
    await livestockPage.page.click('[data-testid="bulk-update-button"]');
    await livestockPage.page.selectOption('[data-testid="bulk-health-status-select"]', 'Quarantine');
    await livestockPage.page.click('[data-testid="apply-bulk-update-button"]');
    
    // Verify success message
    await expect(livestockPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify health status is updated for selected livestock
    await expect(livestockPage.page.locator(`[data-testid="livestock-health-${livestock1.tagNumber}"]`)).toContainText('Quarantine');
    await expect(livestockPage.page.locator(`[data-testid="livestock-health-${livestock2.tagNumber}"]`)).toContainText('Quarantine');
    await expect(livestockPage.page.locator(`[data-testid="livestock-health-${livestock3.tagNumber}"]`)).not.toContainText('Quarantine');
  });

  test('should export livestock data', async ({ livestockPage, page }) => {
    // Add test livestock
    const livestockData = await TestDataGenerator.generateLivestock();
    await DataFixtureHelpers.createTestLivestock(livestockData, testFarm.id);
    
    // Refresh page
    await livestockPage.page.reload();
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await livestockPage.page.click('[data-testid="export-livestock-button"]');
    await livestockPage.page.click('[data-testid="export-csv-option"]');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('livestock');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should handle pagination', async ({ livestockPage }) => {
    // Add many test livestock (more than page size)
    for (let i = 0; i < 25; i++) {
      const livestockData = await TestDataGenerator.generateLivestock();
      await DataFixtureHelpers.createTestLivestock(livestockData, testFarm.id);
    }
    
    // Refresh page
    await livestockPage.page.reload();
    
    // Verify pagination controls are visible
    await expect(livestockPage.page.locator('[data-testid="pagination-controls"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="next-page-button"]')).toBeEnabled();
    
    // Go to next page
    await livestockPage.page.click('[data-testid="next-page-button"]');
    
    // Verify page number changed
    await expect(livestockPage.page.locator('[data-testid="current-page"]')).toContainText('2');
    
    // Verify previous button is enabled
    await expect(livestockPage.page.locator('[data-testid="previous-page-button"]')).toBeEnabled();
  });

  test('should sort livestock by different columns', async ({ livestockPage }) => {
    // Add test livestock with different data
    const livestock1 = await TestDataGenerator.generateLivestock({ tagNumber: 'A001', weight: 100 });
    const livestock2 = await TestDataGenerator.generateLivestock({ tagNumber: 'B002', weight: 150 });
    const livestock3 = await TestDataGenerator.generateLivestock({ tagNumber: 'C003', weight: 75 });
    
    await DataFixtureHelpers.createTestLivestock(livestock1, testFarm.id);
    await DataFixtureHelpers.createTestLivestock(livestock2, testFarm.id);
    await DataFixtureHelpers.createTestLivestock(livestock3, testFarm.id);
    
    // Refresh page
    await livestockPage.page.reload();
    
    // Sort by tag number (ascending)
    await livestockPage.page.click('[data-testid="sort-tag-number"]');
    
    // Verify sort order
    const tagNumbers = await livestockPage.page.locator('[data-testid^="livestock-tag-"]').allTextContents();
    expect(tagNumbers[0]).toContain('A001');
    expect(tagNumbers[1]).toContain('B002');
    expect(tagNumbers[2]).toContain('C003');
    
    // Sort by weight (descending)
    await livestockPage.page.click('[data-testid="sort-weight"]');
    await livestockPage.page.click('[data-testid="sort-weight"]'); // Second click for descending
    
    // Verify sort order by weight
    const weights = await livestockPage.page.locator('[data-testid^="livestock-weight-"]').allTextContents();
    expect(parseInt(weights[0])).toBeGreaterThan(parseInt(weights[1]));
    expect(parseInt(weights[1])).toBeGreaterThan(parseInt(weights[2]));
  });

  test('should handle server errors gracefully', async ({ livestockPage, page }) => {
    // Mock server error for livestock creation
    await page.route('**/api/livestock', route => {
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
    
    const livestockData = await TestDataGenerator.generateLivestock();
    
    // Try to add livestock
    await livestockPage.clickAddLivestock();
    await livestockPage.addLivestock(
      livestockData.tagNumber,
      livestockData.type,
      livestockData.breed,
      livestockData.gender,
      livestockData.birthDate,
      livestockData.weight,
      livestockData.healthStatus
    );
    
    // Verify error message
    await expect(livestockPage.page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(livestockPage.page.locator('[data-testid="error-message"]')).toContainText('error');
    
    // Verify modal stays open
    await expect(livestockPage.page.locator('[data-testid="add-livestock-modal"]')).toBeVisible();
  });

  test('should maintain data integrity during concurrent operations', async ({ livestockPage, context }) => {
    const livestockData = await TestDataGenerator.generateLivestock();
    
    // Add livestock in first tab
    await livestockPage.clickAddLivestock();
    await livestockPage.addLivestock(
      livestockData.tagNumber,
      livestockData.type,
      livestockData.breed,
      livestockData.gender,
      livestockData.birthDate,
      livestockData.weight,
      livestockData.healthStatus
    );
    
    // Open second tab and try to add same livestock
    const secondPage = await context.newPage();
    await secondPage.goto('/livestock');
    
    const secondLivestockPage = new (livestockPage.constructor as any)(secondPage);
    await secondLivestockPage.clickAddLivestock();
    await secondLivestockPage.addLivestock(
      livestockData.tagNumber, // Same tag number
      'Goat',
      'Boer',
      'Female',
      '2023-01-15',
      45,
      'Healthy'
    );
    
    // Verify duplicate error in second tab
    await expect(secondPage.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(secondPage.locator('[data-testid="error-message"]')).toContainText('already exists');
    
    await secondPage.close();
  });
});
import { test, expect } from '../fixtures/page-objects.fixture';
import { DataFixtureHelpers } from '../fixtures/data.fixture';
import { TestDataGenerator, DatabaseHelpers } from '../utils/test-helpers';

/**
 * Inventory Management E2E Tests
 * Tests the complete inventory management workflow
 */

test.describe('Inventory Management', () => {
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

  test.beforeEach(async ({ authPage, inventoryPage }) => {
    // Login before each test
    await authPage.gotoLogin();
    await authPage.login(testUser.email, testUser.password);
    
    // Navigate to inventory page
    await inventoryPage.goto();
  });

  test('should display inventory dashboard correctly', async ({ inventoryPage }) => {
    // Verify page elements are present
    await expect(inventoryPage.page.locator('[data-testid="inventory-dashboard"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="add-item-button"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="inventory-search"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="inventory-filters"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="inventory-table"]')).toBeVisible();
    
    // Verify statistics cards
    await expect(inventoryPage.page.locator('[data-testid="total-items-count"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="low-stock-count"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="out-of-stock-count"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="total-value"]')).toBeVisible();
  });

  test('should add new inventory item successfully', async ({ inventoryPage }) => {
    const itemData = await TestDataGenerator.generateInventoryItem();
    
    // Click add item button
    await inventoryPage.clickAddItem();
    
    // Verify add item modal is open
    await expect(inventoryPage.page.locator('[data-testid="add-item-modal"]')).toBeVisible();
    
    // Fill item form
    await inventoryPage.addItem(
      itemData.name,
      itemData.category,
      itemData.description,
      itemData.sku,
      itemData.quantity,
      itemData.unit,
      itemData.unitPrice,
      itemData.minStockLevel,
      itemData.supplier,
      itemData.location
    );
    
    // Verify success message
    await expect(inventoryPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="success-message"]')).toContainText('Item added successfully');
    
    // Verify item appears in table
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${itemData.sku}"]`)).toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="item-name-${itemData.sku}"]`)).toContainText(itemData.name);
    await expect(inventoryPage.page.locator(`[data-testid="item-category-${itemData.sku}"]`)).toContainText(itemData.category);
    await expect(inventoryPage.page.locator(`[data-testid="item-quantity-${itemData.sku}"]`)).toContainText(itemData.quantity.toString());
    
    // Verify statistics are updated
    const totalItems = await inventoryPage.getTotalItemsCount();
    expect(totalItems).toBeGreaterThan(0);
  });

  test('should validate required fields when adding item', async ({ inventoryPage }) => {
    await inventoryPage.clickAddItem();
    
    // Try to submit empty form
    await inventoryPage.page.click('[data-testid="save-item-button"]');
    
    // Verify validation errors
    await expect(inventoryPage.page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="category-error"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="sku-error"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="quantity-error"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="unit-error"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="unit-price-error"]')).toBeVisible();
    
    // Verify modal stays open
    await expect(inventoryPage.page.locator('[data-testid="add-item-modal"]')).toBeVisible();
  });

  test('should prevent duplicate SKU numbers', async ({ inventoryPage }) => {
    const itemData = await TestDataGenerator.generateInventoryItem();
    
    // Add first item
    await inventoryPage.clickAddItem();
    await inventoryPage.addItem(
      itemData.name,
      itemData.category,
      itemData.description,
      itemData.sku,
      itemData.quantity,
      itemData.unit,
      itemData.unitPrice,
      itemData.minStockLevel,
      itemData.supplier,
      itemData.location
    );
    
    // Wait for success
    await expect(inventoryPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Try to add item with same SKU
    await inventoryPage.clickAddItem();
    await inventoryPage.addItem(
      'Different Item',
      'Feed',
      'Different description',
      itemData.sku, // Same SKU
      50,
      'kg',
      15.99,
      10,
      'Different Supplier',
      'Warehouse B'
    );
    
    // Verify duplicate error
    await expect(inventoryPage.page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="error-message"]')).toContainText('SKU already exists');
  });

  test('should search inventory by name or SKU', async ({ inventoryPage }) => {
    // Add test items
    const item1 = await TestDataGenerator.generateInventoryItem({ name: 'Chicken Feed Premium' });
    const item2 = await TestDataGenerator.generateInventoryItem({ name: 'Cattle Supplement' });
    
    await DataFixtureHelpers.createTestInventoryItem(item1, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(item2, testFarm.id);
    
    // Refresh page to load new data
    await inventoryPage.page.reload();
    
    // Search by name
    await inventoryPage.searchItems('Chicken');
    
    // Verify search results
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${item1.sku}"]`)).toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${item2.sku}"]`)).not.toBeVisible();
    
    // Clear search and search by SKU
    await inventoryPage.searchItems('');
    await inventoryPage.searchItems(item2.sku);
    
    // Verify search results
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${item2.sku}"]`)).toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${item1.sku}"]`)).not.toBeVisible();
  });

  test('should filter inventory by category', async ({ inventoryPage }) => {
    // Add test items of different categories
    const feedItem = await TestDataGenerator.generateInventoryItem({ category: 'Feed' });
    const medicineItem = await TestDataGenerator.generateInventoryItem({ category: 'Medicine' });
    const equipmentItem = await TestDataGenerator.generateInventoryItem({ category: 'Equipment' });
    
    await DataFixtureHelpers.createTestInventoryItem(feedItem, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(medicineItem, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(equipmentItem, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Filter by Feed
    await inventoryPage.filterByCategory('Feed');
    
    // Verify only feed items are shown
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${feedItem.sku}"]`)).toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${medicineItem.sku}"]`)).not.toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${equipmentItem.sku}"]`)).not.toBeVisible();
    
    // Filter by Medicine
    await inventoryPage.filterByCategory('Medicine');
    
    // Verify only medicine items are shown
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${medicineItem.sku}"]`)).toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${feedItem.sku}"]`)).not.toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${equipmentItem.sku}"]`)).not.toBeVisible();
  });

  test('should filter inventory by stock status', async ({ inventoryPage }) => {
    // Add test items with different stock levels
    const inStockItem = await TestDataGenerator.generateInventoryItem({ quantity: 100, minStockLevel: 10 });
    const lowStockItem = await TestDataGenerator.generateInventoryItem({ quantity: 5, minStockLevel: 10 });
    const outOfStockItem = await TestDataGenerator.generateInventoryItem({ quantity: 0, minStockLevel: 10 });
    
    await DataFixtureHelpers.createTestInventoryItem(inStockItem, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(lowStockItem, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(outOfStockItem, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Filter by low stock
    await inventoryPage.filterByStockStatus('Low Stock');
    
    // Verify only low stock items are shown
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${lowStockItem.sku}"]`)).toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${inStockItem.sku}"]`)).not.toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${outOfStockItem.sku}"]`)).not.toBeVisible();
    
    // Filter by out of stock
    await inventoryPage.filterByStockStatus('Out of Stock');
    
    // Verify only out of stock items are shown
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${outOfStockItem.sku}"]`)).toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${inStockItem.sku}"]`)).not.toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${lowStockItem.sku}"]`)).not.toBeVisible();
  });

  test('should edit inventory item', async ({ inventoryPage }) => {
    // Add test item
    const itemData = await TestDataGenerator.generateInventoryItem();
    await DataFixtureHelpers.createTestInventoryItem(itemData, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Click edit button
    await inventoryPage.editItem(itemData.sku);
    
    // Verify edit modal is open
    await expect(inventoryPage.page.locator('[data-testid="edit-item-modal"]')).toBeVisible();
    
    // Update item information
    const updatedPrice = 29.99;
    const updatedQuantity = 150;
    
    await inventoryPage.page.fill('[data-testid="unit-price-input"]', updatedPrice.toString());
    await inventoryPage.page.fill('[data-testid="quantity-input"]', updatedQuantity.toString());
    
    // Save changes
    await inventoryPage.page.click('[data-testid="save-item-button"]');
    
    // Verify success message
    await expect(inventoryPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify updated information is displayed
    await expect(inventoryPage.page.locator(`[data-testid="item-price-${itemData.sku}"]`)).toContainText(updatedPrice.toString());
    await expect(inventoryPage.page.locator(`[data-testid="item-quantity-${itemData.sku}"]`)).toContainText(updatedQuantity.toString());
  });

  test('should delete inventory item', async ({ inventoryPage }) => {
    // Add test item
    const itemData = await TestDataGenerator.generateInventoryItem();
    await DataFixtureHelpers.createTestInventoryItem(itemData, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Get initial count
    const initialCount = await inventoryPage.getTotalItemsCount();
    
    // Delete item
    await inventoryPage.deleteItem(itemData.sku);
    
    // Confirm deletion
    await expect(inventoryPage.page.locator('[data-testid="confirm-delete-modal"]')).toBeVisible();
    await inventoryPage.page.click('[data-testid="confirm-delete-button"]');
    
    // Verify success message
    await expect(inventoryPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify item is removed from table
    await expect(inventoryPage.page.locator(`[data-testid="item-row-${itemData.sku}"]`)).not.toBeVisible();
    
    // Verify count is updated
    const newCount = await inventoryPage.getTotalItemsCount();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should record stock movement (in)', async ({ inventoryPage }) => {
    // Add test item
    const itemData = await TestDataGenerator.generateInventoryItem({ quantity: 50 });
    await DataFixtureHelpers.createTestInventoryItem(itemData, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Record stock in
    await inventoryPage.recordStockMovement(itemData.sku, 'in');
    
    // Verify stock movement modal
    await expect(inventoryPage.page.locator('[data-testid="stock-movement-modal"]')).toBeVisible();
    
    const movementData = {
      quantity: 25,
      reason: 'Purchase',
      reference: 'PO-2024-001',
      notes: 'Monthly stock replenishment'
    };
    
    // Fill movement form
    await inventoryPage.page.fill('[data-testid="movement-quantity-input"]', movementData.quantity.toString());
    await inventoryPage.page.selectOption('[data-testid="movement-reason-select"]', movementData.reason);
    await inventoryPage.page.fill('[data-testid="movement-reference-input"]', movementData.reference);
    await inventoryPage.page.fill('[data-testid="movement-notes-input"]', movementData.notes);
    
    // Save movement
    await inventoryPage.page.click('[data-testid="save-movement-button"]');
    
    // Verify success message
    await expect(inventoryPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify quantity is updated
    const expectedQuantity = itemData.quantity + movementData.quantity;
    await expect(inventoryPage.page.locator(`[data-testid="item-quantity-${itemData.sku}"]`)).toContainText(expectedQuantity.toString());
  });

  test('should record stock movement (out)', async ({ inventoryPage }) => {
    // Add test item with sufficient stock
    const itemData = await TestDataGenerator.generateInventoryItem({ quantity: 100 });
    await DataFixtureHelpers.createTestInventoryItem(itemData, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Record stock out
    await inventoryPage.recordStockMovement(itemData.sku, 'out');
    
    const movementData = {
      quantity: 30,
      reason: 'Usage',
      reference: 'USAGE-2024-001',
      notes: 'Fed to cattle'
    };
    
    // Fill movement form
    await inventoryPage.page.fill('[data-testid="movement-quantity-input"]', movementData.quantity.toString());
    await inventoryPage.page.selectOption('[data-testid="movement-reason-select"]', movementData.reason);
    await inventoryPage.page.fill('[data-testid="movement-reference-input"]', movementData.reference);
    await inventoryPage.page.fill('[data-testid="movement-notes-input"]', movementData.notes);
    
    // Save movement
    await inventoryPage.page.click('[data-testid="save-movement-button"]');
    
    // Verify success message
    await expect(inventoryPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify quantity is updated
    const expectedQuantity = itemData.quantity - movementData.quantity;
    await expect(inventoryPage.page.locator(`[data-testid="item-quantity-${itemData.sku}"]`)).toContainText(expectedQuantity.toString());
  });

  test('should prevent negative stock', async ({ inventoryPage }) => {
    // Add test item with low stock
    const itemData = await TestDataGenerator.generateInventoryItem({ quantity: 10 });
    await DataFixtureHelpers.createTestInventoryItem(itemData, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Try to record stock out more than available
    await inventoryPage.recordStockMovement(itemData.sku, 'out');
    
    // Fill movement form with quantity greater than available
    await inventoryPage.page.fill('[data-testid="movement-quantity-input"]', '15');
    await inventoryPage.page.selectOption('[data-testid="movement-reason-select"]', 'Usage');
    
    // Try to save movement
    await inventoryPage.page.click('[data-testid="save-movement-button"]');
    
    // Verify error message
    await expect(inventoryPage.page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="error-message"]')).toContainText('Insufficient stock');
    
    // Verify modal stays open
    await expect(inventoryPage.page.locator('[data-testid="stock-movement-modal"]')).toBeVisible();
  });

  test('should create purchase order', async ({ inventoryPage }) => {
    // Add test items
    const item1 = await TestDataGenerator.generateInventoryItem({ quantity: 5, minStockLevel: 10 });
    const item2 = await TestDataGenerator.generateInventoryItem({ quantity: 3, minStockLevel: 15 });
    
    await DataFixtureHelpers.createTestInventoryItem(item1, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(item2, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Click create purchase order
    await inventoryPage.page.click('[data-testid="create-purchase-order-button"]');
    
    // Verify purchase order modal
    await expect(inventoryPage.page.locator('[data-testid="purchase-order-modal"]')).toBeVisible();
    
    // Verify low stock items are pre-selected
    await expect(inventoryPage.page.locator(`[data-testid="po-item-${item1.sku}"]`)).toBeChecked();
    await expect(inventoryPage.page.locator(`[data-testid="po-item-${item2.sku}"]`)).toBeChecked();
    
    // Fill purchase order details
    await inventoryPage.page.fill('[data-testid="po-supplier-input"]', 'Farm Supply Co.');
    await inventoryPage.page.fill('[data-testid="po-expected-date-input"]', '2024-02-15');
    await inventoryPage.page.fill('[data-testid="po-notes-input"]', 'Monthly restocking order');
    
    // Update quantities
    await inventoryPage.page.fill(`[data-testid="po-quantity-${item1.sku}"]`, '50');
    await inventoryPage.page.fill(`[data-testid="po-quantity-${item2.sku}"]`, '75');
    
    // Create purchase order
    await inventoryPage.page.click('[data-testid="create-po-button"]');
    
    // Verify success message
    await expect(inventoryPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="success-message"]')).toContainText('Purchase order created');
  });

  test('should display low stock alerts', async ({ inventoryPage }) => {
    // Add test items with low stock
    const lowStockItem1 = await TestDataGenerator.generateInventoryItem({ quantity: 5, minStockLevel: 10 });
    const lowStockItem2 = await TestDataGenerator.generateInventoryItem({ quantity: 2, minStockLevel: 15 });
    const normalStockItem = await TestDataGenerator.generateInventoryItem({ quantity: 50, minStockLevel: 10 });
    
    await DataFixtureHelpers.createTestInventoryItem(lowStockItem1, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(lowStockItem2, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(normalStockItem, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Verify low stock alerts are displayed
    await expect(inventoryPage.page.locator('[data-testid="low-stock-alerts"]')).toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="low-stock-alert-${lowStockItem1.sku}"]`)).toBeVisible();
    await expect(inventoryPage.page.locator(`[data-testid="low-stock-alert-${lowStockItem2.sku}"]`)).toBeVisible();
    
    // Verify normal stock item doesn't have alert
    await expect(inventoryPage.page.locator(`[data-testid="low-stock-alert-${normalStockItem.sku}"]`)).not.toBeVisible();
    
    // Verify low stock count in statistics
    const lowStockCount = await inventoryPage.getLowStockCount();
    expect(lowStockCount).toBe(2);
  });

  test('should perform bulk actions', async ({ inventoryPage }) => {
    // Add multiple test items
    const item1 = await TestDataGenerator.generateInventoryItem();
    const item2 = await TestDataGenerator.generateInventoryItem();
    const item3 = await TestDataGenerator.generateInventoryItem();
    
    await DataFixtureHelpers.createTestInventoryItem(item1, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(item2, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(item3, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Select multiple items
    await inventoryPage.page.check(`[data-testid="item-checkbox-${item1.sku}"]`);
    await inventoryPage.page.check(`[data-testid="item-checkbox-${item2.sku}"]`);
    
    // Verify bulk actions are enabled
    await expect(inventoryPage.page.locator('[data-testid="bulk-actions-toolbar"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="bulk-delete-button"]')).toBeEnabled();
    await expect(inventoryPage.page.locator('[data-testid="bulk-update-button"]')).toBeEnabled();
    await expect(inventoryPage.page.locator('[data-testid="bulk-export-button"]')).toBeEnabled();
    
    // Perform bulk category update
    await inventoryPage.page.click('[data-testid="bulk-update-button"]');
    await inventoryPage.page.selectOption('[data-testid="bulk-category-select"]', 'Equipment');
    await inventoryPage.page.click('[data-testid="apply-bulk-update-button"]');
    
    // Verify success message
    await expect(inventoryPage.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify category is updated for selected items
    await expect(inventoryPage.page.locator(`[data-testid="item-category-${item1.sku}"]`)).toContainText('Equipment');
    await expect(inventoryPage.page.locator(`[data-testid="item-category-${item2.sku}"]`)).toContainText('Equipment');
    await expect(inventoryPage.page.locator(`[data-testid="item-category-${item3.sku}"]`)).not.toContainText('Equipment');
  });

  test('should generate inventory reports', async ({ inventoryPage, page }) => {
    // Add test items
    const item1 = await TestDataGenerator.generateInventoryItem({ category: 'Feed' });
    const item2 = await TestDataGenerator.generateInventoryItem({ category: 'Medicine' });
    
    await DataFixtureHelpers.createTestInventoryItem(item1, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(item2, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Click reports button
    await inventoryPage.page.click('[data-testid="inventory-reports-button"]');
    
    // Verify reports modal
    await expect(inventoryPage.page.locator('[data-testid="reports-modal"]')).toBeVisible();
    
    // Generate stock valuation report
    await inventoryPage.page.click('[data-testid="stock-valuation-report"]');
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Generate report
    await inventoryPage.page.click('[data-testid="generate-report-button"]');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('stock-valuation');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should export inventory data', async ({ inventoryPage, page }) => {
    // Add test item
    const itemData = await TestDataGenerator.generateInventoryItem();
    await DataFixtureHelpers.createTestInventoryItem(itemData, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await inventoryPage.page.click('[data-testid="export-inventory-button"]');
    await inventoryPage.page.click('[data-testid="export-csv-option"]');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('inventory');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should handle pagination', async ({ inventoryPage }) => {
    // Add many test items (more than page size)
    for (let i = 0; i < 25; i++) {
      const itemData = await TestDataGenerator.generateInventoryItem();
      await DataFixtureHelpers.createTestInventoryItem(itemData, testFarm.id);
    }
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Verify pagination controls are visible
    await expect(inventoryPage.page.locator('[data-testid="pagination-controls"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="next-page-button"]')).toBeEnabled();
    
    // Go to next page
    await inventoryPage.page.click('[data-testid="next-page-button"]');
    
    // Verify page number changed
    await expect(inventoryPage.page.locator('[data-testid="current-page"]')).toContainText('2');
    
    // Verify previous button is enabled
    await expect(inventoryPage.page.locator('[data-testid="previous-page-button"]')).toBeEnabled();
  });

  test('should sort inventory by different columns', async ({ inventoryPage }) => {
    // Add test items with different data
    const item1 = await TestDataGenerator.generateInventoryItem({ name: 'Alpha Feed', unitPrice: 10.99 });
    const item2 = await TestDataGenerator.generateInventoryItem({ name: 'Beta Supplement', unitPrice: 25.50 });
    const item3 = await TestDataGenerator.generateInventoryItem({ name: 'Gamma Medicine', unitPrice: 15.75 });
    
    await DataFixtureHelpers.createTestInventoryItem(item1, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(item2, testFarm.id);
    await DataFixtureHelpers.createTestInventoryItem(item3, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Sort by name (ascending)
    await inventoryPage.page.click('[data-testid="sort-name"]');
    
    // Verify sort order
    const itemNames = await inventoryPage.page.locator('[data-testid^="item-name-"]').allTextContents();
    expect(itemNames[0]).toContain('Alpha');
    expect(itemNames[1]).toContain('Beta');
    expect(itemNames[2]).toContain('Gamma');
    
    // Sort by price (descending)
    await inventoryPage.page.click('[data-testid="sort-price"]');
    await inventoryPage.page.click('[data-testid="sort-price"]'); // Second click for descending
    
    // Verify sort order by price
    const prices = await inventoryPage.page.locator('[data-testid^="item-price-"]').allTextContents();
    expect(parseFloat(prices[0])).toBeGreaterThan(parseFloat(prices[1]));
    expect(parseFloat(prices[1])).toBeGreaterThan(parseFloat(prices[2]));
  });

  test('should handle server errors gracefully', async ({ inventoryPage, page }) => {
    // Mock server error for item creation
    await page.route('**/api/inventory', route => {
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
    
    const itemData = await TestDataGenerator.generateInventoryItem();
    
    // Try to add item
    await inventoryPage.clickAddItem();
    await inventoryPage.addItem(
      itemData.name,
      itemData.category,
      itemData.description,
      itemData.sku,
      itemData.quantity,
      itemData.unit,
      itemData.unitPrice,
      itemData.minStockLevel,
      itemData.supplier,
      itemData.location
    );
    
    // Verify error message
    await expect(inventoryPage.page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="error-message"]')).toContainText('error');
    
    // Verify modal stays open
    await expect(inventoryPage.page.locator('[data-testid="add-item-modal"]')).toBeVisible();
  });

  test('should maintain data integrity during concurrent operations', async ({ inventoryPage, context }) => {
    const itemData = await TestDataGenerator.generateInventoryItem();
    
    // Add item in first tab
    await inventoryPage.clickAddItem();
    await inventoryPage.addItem(
      itemData.name,
      itemData.category,
      itemData.description,
      itemData.sku,
      itemData.quantity,
      itemData.unit,
      itemData.unitPrice,
      itemData.minStockLevel,
      itemData.supplier,
      itemData.location
    );
    
    // Open second tab and try to add same item
    const secondPage = await context.newPage();
    await secondPage.goto('/inventory');
    
    const secondInventoryPage = new (inventoryPage.constructor as any)(secondPage);
    await secondInventoryPage.clickAddItem();
    await secondInventoryPage.addItem(
      'Different Item',
      'Feed',
      'Different description',
      itemData.sku, // Same SKU
      50,
      'kg',
      15.99,
      10,
      'Different Supplier',
      'Warehouse B'
    );
    
    // Verify duplicate error in second tab
    await expect(secondPage.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(secondPage.locator('[data-testid="error-message"]')).toContainText('already exists');
    
    await secondPage.close();
  });

  test('should track stock movement history', async ({ inventoryPage }) => {
    // Add test item
    const itemData = await TestDataGenerator.generateInventoryItem({ quantity: 100 });
    await DataFixtureHelpers.createTestInventoryItem(itemData, testFarm.id);
    
    // Refresh page
    await inventoryPage.page.reload();
    
    // Record multiple stock movements
    await inventoryPage.recordStockMovement(itemData.sku, 'in');
    await inventoryPage.page.fill('[data-testid="movement-quantity-input"]', '25');
    await inventoryPage.page.selectOption('[data-testid="movement-reason-select"]', 'Purchase');
    await inventoryPage.page.click('[data-testid="save-movement-button"]');
    
    await inventoryPage.recordStockMovement(itemData.sku, 'out');
    await inventoryPage.page.fill('[data-testid="movement-quantity-input"]', '15');
    await inventoryPage.page.selectOption('[data-testid="movement-reason-select"]', 'Usage');
    await inventoryPage.page.click('[data-testid="save-movement-button"]');
    
    // View item details
    await inventoryPage.page.click(`[data-testid="item-row-${itemData.sku}"]`);
    
    // Navigate to movement history tab
    await inventoryPage.page.click('[data-testid="movement-history-tab"]');
    
    // Verify movement history is displayed
    await expect(inventoryPage.page.locator('[data-testid="movement-history-table"]')).toBeVisible();
    
    const movementRows = await inventoryPage.page.locator('[data-testid^="movement-row-"]').count();
    expect(movementRows).toBeGreaterThanOrEqual(2);
    
    // Verify movement details
    await expect(inventoryPage.page.locator('[data-testid="movement-type-in"]')).toBeVisible();
    await expect(inventoryPage.page.locator('[data-testid="movement-type-out"]')).toBeVisible();
  });
});
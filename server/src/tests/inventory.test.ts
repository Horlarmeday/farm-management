import { InventoryType, TransactionType } from '../../../shared/src/types';
import request from 'supertest';
import { app } from '../app';
import { TestData, TestUtils } from './utils';

describe('Inventory API', () => {
  let testData: TestData;

  beforeEach(async () => {
    await TestUtils.cleanupTestData();
    testData = await TestUtils.createTestData();
  });

  afterEach(async () => {
    await TestUtils.cleanupTestData();
  });

  describe('POST /api/inventory', () => {
    it('should create a new inventory item successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const itemData = {
        name: 'Chicken Feed Premium',
        description: 'High quality chicken feed',
        type: InventoryType.FEED,
        unit: 'kg',
        currentStock: 500,
        minimumStock: 50,
        maximumStock: 1000,
        unitCost: 0.75,
        supplier: 'Premium Feed Co.',
        category: 'feed',
        brand: 'FeedMaster',
        expiryDate: '2024-12-31',
        storageLocation: 'Warehouse A',
      };

      const response = await authReq.post('/api/inventory').send(itemData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Inventory item created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(itemData.name);
      expect(response.body.data.type).toBe(itemData.type);
      expect(response.body.data.currentStock).toBe(itemData.currentStock);
      expect(response.body.data.unitCost).toBe(itemData.unitCost);
    });

    it('should fail to create item with duplicate name', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const itemData = {
        name: testData.inventoryItem.name,
        description: 'Duplicate item',
        type: InventoryType.FEED,
        unit: 'kg',
        currentStock: 100,
        minimumStock: 10,
        maximumStock: 500,
        unitCost: 0.5,
      };

      const response = await authReq.post('/api/inventory').send(itemData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail to create item with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const itemData = {
        name: '',
        type: 'invalid-type',
        currentStock: -10,
        unitCost: -5,
      };

      const response = await authReq.post('/api/inventory').send(itemData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const itemData = {
        name: 'Test Item',
        type: InventoryType.FEED,
        unit: 'kg',
        currentStock: 100,
        unitCost: 0.5,
      };

      const response = await request(app).post('/api/inventory').send(itemData).expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/inventory', () => {
    it('should get all inventory items with pagination', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/inventory')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.pagination).toHaveProperty('currentPage');
      expect(response.body.data.pagination).toHaveProperty('totalPages');
      expect(response.body.data.pagination).toHaveProperty('totalItems');
    });

    it('should filter inventory items by type', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/inventory')
        .query({ type: InventoryType.FEED })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.every((item: any) => item.type === InventoryType.FEED)).toBe(
        true,
      );
    });

    it('should filter inventory items by low stock', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/inventory').query({ lowStock: true }).expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should search inventory items by name', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/inventory').query({ search: 'Layer' }).expect(200);

      expect(response.body.success).toBe(true);
      expect(
        response.body.data.items.every((item: any) => item.name.toLowerCase().includes('layer')),
      ).toBe(true);
    });

    it('should sort inventory items', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/inventory')
        .query({ sortBy: 'name', sortOrder: 'asc' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/inventory').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/inventory/:id', () => {
    it('should get inventory item by ID', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get(`/api/inventory/${testData.inventoryItem.id}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testData.inventoryItem.id);
      expect(response.body.data.name).toBe(testData.inventoryItem.name);
    });

    it('should return 404 for non-existent item', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/inventory/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/inventory/${testData.inventoryItem.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/inventory/:id', () => {
    it('should update inventory item successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const updateData = {
        name: 'Updated Layer Feed',
        description: 'Updated description',
        unitCost: 0.6,
        minimumStock: 150,
      };

      const response = await authReq
        .put(`/api/inventory/${testData.inventoryItem.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.unitCost).toBe(updateData.unitCost);
    });

    it('should fail to update with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const updateData = {
        currentStock: -10,
        unitCost: -5,
      };

      const response = await authReq
        .put(`/api/inventory/${testData.inventoryItem.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent item', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .put('/api/inventory/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/inventory/${testData.inventoryItem.id}`)
        .send({ name: 'Updated Name' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/inventory/:id', () => {
    it('should soft delete inventory item successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .delete(`/api/inventory/${testData.inventoryItem.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify item is soft deleted
      const getResponse = await authReq
        .get(`/api/inventory/${testData.inventoryItem.id}`)
        .expect(404);
    });

    it('should return 404 for non-existent item', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.delete('/api/inventory/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/inventory/${testData.inventoryItem.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/inventory/:id/adjust', () => {
    it('should adjust inventory stock successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const adjustmentData = {
        quantity: 50,
        type: 'increase',
        reason: 'New stock received',
        cost: 25.0,
      };

      const response = await authReq
        .post(`/api/inventory/${testData.inventoryItem.id}/adjust`)
        .send(adjustmentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentStock).toBe(
        testData.inventoryItem.currentStock + adjustmentData.quantity,
      );
    });

    it('should decrease inventory stock successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const adjustmentData = {
        quantity: 30,
        type: 'decrease',
        reason: 'Damaged goods',
      };

      const response = await authReq
        .post(`/api/inventory/${testData.inventoryItem.id}/adjust`)
        .send(adjustmentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentStock).toBe(
        testData.inventoryItem.currentStock - adjustmentData.quantity,
      );
    });

    it('should fail to decrease stock below zero', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const adjustmentData = {
        quantity: testData.inventoryItem.currentStock + 100,
        type: 'decrease',
        reason: 'Over adjustment',
      };

      const response = await authReq
        .post(`/api/inventory/${testData.inventoryItem.id}/adjust`)
        .send(adjustmentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient stock');
    });

    it('should fail with invalid adjustment type', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const adjustmentData = {
        quantity: 50,
        type: 'invalid-type',
        reason: 'Test',
      };

      const response = await authReq
        .post(`/api/inventory/${testData.inventoryItem.id}/adjust`)
        .send(adjustmentData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/inventory/:id/transactions', () => {
    it('should get inventory transaction history', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      // First create a transaction
      await authReq.post(`/api/inventory/${testData.inventoryItem.id}/adjust`).send({
        quantity: 50,
        type: 'increase',
        reason: 'Test transaction',
      });

      const response = await authReq
        .get(`/api/inventory/${testData.inventoryItem.id}/transactions`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('transactions');
      expect(Array.isArray(response.body.data.transactions)).toBe(true);
    });

    it('should filter transactions by type', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/inventory/${testData.inventoryItem.id}/transactions`)
        .query({ type: TransactionType.PURCHASE })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter transactions by date range', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const response = await authReq
        .get(`/api/inventory/${testData.inventoryItem.id}/transactions`)
        .query({ startDate, endDate })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/inventory/transactions', () => {
    it('should record inventory transaction successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const transactionData = {
        itemId: testData.inventoryItem.id,
        type: TransactionType.USAGE,
        quantity: 25,
        reason: 'Fed to chickens',
        referenceType: 'bird_feeding',
        referenceId: testData.birdBatch.id,
      };

      const response = await authReq
        .post('/api/inventory/transactions')
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe(transactionData.type);
      expect(response.body.data.quantity).toBe(transactionData.quantity);
      expect(response.body.data.reason).toBe(transactionData.reason);
    });

    it('should fail with invalid transaction data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const transactionData = {
        itemId: 'invalid-id',
        type: 'invalid-type',
        quantity: -10,
      };

      const response = await authReq
        .post('/api/inventory/transactions')
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/inventory/low-stock', () => {
    it('should get items with low stock', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/inventory/low-stock').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('should filter low stock items by threshold', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/inventory/low-stock')
        .query({ threshold: 200 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/inventory/expiring', () => {
    it('should get expiring items', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/inventory/expiring').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('should filter expiring items by days', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/inventory/expiring').query({ days: 30 }).expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/inventory/analytics', () => {
    it('should get inventory analytics', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/inventory/analytics').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('itemsByType');
      expect(response.body.data).toHaveProperty('stockLevels');
      expect(response.body.data).toHaveProperty('transactions');
    });

    it('should filter analytics by date range', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const response = await authReq
        .get('/api/inventory/analytics')
        .query({ startDate, endDate })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/inventory/bulk-import', () => {
    it('should import inventory items from CSV', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const csvData = `name,type,unit,currentStock,unitCost
Feed Type A,feed,kg,500,0.75
Medicine B,medicine,bottle,20,15.50
Tool C,tool,piece,5,125.00`;

      const response = await authReq
        .post('/api/inventory/bulk-import')
        .attach('file', Buffer.from(csvData), 'inventory.csv')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('imported');
      expect(response.body.data).toHaveProperty('failed');
      expect(response.body.data.imported).toBeGreaterThan(0);
    });

    it('should handle CSV with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const csvData = `name,type,unit,currentStock,unitCost
,feed,kg,500,0.75
Valid Item,medicine,bottle,20,15.50
Another Item,invalid-type,piece,-5,125.00`;

      const response = await authReq
        .post('/api/inventory/bulk-import')
        .attach('file', Buffer.from(csvData), 'inventory.csv')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.imported).toBeGreaterThan(0);
      expect(response.body.data.failed).toBeGreaterThan(0);
    });

    it('should fail without file', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.post('/api/inventory/bulk-import').expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('file');
    });
  });

  describe('GET /api/inventory/export', () => {
    it('should export inventory to CSV', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/inventory/export')
        .query({ format: 'csv' })
        .expect(200);

      expect(response.header['content-type']).toContain('text/csv');
      expect(response.header['content-disposition']).toContain('attachment');
    });

    it('should export inventory to Excel', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/inventory/export')
        .query({ format: 'excel' })
        .expect(200);

      expect(response.header['content-type']).toContain('application/vnd.openxmlformats');
      expect(response.header['content-disposition']).toContain('attachment');
    });

    it('should filter export by type', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/inventory/export')
        .query({ format: 'csv', type: InventoryType.FEED })
        .expect(200);

      expect(response.header['content-type']).toContain('text/csv');
    });
  });

  describe('Permission Tests', () => {
    it('should allow manager to create inventory items', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.managerUser.accessToken);

      const itemData = {
        name: 'Manager Test Item',
        type: InventoryType.FEED,
        unit: 'kg',
        currentStock: 100,
        unitCost: 0.5,
      };

      const response = await authReq.post('/api/inventory').send(itemData).expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should allow worker to view inventory items', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.workerUser.accessToken);

      const response = await authReq.get('/api/inventory').expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should prevent worker from deleting inventory items', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.workerUser.accessToken);

      const response = await authReq
        .delete(`/api/inventory/${testData.inventoryItem.id}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });
  });
});

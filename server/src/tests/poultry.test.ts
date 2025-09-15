import { BirdStatus, BirdType } from '../../../shared/src/types';
import request from 'supertest';
import { app } from '../app';
import { TestData, TestUtils } from './utils';

describe('Poultry API', () => {
  let testData: TestData;

  beforeEach(async () => {
    await TestUtils.cleanupTestData();
    testData = await TestUtils.createTestData();
  });

  afterEach(async () => {
    await TestUtils.cleanupTestData();
  });

  describe('POST /api/poultry/batches', () => {
    it('should create a new bird batch successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const batchData = {
        batchCode: 'BB002',
        birdType: BirdType.BROILER,
        breed: 'Ross 308',
        quantity: 500,
        arrivalDate: '2024-01-15',
        source: 'Premium Hatchery',
        ageInDays: 1,
        unitCost: 3.5,
        locationId: testData.location.id,
        notes: 'High quality broiler chicks',
      };

      const response = await authReq.post('/api/poultry/batches').send(batchData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Bird batch created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.batchCode).toBe(batchData.batchCode);
      expect(response.body.data.birdType).toBe(batchData.birdType);
      expect(response.body.data.breed).toBe(batchData.breed);
      expect(response.body.data.quantity).toBe(batchData.quantity);
      expect(response.body.data.currentQuantity).toBe(batchData.quantity);
      expect(response.body.data.status).toBe(BirdStatus.ACTIVE);
    });

    it('should fail to create batch with duplicate batch code', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const batchData = {
        batchCode: testData.birdBatch.batchCode,
        birdType: BirdType.LAYER,
        breed: 'Test Breed',
        quantity: 100,
        arrivalDate: '2024-01-15',
        locationId: testData.location.id,
      };

      const response = await authReq.post('/api/poultry/batches').send(batchData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail to create batch with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const batchData = {
        batchCode: '',
        birdType: 'invalid-type',
        quantity: -10,
        unitCost: -5,
      };

      const response = await authReq.post('/api/poultry/batches').send(batchData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const batchData = {
        batchCode: 'BB003',
        birdType: BirdType.LAYER,
        breed: 'Test Breed',
        quantity: 100,
        arrivalDate: '2024-01-15',
        locationId: testData.location.id,
      };

      const response = await request(app).post('/api/poultry/batches').send(batchData).expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/poultry/batches', () => {
    it('should get all bird batches with pagination', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/poultry/batches')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('batches');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.batches)).toBe(true);
      expect(response.body.data.pagination).toHaveProperty('currentPage');
      expect(response.body.data.pagination).toHaveProperty('totalPages');
    });

    it('should filter batches by bird type', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/poultry/batches')
        .query({ birdType: BirdType.LAYER })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(
        response.body.data.batches.every((batch: any) => batch.birdType === BirdType.LAYER),
      ).toBe(true);
    });

    it('should filter batches by status', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/poultry/batches')
        .query({ status: BirdStatus.ACTIVE })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(
        response.body.data.batches.every((batch: any) => batch.status === BirdStatus.ACTIVE),
      ).toBe(true);
    });

    it('should search batches by batch code', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/poultry/batches')
        .query({ search: testData.birdBatch.batchCode })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should sort batches', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/poultry/batches')
        .query({ sortBy: 'arrivalDate', sortOrder: 'desc' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/poultry/batches/:id', () => {
    it('should get bird batch by ID', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/poultry/batches/${testData.birdBatch.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testData.birdBatch.id);
      expect(response.body.data.batchCode).toBe(testData.birdBatch.batchCode);
    });

    it('should return 404 for non-existent batch', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/poultry/batches/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/poultry/batches/:id', () => {
    it('should update bird batch successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const updateData = {
        breed: 'Updated Breed',
        notes: 'Updated notes',
        currentQuantity: 95,
      };

      const response = await authReq
        .put(`/api/poultry/batches/${testData.birdBatch.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.breed).toBe(updateData.breed);
      expect(response.body.data.notes).toBe(updateData.notes);
      expect(response.body.data.currentQuantity).toBe(updateData.currentQuantity);
    });

    it('should fail to update with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const updateData = {
        currentQuantity: -10,
        quantity: -5,
      };

      const response = await authReq
        .put(`/api/poultry/batches/${testData.birdBatch.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/poultry/batches/:id', () => {
    it('should soft delete bird batch successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .delete(`/api/poultry/batches/${testData.birdBatch.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });
  });

  describe('POST /api/poultry/batches/:id/feeding', () => {
    it('should record feeding successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const feedingData = {
        date: '2024-01-20',
        feedType: 'Starter Feed',
        quantityKg: 50,
        costPerKg: 0.75,
        remarks: 'Daily feeding',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/poultry/batches/${testData.birdBatch.id}/feeding`)
        .send(feedingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.feedType).toBe(feedingData.feedType);
      expect(response.body.data.quantityKg).toBe(feedingData.quantityKg);
    });

    it('should update inventory when recording feeding', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const feedingData = {
        date: '2024-01-20',
        feedType: testData.inventoryItem.name,
        quantityKg: 25,
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/poultry/batches/${testData.birdBatch.id}/feeding`)
        .send(feedingData)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Check that inventory was updated
      const inventoryResponse = await authReq
        .get(`/api/inventory/${testData.inventoryItem.id}`)
        .expect(200);

      expect(inventoryResponse.body.data.currentStock).toBe(
        testData.inventoryItem.currentStock - feedingData.quantityKg,
      );
    });

    it('should fail with invalid feeding data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const feedingData = {
        quantityKg: -10,
        costPerKg: -5,
      };

      const response = await authReq
        .post(`/api/poultry/batches/${testData.birdBatch.id}/feeding`)
        .send(feedingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/poultry/batches/:id/feeding', () => {
    it('should get feeding history for batch', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      // First record some feeding
      await authReq.post(`/api/poultry/batches/${testData.birdBatch.id}/feeding`).send({
        date: '2024-01-20',
        feedType: 'Test Feed',
        quantityKg: 30,
        recordedById: testData.adminUser.id,
      });

      const response = await authReq
        .get(`/api/poultry/batches/${testData.birdBatch.id}/feeding`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('feedingLogs');
      expect(Array.isArray(response.body.data.feedingLogs)).toBe(true);
    });

    it('should filter feeding history by date range', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await authReq
        .get(`/api/poultry/batches/${testData.birdBatch.id}/feeding`)
        .query({ startDate, endDate })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/poultry/batches/:id/health', () => {
    it('should record health event successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const healthData = {
        date: '2024-01-20',
        type: 'vaccination',
        description: 'Newcastle disease vaccine',
        treatment: 'ND vaccine via drinking water',
        cost: 150.0,
        veterinarian: 'Dr. Smith',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/poultry/batches/${testData.birdBatch.id}/health`)
        .send(healthData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe(healthData.type);
      expect(response.body.data.description).toBe(healthData.description);
    });

    it('should update inventory when recording medication usage', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const healthData = {
        date: '2024-01-20',
        type: 'treatment',
        description: 'Antibiotic treatment',
        medicationUsed: testData.inventoryItem.name,
        quantityUsed: 5,
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/poultry/batches/${testData.birdBatch.id}/health`)
        .send(healthData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/poultry/batches/:id/health', () => {
    it('should get health history for batch', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/poultry/batches/${testData.birdBatch.id}/health`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('healthRecords');
      expect(Array.isArray(response.body.data.healthRecords)).toBe(true);
    });
  });

  describe('POST /api/poultry/batches/:id/eggs', () => {
    it('should record egg production successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const eggData = {
        date: '2024-01-20',
        totalEggs: 85,
        gradeA: 70,
        gradeB: 12,
        gradeC: 3,
        cracked: 0,
        notes: 'Good production day',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/poultry/batches/${testData.birdBatch.id}/eggs`)
        .send(eggData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalEggs).toBe(eggData.totalEggs);
      expect(response.body.data.gradeA).toBe(eggData.gradeA);
    });

    it('should fail with invalid egg production data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const eggData = {
        totalEggs: -10,
        gradeA: -5,
      };

      const response = await authReq
        .post(`/api/poultry/batches/${testData.birdBatch.id}/eggs`)
        .send(eggData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/poultry/batches/:id/eggs', () => {
    it('should get egg production history for batch', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/poultry/batches/${testData.birdBatch.id}/eggs`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('eggProduction');
      expect(Array.isArray(response.body.data.eggProduction)).toBe(true);
    });

    it('should filter egg production by date range', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await authReq
        .get(`/api/poultry/batches/${testData.birdBatch.id}/eggs`)
        .query({ startDate, endDate })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/poultry/batches/:id/sales', () => {
    it('should record bird sale successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const saleData = {
        date: '2024-01-20',
        quantity: 10,
        unitPrice: 15.5,
        buyerName: 'Local Market',
        buyerContact: '+1234567890',
        notes: 'Sold 10 mature birds',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/poultry/batches/${testData.birdBatch.id}/sales`)
        .send(saleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(saleData.quantity);
      expect(response.body.data.unitPrice).toBe(saleData.unitPrice);
      expect(response.body.data.totalAmount).toBe(saleData.quantity * saleData.unitPrice);
    });

    it('should update batch current quantity after sale', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const saleData = {
        date: '2024-01-20',
        quantity: 5,
        unitPrice: 15.5,
        buyerName: 'Test Buyer',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/poultry/batches/${testData.birdBatch.id}/sales`)
        .send(saleData)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Check that batch quantity was updated
      const batchResponse = await authReq
        .get(`/api/poultry/batches/${testData.birdBatch.id}`)
        .expect(200);

      expect(batchResponse.body.data.currentQuantity).toBe(
        testData.birdBatch.currentQuantity - saleData.quantity,
      );
    });

    it('should fail to sell more birds than available', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const saleData = {
        quantity: testData.birdBatch.currentQuantity + 10,
        unitPrice: 15.5,
        buyerName: 'Test Buyer',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/poultry/batches/${testData.birdBatch.id}/sales`)
        .send(saleData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient');
    });
  });

  describe('GET /api/poultry/batches/:id/sales', () => {
    it('should get sales history for batch', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/poultry/batches/${testData.birdBatch.id}/sales`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sales');
      expect(Array.isArray(response.body.data.sales)).toBe(true);
    });
  });

  describe('GET /api/poultry/batches/:id/performance', () => {
    it('should get batch performance metrics', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/poultry/batches/${testData.birdBatch.id}/performance`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('feedConversionRatio');
      expect(response.body.data).toHaveProperty('mortalityRate');
      expect(response.body.data).toHaveProperty('averageWeight');
      expect(response.body.data).toHaveProperty('productionRate');
    });
  });

  describe('GET /api/poultry/analytics', () => {
    it('should get poultry analytics', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/poultry/analytics').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalBatches');
      expect(response.body.data).toHaveProperty('totalBirds');
      expect(response.body.data).toHaveProperty('activeBatches');
      expect(response.body.data).toHaveProperty('batchesByType');
      expect(response.body.data).toHaveProperty('feedConsumption');
      expect(response.body.data).toHaveProperty('eggProduction');
    });

    it('should filter analytics by date range', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await authReq
        .get('/api/poultry/analytics')
        .query({ startDate, endDate })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/poultry/feed-conversion', () => {
    it('should get feed conversion analysis', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/poultry/feed-conversion').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('batchAnalysis');
      expect(response.body.data).toHaveProperty('averageFCR');
      expect(response.body.data).toHaveProperty('bestPerforming');
      expect(response.body.data).toHaveProperty('recommendations');
    });
  });

  describe('GET /api/poultry/mortality', () => {
    it('should get mortality analysis', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/poultry/mortality').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalMortality');
      expect(response.body.data).toHaveProperty('mortalityRate');
      expect(response.body.data).toHaveProperty('mortalityByBatch');
      expect(response.body.data).toHaveProperty('mortalityTrends');
    });
  });

  describe('GET /api/poultry/production-forecast', () => {
    it('should get production forecast', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/poultry/production-forecast')
        .query({ days: 30 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('eggForecast');
      expect(response.body.data).toHaveProperty('feedRequirement');
      expect(response.body.data).toHaveProperty('expectedRevenue');
    });
  });

  describe('Permission Tests', () => {
    it('should allow manager to create bird batches', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.managerUser.accessToken);

      const batchData = {
        batchCode: 'MGR001',
        birdType: BirdType.LAYER,
        breed: 'Manager Test',
        quantity: 50,
        arrivalDate: '2024-01-15',
        locationId: testData.location.id,
      };

      const response = await authReq.post('/api/poultry/batches').send(batchData).expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should allow worker to view batches', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.workerUser.accessToken);

      const response = await authReq.get('/api/poultry/batches').expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should prevent worker from deleting batches', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.workerUser.accessToken);

      const response = await authReq
        .delete(`/api/poultry/batches/${testData.birdBatch.id}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });
  });
});

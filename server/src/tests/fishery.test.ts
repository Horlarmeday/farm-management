import { TestData, TestUtils } from './utils';

describe('Fishery API', () => {
  let testData: TestData;

  beforeEach(async () => {
    await TestUtils.cleanupTestData();
    testData = await TestUtils.createTestData();
  });

  afterEach(async () => {
    await TestUtils.cleanupTestData();
  });

  describe('POST /api/fishery/ponds', () => {
    it('should create a new pond successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const pondData = {
        name: 'Test Pond 2',
        type: 'concrete',
        size: 2000,
        depth: 3.0,
        waterSource: 'river',
        locationId: testData.location.id,
        notes: 'New concrete pond',
      };

      const response = await authReq.post('/api/fishery/ponds').send(pondData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Pond created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(pondData.name);
      expect(response.body.data.type).toBe(pondData.type);
      expect(response.body.data.size).toBe(pondData.size);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should fail to create pond with duplicate name', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const pondData = {
        name: testData.pond.name,
        type: 'earthen',
        size: 1000,
        depth: 2.0,
        waterSource: 'borehole',
        locationId: testData.location.id,
      };

      const response = await authReq.post('/api/fishery/ponds').send(pondData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail to create pond with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const pondData = {
        name: '',
        type: 'invalid-type',
        size: -100,
        depth: -2,
      };

      const response = await authReq.post('/api/fishery/ponds').send(pondData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/fishery/ponds', () => {
    it('should get all ponds with pagination', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/fishery/ponds')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('ponds');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.ponds)).toBe(true);
    });

    it('should filter ponds by type', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/fishery/ponds')
        .query({ type: 'earthen' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ponds.every((pond: any) => pond.type === 'earthen')).toBe(true);
    });

    it('should filter ponds by active status', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/fishery/ponds')
        .query({ isActive: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ponds.every((pond: any) => pond.isActive === true)).toBe(true);
    });
  });

  describe('GET /api/fishery/ponds/:id', () => {
    it('should get pond by ID', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get(`/api/fishery/ponds/${testData.pond.id}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testData.pond.id);
      expect(response.body.data.name).toBe(testData.pond.name);
    });

    it('should return 404 for non-existent pond', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/fishery/ponds/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/fishery/ponds/:id', () => {
    it('should update pond successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const updateData = {
        size: 1200,
        depth: 3.0,
        notes: 'Updated pond information',
      };

      const response = await authReq
        .put(`/api/fishery/ponds/${testData.pond.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.size).toBe(updateData.size);
      expect(response.body.data.depth).toBe(updateData.depth);
      expect(response.body.data.notes).toBe(updateData.notes);
    });

    it('should fail to update with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const updateData = {
        size: -100,
        depth: -2,
      };

      const response = await authReq
        .put(`/api/fishery/ponds/${testData.pond.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/fishery/ponds/:id/stocking', () => {
    it('should record fish stocking successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const stockingData = {
        date: '2024-01-20',
        species: 'Catfish',
        quantity: 1000,
        averageWeight: 0.05,
        totalWeight: 50,
        source: 'Local Hatchery',
        cost: 500.0,
        notes: 'First stocking of the season',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/fishery/ponds/${testData.pond.id}/stocking`)
        .send(stockingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.species).toBe(stockingData.species);
      expect(response.body.data.quantity).toBe(stockingData.quantity);
      expect(response.body.data.totalWeight).toBe(stockingData.totalWeight);
    });

    it('should fail with invalid stocking data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const stockingData = {
        quantity: -100,
        averageWeight: -0.1,
        cost: -50,
      };

      const response = await authReq
        .post(`/api/fishery/ponds/${testData.pond.id}/stocking`)
        .send(stockingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/fishery/ponds/:id/stocking', () => {
    it('should get stocking history for pond', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/fishery/ponds/${testData.pond.id}/stocking`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('stockingLogs');
      expect(Array.isArray(response.body.data.stockingLogs)).toBe(true);
    });
  });

  describe('POST /api/fishery/ponds/:id/feeding', () => {
    it('should record fish feeding successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const feedingData = {
        date: '2024-01-20',
        feedType: 'Catfish Feed',
        quantity: 25,
        cost: 37.5,
        notes: 'Morning feeding',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/fishery/ponds/${testData.pond.id}/feeding`)
        .send(feedingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.feedType).toBe(feedingData.feedType);
      expect(response.body.data.quantity).toBe(feedingData.quantity);
    });

    it('should update inventory when recording feeding', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const feedingData = {
        date: '2024-01-20',
        feedType: testData.inventoryItem.name,
        quantity: 20,
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/fishery/ponds/${testData.pond.id}/feeding`)
        .send(feedingData)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Check that inventory was updated
      const inventoryResponse = await authReq
        .get(`/api/inventory/${testData.inventoryItem.id}`)
        .expect(200);

      expect(inventoryResponse.body.data.currentStock).toBe(
        testData.inventoryItem.currentStock - feedingData.quantity,
      );
    });
  });

  describe('GET /api/fishery/ponds/:id/feeding', () => {
    it('should get feeding history for pond', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/fishery/ponds/${testData.pond.id}/feeding`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('feedingLogs');
      expect(Array.isArray(response.body.data.feedingLogs)).toBe(true);
    });
  });

  describe('POST /api/fishery/ponds/:id/water-quality', () => {
    it('should record water quality data successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const waterQualityData = {
        date: '2024-01-20',
        temperature: 25.5,
        ph: 7.2,
        oxygenLevel: 8.5,
        ammonia: 0.1,
        nitrite: 0.05,
        nitrate: 2.0,
        turbidity: 15,
        notes: 'Good water quality',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/fishery/ponds/${testData.pond.id}/water-quality`)
        .send(waterQualityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.temperature).toBe(waterQualityData.temperature);
      expect(response.body.data.ph).toBe(waterQualityData.ph);
      expect(response.body.data.oxygenLevel).toBe(waterQualityData.oxygenLevel);
    });

    it('should fail with invalid water quality data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const waterQualityData = {
        temperature: -10,
        ph: 15,
        oxygenLevel: -5,
      };

      const response = await authReq
        .post(`/api/fishery/ponds/${testData.pond.id}/water-quality`)
        .send(waterQualityData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/fishery/ponds/:id/water-quality', () => {
    it('should get water quality history for pond', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/fishery/ponds/${testData.pond.id}/water-quality`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('waterQualityLogs');
      expect(Array.isArray(response.body.data.waterQualityLogs)).toBe(true);
    });

    it('should filter water quality by date range', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await authReq
        .get(`/api/fishery/ponds/${testData.pond.id}/water-quality`)
        .query({ startDate, endDate })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/fishery/ponds/:id/sampling', () => {
    it('should record fish sampling successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const samplingData = {
        date: '2024-01-20',
        sampleSize: 50,
        averageWeight: 0.25,
        totalWeight: 12.5,
        survivalRate: 95,
        notes: 'Good growth observed',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/fishery/ponds/${testData.pond.id}/sampling`)
        .send(samplingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sampleSize).toBe(samplingData.sampleSize);
      expect(response.body.data.averageWeight).toBe(samplingData.averageWeight);
      expect(response.body.data.survivalRate).toBe(samplingData.survivalRate);
    });

    it('should fail with invalid sampling data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const samplingData = {
        sampleSize: -10,
        averageWeight: -0.1,
        survivalRate: 150,
      };

      const response = await authReq
        .post(`/api/fishery/ponds/${testData.pond.id}/sampling`)
        .send(samplingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/fishery/ponds/:id/sampling', () => {
    it('should get sampling history for pond', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/fishery/ponds/${testData.pond.id}/sampling`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('samplingLogs');
      expect(Array.isArray(response.body.data.samplingLogs)).toBe(true);
    });
  });

  describe('POST /api/fishery/ponds/:id/harvest', () => {
    it('should record fish harvest successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const harvestData = {
        date: '2024-01-20',
        totalWeight: 500,
        quantityHarvested: 1500,
        averageWeight: 0.33,
        pricePerKg: 5.5,
        totalRevenue: 2750.0,
        buyerName: 'Fish Market',
        notes: 'Partial harvest',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/fishery/ponds/${testData.pond.id}/harvest`)
        .send(harvestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalWeight).toBe(harvestData.totalWeight);
      expect(response.body.data.quantityHarvested).toBe(harvestData.quantityHarvested);
      expect(response.body.data.totalRevenue).toBe(harvestData.totalRevenue);
    });

    it('should fail with invalid harvest data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const harvestData = {
        totalWeight: -100,
        quantityHarvested: -50,
        pricePerKg: -5,
      };

      const response = await authReq
        .post(`/api/fishery/ponds/${testData.pond.id}/harvest`)
        .send(harvestData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/fishery/ponds/:id/harvest', () => {
    it('should get harvest history for pond', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/fishery/ponds/${testData.pond.id}/harvest`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('harvestLogs');
      expect(Array.isArray(response.body.data.harvestLogs)).toBe(true);
    });
  });

  describe('GET /api/fishery/ponds/:id/performance', () => {
    it('should get pond performance metrics', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/fishery/ponds/${testData.pond.id}/performance`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('feedConversionRatio');
      expect(response.body.data).toHaveProperty('survivalRate');
      expect(response.body.data).toHaveProperty('growthRate');
      expect(response.body.data).toHaveProperty('waterQualityTrend');
    });
  });

  describe('GET /api/fishery/analytics', () => {
    it('should get fishery analytics', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/fishery/analytics').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalPonds');
      expect(response.body.data).toHaveProperty('activePonds');
      expect(response.body.data).toHaveProperty('totalFish');
      expect(response.body.data).toHaveProperty('pondsByType');
      expect(response.body.data).toHaveProperty('feedConsumption');
      expect(response.body.data).toHaveProperty('harvestSummary');
    });

    it('should filter analytics by date range', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await authReq
        .get('/api/fishery/analytics')
        .query({ startDate, endDate })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/fishery/water-quality-alerts', () => {
    it('should get water quality alerts', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/fishery/water-quality-alerts').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('alerts');
      expect(Array.isArray(response.body.data.alerts)).toBe(true);
    });
  });

  describe('GET /api/fishery/feed-schedule', () => {
    it('should get feeding schedule', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/fishery/feed-schedule').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('schedule');
      expect(response.body.data).toHaveProperty('recommendations');
    });
  });

  describe('GET /api/fishery/harvest-forecast', () => {
    it('should get harvest forecast', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/fishery/harvest-forecast')
        .query({ days: 30 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('forecast');
      expect(response.body.data).toHaveProperty('expectedWeight');
      expect(response.body.data).toHaveProperty('estimatedRevenue');
    });
  });

  describe('Permission Tests', () => {
    it('should allow manager to create ponds', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.managerUser.accessToken);

      const pondData = {
        name: 'Manager Pond',
        type: 'concrete',
        size: 1500,
        depth: 2.5,
        waterSource: 'borehole',
        locationId: testData.location.id,
      };

      const response = await authReq.post('/api/fishery/ponds').send(pondData).expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should allow worker to view ponds', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.workerUser.accessToken);

      const response = await authReq.get('/api/fishery/ponds').expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should prevent worker from deleting ponds', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.workerUser.accessToken);

      const response = await authReq.delete(`/api/fishery/ponds/${testData.pond.id}`).expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });
  });
});

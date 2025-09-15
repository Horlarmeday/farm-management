import { AnimalType } from '../../../shared/src/types';
import request from 'supertest';
import { app } from '../app';
import { TestData, TestUtils } from './utils';

describe('Livestock API', () => {
  let testData: TestData;

  beforeEach(async () => {
    await TestUtils.cleanupTestData();
    testData = await TestUtils.createTestData();
  });

  afterEach(async () => {
    await TestUtils.cleanupTestData();
  });

  describe('POST /api/livestock/animals', () => {
    it('should create a new animal successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const animalData = {
        tagNumber: 'COW002',
        type: AnimalType.CATTLE,
        breed: 'Jersey',
        gender: 'female',
        dateOfBirth: '2020-03-15',
        acquisitionDate: '2020-04-01',
        source: 'Local Farm',
        weight: 400,
        color: 'Brown',
        parentFemaleId: testData.animal.id,
        locationId: testData.location.id,
        notes: 'Young heifer',
      };

      const response = await authReq.post('/api/livestock/animals').send(animalData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Animal created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.tagNumber).toBe(animalData.tagNumber);
      expect(response.body.data.type).toBe(animalData.type);
      expect(response.body.data.breed).toBe(animalData.breed);
      expect(response.body.data.status).toBe('alive');
    });

    it('should fail to create animal with duplicate tag number', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const animalData = {
        tagNumber: testData.animal.tagNumber,
        type: AnimalType.CATTLE,
        breed: 'Test Breed',
        gender: 'male',
        dateOfBirth: '2020-01-01',
        acquisitionDate: '2020-02-01',
        locationId: testData.location.id,
      };

      const response = await authReq.post('/api/livestock/animals').send(animalData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail to create animal with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const animalData = {
        tagNumber: '',
        type: 'invalid-type',
        weight: -10,
        gender: 'invalid-gender',
      };

      const response = await authReq.post('/api/livestock/animals').send(animalData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const animalData = {
        tagNumber: 'COW003',
        type: AnimalType.CATTLE,
        breed: 'Test Breed',
        gender: 'female',
        dateOfBirth: '2020-01-01',
        acquisitionDate: '2020-02-01',
        locationId: testData.location.id,
      };

      const response = await request(app)
        .post('/api/livestock/animals')
        .send(animalData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/livestock/animals', () => {
    it('should get all animals with pagination', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/livestock/animals')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('animals');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.animals)).toBe(true);
      expect(response.body.data.pagination).toHaveProperty('currentPage');
      expect(response.body.data.pagination).toHaveProperty('totalPages');
    });

    it('should filter animals by type', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/livestock/animals')
        .query({ type: AnimalType.CATTLE })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(
        response.body.data.animals.every((animal: any) => animal.type === AnimalType.CATTLE),
      ).toBe(true);
    });

    it('should filter animals by status', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/livestock/animals')
        .query({ status: 'alive' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.animals.every((animal: any) => animal.status === 'alive')).toBe(
        true,
      );
    });

    it('should search animals by tag number', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/livestock/animals')
        .query({ search: testData.animal.tagNumber })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter animals by breed', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/livestock/animals')
        .query({ breed: 'Holstein' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/livestock/animals/:id', () => {
    it('should get animal by ID', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/livestock/animals/${testData.animal.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testData.animal.id);
      expect(response.body.data.tagNumber).toBe(testData.animal.tagNumber);
    });

    it('should return 404 for non-existent animal', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/livestock/animals/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/livestock/animals/:id', () => {
    it('should update animal successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const updateData = {
        weight: 550,
        notes: 'Updated notes',
        color: 'Black and White',
      };

      const response = await authReq
        .put(`/api/livestock/animals/${testData.animal.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.weight).toBe(updateData.weight);
      expect(response.body.data.notes).toBe(updateData.notes);
      expect(response.body.data.color).toBe(updateData.color);
    });

    it('should fail to update with invalid data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const updateData = {
        weight: -10,
        gender: 'invalid-gender',
      };

      const response = await authReq
        .put(`/api/livestock/animals/${testData.animal.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/livestock/animals/:id', () => {
    it('should soft delete animal successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .delete(`/api/livestock/animals/${testData.animal.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });
  });

  describe('POST /api/livestock/animals/:id/health', () => {
    it('should record health event successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const healthData = {
        date: '2024-01-20',
        type: 'vaccination',
        description: 'FMD vaccination',
        treatment: 'Foot and Mouth Disease vaccine',
        cost: 25.0,
        veterinarian: 'Dr. Johnson',
        nextDueDate: '2024-07-20',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/livestock/animals/${testData.animal.id}/health`)
        .send(healthData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe(healthData.type);
      expect(response.body.data.description).toBe(healthData.description);
    });

    it('should fail with invalid health data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const healthData = {
        type: 'invalid-type',
        cost: -25,
      };

      const response = await authReq
        .post(`/api/livestock/animals/${testData.animal.id}/health`)
        .send(healthData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/livestock/animals/:id/health', () => {
    it('should get health history for animal', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/livestock/animals/${testData.animal.id}/health`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('healthRecords');
      expect(Array.isArray(response.body.data.healthRecords)).toBe(true);
    });

    it('should filter health records by type', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/livestock/animals/${testData.animal.id}/health`)
        .query({ type: 'vaccination' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/livestock/animals/:id/breeding', () => {
    it('should record breeding event successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const breedingData = {
        date: '2024-01-20',
        method: 'artificial_insemination',
        sireId: testData.animal.id,
        notes: 'First AI attempt',
        expectedCalvingDate: '2024-10-20',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/livestock/animals/${testData.animal.id}/breeding`)
        .send(breedingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.method).toBe(breedingData.method);
      expect(response.body.data.sireId).toBe(breedingData.sireId);
    });

    it('should fail with invalid breeding data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const breedingData = {
        method: 'invalid-method',
        date: 'invalid-date',
      };

      const response = await authReq
        .post(`/api/livestock/animals/${testData.animal.id}/breeding`)
        .send(breedingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/livestock/animals/:id/breeding', () => {
    it('should get breeding history for animal', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/livestock/animals/${testData.animal.id}/breeding`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('breedingRecords');
      expect(Array.isArray(response.body.data.breedingRecords)).toBe(true);
    });
  });

  describe('POST /api/livestock/animals/:id/production', () => {
    it('should record production data successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const productionData = {
        date: '2024-01-20',
        type: 'milk',
        quantity: 25.5,
        unit: 'liters',
        quality: 'Grade A',
        notes: 'Morning milking',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/livestock/animals/${testData.animal.id}/production`)
        .send(productionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe(productionData.type);
      expect(response.body.data.quantity).toBe(productionData.quantity);
    });

    it('should fail with invalid production data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const productionData = {
        type: 'invalid-type',
        quantity: -10,
      };

      const response = await authReq
        .post(`/api/livestock/animals/${testData.animal.id}/production`)
        .send(productionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/livestock/animals/:id/production', () => {
    it('should get production history for animal', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/livestock/animals/${testData.animal.id}/production`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('productionLogs');
      expect(Array.isArray(response.body.data.productionLogs)).toBe(true);
    });

    it('should filter production by type', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/livestock/animals/${testData.animal.id}/production`)
        .query({ type: 'milk' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/livestock/animals/:id/sales', () => {
    it('should record animal sale successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const saleData = {
        date: '2024-01-20',
        price: 1500.0,
        buyerName: 'Local Butcher',
        buyerContact: '+1234567890',
        weight: 450,
        reason: 'Culling',
        notes: 'Sold for meat',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/livestock/animals/${testData.animal.id}/sales`)
        .send(saleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(saleData.price);
      expect(response.body.data.buyerName).toBe(saleData.buyerName);
    });

    it('should update animal status to sold after sale', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const saleData = {
        date: '2024-01-20',
        price: 1500.0,
        buyerName: 'Test Buyer',
        recordedById: testData.adminUser.id,
      };

      const response = await authReq
        .post(`/api/livestock/animals/${testData.animal.id}/sales`)
        .send(saleData)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Check that animal status was updated
      const animalResponse = await authReq
        .get(`/api/livestock/animals/${testData.animal.id}`)
        .expect(200);

      expect(animalResponse.body.data.status).toBe('sold');
    });

    it('should fail with invalid sale data', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const saleData = {
        price: -100,
        weight: -50,
      };

      const response = await authReq
        .post(`/api/livestock/animals/${testData.animal.id}/sales`)
        .send(saleData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/livestock/animals/:id/sales', () => {
    it('should get sales history for animal', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get(`/api/livestock/animals/${testData.animal.id}/sales`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sales');
      expect(Array.isArray(response.body.data.sales)).toBe(true);
    });
  });

  describe('GET /api/livestock/analytics', () => {
    it('should get livestock analytics', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/livestock/analytics').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalAnimals');
      expect(response.body.data).toHaveProperty('animalsByType');
      expect(response.body.data).toHaveProperty('animalsByStatus');
      expect(response.body.data).toHaveProperty('productionSummary');
      expect(response.body.data).toHaveProperty('healthSummary');
    });

    it('should filter analytics by date range', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const response = await authReq
        .get('/api/livestock/analytics')
        .query({ startDate, endDate })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/livestock/breeding-schedule', () => {
    it('should get breeding schedule', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/livestock/breeding-schedule').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('upcomingBreedings');
      expect(response.body.data).toHaveProperty('pregnantAnimals');
      expect(response.body.data).toHaveProperty('upcomingCalvings');
    });
  });

  describe('GET /api/livestock/health-schedule', () => {
    it('should get health schedule', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/livestock/health-schedule').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('upcomingVaccinations');
      expect(response.body.data).toHaveProperty('overdueVaccinations');
      expect(response.body.data).toHaveProperty('healthAlerts');
    });
  });

  describe('GET /api/livestock/production-report', () => {
    it('should get production report', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/livestock/production-report').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalProduction');
      expect(response.body.data).toHaveProperty('productionByType');
      expect(response.body.data).toHaveProperty('topProducers');
      expect(response.body.data).toHaveProperty('trends');
    });

    it('should filter production report by animal type', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .get('/api/livestock/production-report')
        .query({ animalType: AnimalType.CATTLE })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Permission Tests', () => {
    it('should allow manager to create animals', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.managerUser.accessToken);

      const animalData = {
        tagNumber: 'MGR001',
        type: AnimalType.CATTLE,
        breed: 'Manager Test',
        gender: 'female',
        dateOfBirth: '2020-01-01',
        acquisitionDate: '2020-02-01',
        locationId: testData.location.id,
      };

      const response = await authReq.post('/api/livestock/animals').send(animalData).expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should allow worker to view animals', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.workerUser.accessToken);

      const response = await authReq.get('/api/livestock/animals').expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should prevent worker from deleting animals', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.workerUser.accessToken);

      const response = await authReq
        .delete(`/api/livestock/animals/${testData.animal.id}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });
  });
});

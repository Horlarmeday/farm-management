import { FarmRole } from '../../../shared/src/types';
import request from 'supertest';
import { app } from '../app';
import { TestUtils } from './utils';

describe('RBAC Middleware Tests', () => {
  let testManager: TestUtils;
  let ownerToken: string;
  let managerToken: string;
  let workerToken: string;
  let farmId: string;

  beforeAll(async () => {
    testManager = new TestUtils();
    await testManager.setup();

    // Create test farm and users with different roles
    const farm = await testManager.createTestFarm();
    farmId = farm.id;

    // Create users with different roles
    const owner = await testManager.createTestUser({ email: 'owner@test.com' });
    const manager = await testManager.createTestUser({ email: 'manager@test.com' });
    const worker = await testManager.createTestUser({ email: 'worker@test.com' });

    // Add users to farm with different roles
    await testManager.addUserToFarm(owner.id, farmId, FarmRole.OWNER);
    await testManager.addUserToFarm(manager.id, farmId, FarmRole.MANAGER);
    await testManager.addUserToFarm(worker.id, farmId, FarmRole.WORKER);

    // Get tokens for each user
    ownerToken = testManager.generateToken(owner);
    managerToken = testManager.generateToken(manager);
    workerToken = testManager.generateToken(worker);
  });

  afterAll(async () => {
    await testManager.cleanup();
  });

  describe('Livestock Routes Access Control', () => {
    it('should allow OWNER to access livestock routes', async () => {
      const response = await request(app)
        .get('/api/livestock/animals')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('X-Farm-ID', farmId);

      expect(response.status).not.toBe(403);
    });

    it('should allow MANAGER to access livestock routes', async () => {
      const response = await request(app)
        .get('/api/livestock/animals')
        .set('Authorization', `Bearer ${managerToken}`)
        .set('X-Farm-ID', farmId);

      expect(response.status).not.toBe(403);
    });

    it('should allow WORKER to access livestock routes', async () => {
      const response = await request(app)
        .get('/api/livestock/animals')
        .set('Authorization', `Bearer ${workerToken}`)
        .set('X-Farm-ID', farmId);

      expect(response.status).not.toBe(403);
    });

    it('should deny access without farm ID header', async () => {
      const response = await request(app)
        .get('/api/livestock/animals')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Farm ID is required');
    });

    it('should deny access to non-farm member', async () => {
      const outsider = await testManager.createTestUser({ email: 'outsider@test.com' });
      const outsiderToken = testManager.generateToken(outsider);

      const response = await request(app)
        .get('/api/livestock/animals')
        .set('Authorization', `Bearer ${outsiderToken}`)
        .set('X-Farm-ID', farmId);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('not a member of this farm');
    });
  });

  describe('Poultry Routes Access Control', () => {
    it('should allow all farm members to access poultry routes', async () => {
      const tokens = [ownerToken, managerToken, workerToken];

      for (const token of tokens) {
        const response = await request(app)
          .get('/api/poultry/batches')
          .set('Authorization', `Bearer ${token}`)
          .set('X-Farm-ID', farmId);

        expect(response.status).not.toBe(403);
      }
    });
  });

  describe('Fishery Routes Access Control', () => {
    it('should allow all farm members to access fishery routes', async () => {
      const tokens = [ownerToken, managerToken, workerToken];

      for (const token of tokens) {
        const response = await request(app)
          .get('/api/fishery/ponds')
          .set('Authorization', `Bearer ${token}`)
          .set('X-Farm-ID', farmId);

        expect(response.status).not.toBe(403);
      }
    });
  });
});
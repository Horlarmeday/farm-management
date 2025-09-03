import {
  AnimalType,
  AssetStatus,
  AssetType,
  BirdStatus,
  BirdType,
  InventoryType,
  UserStatus,
} from '@kuyash/shared';
import request from 'supertest';
import { app } from '../app';
import { Animal } from '../entities/Animal';
import { Asset } from '../entities/Asset';
import { BirdBatch } from '../entities/BirdBatch';
import { Department } from '../entities/Department';
import { InventoryItem } from '../entities/InventoryItem';
import { Location } from '../entities/Location';
import { Permission } from '../entities/Permission';
import { Pond } from '../entities/Pond';
import { Role } from '../entities/Role';
import { User } from '../entities/User';
import { testDataSource } from './setup';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  accessToken: string;
  user: User;
}

export interface TestData {
  adminUser: TestUser;
  managerUser: TestUser;
  workerUser: TestUser;
  department: Department;
  location: Location;
  birdBatch: BirdBatch;
  animal: Animal;
  pond: Pond;
  asset: Asset;
  inventoryItem: InventoryItem;
}

export class TestUtils {
  private static testData: Partial<TestData> = {};

  static async createPermissions(): Promise<Permission[]> {
    const permissionRepo = testDataSource.getRepository(Permission);

    const permissions = [
      { name: 'create_users', description: 'Create users', resource: 'users', action: 'create' },
      { name: 'read_users', description: 'Read users', resource: 'users', action: 'read' },
      { name: 'update_users', description: 'Update users', resource: 'users', action: 'update' },
      { name: 'delete_users', description: 'Delete users', resource: 'users', action: 'delete' },
      {
        name: 'manage_inventory',
        description: 'Manage inventory',
        resource: 'inventory',
        action: 'manage',
      },
      {
        name: 'manage_finance',
        description: 'Manage finance',
        resource: 'finance',
        action: 'manage',
      },
      {
        name: 'manage_poultry',
        description: 'Manage poultry',
        resource: 'poultry',
        action: 'manage',
      },
      {
        name: 'manage_livestock',
        description: 'Manage livestock',
        resource: 'livestock',
        action: 'manage',
      },
      {
        name: 'manage_fishery',
        description: 'Manage fishery',
        resource: 'fishery',
        action: 'manage',
      },
      { name: 'manage_assets', description: 'Manage assets', resource: 'assets', action: 'manage' },
      { name: 'view_reports', description: 'View reports', resource: 'reports', action: 'read' },
      {
        name: 'create_reports',
        description: 'Create reports',
        resource: 'reports',
        action: 'create',
      },
    ];

    const createdPermissions: Permission[] = [];
    for (const permData of permissions) {
      const permission = permissionRepo.create(permData);
      createdPermissions.push(await permissionRepo.save(permission));
    }

    return createdPermissions;
  }

  static async createRoles(): Promise<{ adminRole: Role; managerRole: Role; workerRole: Role }> {
    const roleRepo = testDataSource.getRepository(Role);
    const permissions = await this.createPermissions();

    const adminRole = roleRepo.create({
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full system access',
      permissions: permissions,
      isDefault: false,
    });

    const managerRole = roleRepo.create({
      name: 'manager',
      displayName: 'Manager',
      description: 'Management access',
      permissions: permissions.filter((p) => !p.name.includes('delete')),
      isDefault: false,
    });

    const workerRole = roleRepo.create({
      name: 'worker',
      displayName: 'Worker',
      description: 'Basic access',
      permissions: permissions.filter((p) => p.action === 'read' || p.resource === 'inventory'),
      isDefault: true,
    });

    return {
      adminRole: await roleRepo.save(adminRole),
      managerRole: await roleRepo.save(managerRole),
      workerRole: await roleRepo.save(workerRole),
    };
  }

  static async createDepartment(): Promise<Department> {
    const departmentRepo = testDataSource.getRepository(Department);

    const department = departmentRepo.create({
      name: 'Farm Operations',
      description: 'Main farm operations department',
      budget: 100000,
      isActive: true,
    });

    this.testData.department = await departmentRepo.save(department);
    return this.testData.department;
  }

  static async createLocation(): Promise<Location> {
    const locationRepo = testDataSource.getRepository(Location);

    const location = locationRepo.create({
      name: 'Main Farm',
      type: 'farm',
      address: '123 Farm Road',
      city: 'Farm City',
      state: 'Farm State',
      country: 'Farm Country',
      postalCode: '12345',
      coordinates: { lat: 40.7128, lng: -74.006 },
      isActive: true,
    });

    this.testData.location = await locationRepo.save(location);
    return this.testData.location;
  }

  static async createTestUsers(): Promise<{
    adminUser: TestUser;
    managerUser: TestUser;
    workerUser: TestUser;
  }> {
    const userRepo = testDataSource.getRepository(User);
    const { adminRole, managerRole, workerRole } = await this.createRoles();
    const department = await this.createDepartment();

    // Create admin user
    const adminUserData = userRepo.create({
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      password: 'password123',
      role: adminRole,
      department,
      status: UserStatus.ACTIVE,
      isActive: true,
      isEmailVerified: true,
      employeeId: 'EMP24001', // Auto-generated format: EMP + YY + 4-digit sequence
    });
    const adminUser = await userRepo.save(adminUserData);

    // Create manager user
    const managerUserData = userRepo.create({
      email: 'manager@test.com',
      firstName: 'Manager',
      lastName: 'User',
      password: 'password123',
      role: managerRole,
      department,
      status: UserStatus.ACTIVE,
      isActive: true,
      isEmailVerified: true,
      employeeId: 'EMP24002', // Auto-generated format: EMP + YY + 4-digit sequence
    });
    const managerUser = await userRepo.save(managerUserData);

    // Create worker user
    const workerUserData = userRepo.create({
      email: 'worker@test.com',
      firstName: 'Worker',
      lastName: 'User',
      password: 'password123',
      role: workerRole,
      department,
      status: UserStatus.ACTIVE,
      isActive: true,
      isEmailVerified: true,
      employeeId: 'EMP24003', // Auto-generated format: EMP + YY + 4-digit sequence
    });
    const workerUser = await userRepo.save(workerUserData);

    // Get access tokens
    const adminToken = await this.loginUser('admin@test.com', 'password123');
    const managerToken = await this.loginUser('manager@test.com', 'password123');
    const workerToken = await this.loginUser('worker@test.com', 'password123');

    const adminTestUser: TestUser = {
      id: adminUser.id,
      email: adminUser.email,
      password: 'password123',
      accessToken: adminToken,
      user: adminUser,
    };

    const managerTestUser: TestUser = {
      id: managerUser.id,
      email: managerUser.email,
      password: 'password123',
      accessToken: managerToken,
      user: managerUser,
    };

    const workerTestUser: TestUser = {
      id: workerUser.id,
      email: workerUser.email,
      password: 'password123',
      accessToken: workerToken,
      user: workerUser,
    };

    this.testData.adminUser = adminTestUser;
    this.testData.managerUser = managerTestUser;
    this.testData.workerUser = workerTestUser;

    return {
      adminUser: adminTestUser,
      managerUser: managerTestUser,
      workerUser: workerTestUser,
    };
  }

  static async loginUser(email: string, password: string): Promise<string> {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    return response.body.data.accessToken;
  }

  static async createBirdBatch(): Promise<BirdBatch> {
    const birdBatchRepo = testDataSource.getRepository(BirdBatch);
    const location = this.testData.location || (await this.createLocation());

    const birdBatch = birdBatchRepo.create({
      batchCode: 'BB001',
      birdType: BirdType.LAYER,
      breed: 'Rhode Island Red',
      quantity: 100,
      currentQuantity: 100,
      arrivalDate: new Date(),
      source: 'Test Hatchery',
      ageInDays: 30,
      status: BirdStatus.ACTIVE,
      unitCost: 5.5,
      totalCost: 550.0,
      location,
      locationId: location.id,
    });

    this.testData.birdBatch = await birdBatchRepo.save(birdBatch);
    return this.testData.birdBatch;
  }

  static async createAnimal(): Promise<Animal> {
    const animalRepo = testDataSource.getRepository(Animal);
    const location = this.testData.location || (await this.createLocation());

    const animal = animalRepo.create({
      tagNumber: 'COW001',
      type: AnimalType.CATTLE,
      breed: 'Holstein',
      gender: 'female',
      dateOfBirth: new Date('2020-01-01'),
      acquisitionDate: new Date('2020-02-01'),
      source: 'Test Farm',
      weight: 500,
      status: 'alive',
      location,
      locationId: location.id,
    });

    this.testData.animal = await animalRepo.save(animal);
    return this.testData.animal;
  }

  static async createPond(): Promise<Pond> {
    const pondRepo = testDataSource.getRepository(Pond);
    const location = this.testData.location || (await this.createLocation());

    const pond = pondRepo.create({
      name: 'Test Pond 1',
      type: 'earthen',
      size: 1000,
      depth: 2.5,
      location,
      locationId: location.id,
      waterSource: 'borehole',
      isActive: true,
    });

    this.testData.pond = await pondRepo.save(pond);
    return this.testData.pond;
  }

  static async createAsset(): Promise<Asset> {
    const assetRepo = testDataSource.getRepository(Asset);
    const location = this.testData.location || (await this.createLocation());

    const asset = assetRepo.create({
      name: 'Test Tractor',
      assetType: AssetType.MACHINERY,
      serialNumber: 'TRC001',
      purchaseDate: new Date(),
      purchasePrice: 50000,
      status: AssetStatus.ACTIVE,
      condition: 'good',
      location,
      locationId: location.id,
      manufacturer: 'Test Manufacturer',
      model: 'Test Model',
    });

    this.testData.asset = await assetRepo.save(asset);
    return this.testData.asset;
  }

  static async createInventoryItem(): Promise<InventoryItem> {
    const inventoryRepo = testDataSource.getRepository(InventoryItem);

    const inventoryItem = inventoryRepo.create({
      name: 'Layer Feed',
      description: 'High quality layer feed',
      type: InventoryType.FEED,
      unit: 'kg',
      currentStock: 1000,
      minimumStock: 100,
      maximumStock: 2000,
      unitCost: 0.5,
      isActive: true,
    });

    this.testData.inventoryItem = await inventoryRepo.save(inventoryItem);
    return this.testData.inventoryItem;
  }

  static async createTestData(): Promise<TestData> {
    const users = await this.createTestUsers();
    const location = await this.createLocation();
    const birdBatch = await this.createBirdBatch();
    const animal = await this.createAnimal();
    const pond = await this.createPond();
    const asset = await this.createAsset();
    const inventoryItem = await this.createInventoryItem();

    return {
      ...users,
      department: this.testData.department!,
      location,
      birdBatch,
      animal,
      pond,
      asset,
      inventoryItem,
    };
  }

  static async cleanupTestData(): Promise<void> {
    // Clear all test data in correct order to handle foreign key constraints
    const entities = [
      'FinancialTransaction',
      'InventoryTransaction',
      'BirdFeedingLog',
      'BirdHealthRecord',
      'EggProductionLog',
      'BirdSale',
      'BirdBatch',
      'AnimalFeedingLog',
      'AnimalHealthRecord',
      'AnimalProductionLog',
      'AnimalSale',
      'Animal',
      'FishFeedingLog',
      'FishSamplingLog',
      'FishHarvestLog',
      'FishStockingLog',
      'WaterQualityLog',
      'Pond',
      'MaintenanceLog',
      'Asset',
      'InventoryItem',
      'Notification',
      'Task',
      'User',
      'Role',
      'Permission',
      'Department',
      'Location',
    ];

    for (const entity of entities) {
      try {
        await testDataSource.query(`DELETE FROM ${entity.toLowerCase()}s`);
      } catch (error) {
        // Ignore errors for non-existent tables
      }
    }

    this.testData = {};
  }

  static getAuthHeader(token: string): object {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static createAuthenticatedRequest(token: string) {
    return {
      get: (path: string) => request(app).get(path).set('Authorization', `Bearer ${token}`),
      post: (path: string) => request(app).post(path).set('Authorization', `Bearer ${token}`),
      put: (path: string) => request(app).put(path).set('Authorization', `Bearer ${token}`),
      patch: (path: string) => request(app).patch(path).set('Authorization', `Bearer ${token}`),
      delete: (path: string) => request(app).delete(path).set('Authorization', `Bearer ${token}`),
    };
  }
}

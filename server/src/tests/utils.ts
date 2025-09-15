import {
  AnimalType,
  AnimalStatus,
  AssetStatus,
  AssetType,
  BirdStatus,
  BirdType,
  InventoryCategory,
  PondType,
  PondStatus,
  UserStatus,
} from '../../../shared/src/types';
import request from 'supertest';
import { app } from '../app';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Permission } from '../entities/Permission';
import { Department } from '../entities/Department';
import { Location } from '../entities/Location';
import { BirdBatch } from '../entities/BirdBatch';
import { Animal } from '../entities/Animal';
import { Pond } from '../entities/Pond';
import { Asset } from '../entities/Asset';
import { InventoryItem } from '../entities/InventoryItem';
import { Farm } from '../entities/Farm';
import { FarmUser } from '../entities/FarmUser';
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
  private testUsers: any[] = [];
  private testFarms: any[] = [];
  private testFarmUsers: any[] = [];

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
        module: 'inventory',
        action: 'manage',
        isActive: true,
      },
      {
        name: 'manage_finance',
        description: 'Manage finance',
        module: 'finance',
        action: 'manage',
        isActive: true,
      },
      {
        name: 'manage_poultry',
        description: 'Manage poultry',
        module: 'poultry',
        action: 'manage',
        isActive: true,
      },
      {
        name: 'manage_livestock',
        description: 'Manage livestock',
        module: 'livestock',
        action: 'manage',
        isActive: true,
      },
      {
        name: 'manage_fishery',
        description: 'Manage fishery',
        module: 'fishery',
        action: 'manage',
        isActive: true,
      },
      { name: 'manage_assets', description: 'Manage assets', module: 'assets', action: 'manage', isActive: true },
      { name: 'view_reports', description: 'View reports', module: 'reports', action: 'read', isActive: true },
      {
        name: 'create_reports',
        description: 'Create reports',
        module: 'reports',
        action: 'create',
        isActive: true,
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
      description: 'Full system access',
      permissions: permissions,
      isActive: true,
      isSystemRole: true,
    });

    const managerRole = roleRepo.create({
      name: 'manager',
      description: 'Management access',
      permissions: permissions.filter((p) => !p.name.includes('delete')),
      isActive: true,
      isSystemRole: true,
    });

    const workerRole = roleRepo.create({
      name: 'worker',
      description: 'Basic access',
      permissions: permissions.filter((p) => p.action === 'read' || p.module === 'inventory'),
      isActive: true,
      isSystemRole: false,
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
      name: 'Test Location',
      description: 'Test barn location',
      address: '123 Farm Road',
      city: 'Farm City',
      state: 'Farm State',
      country: 'Farm Country',
      isActive: true,
      farmId: 'test-farm-id',
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
      species: AnimalType.CATTLE,
      breed: 'Holstein',
      gender: 'female',
      dateOfBirth: new Date('2022-01-15'),
      acquisitionDate: new Date('2022-02-01'),
      status: AnimalStatus.ACTIVE,
      weight: 450,
      location,
      locationId: location.id,
      farmId: 'test-farm-id',
    });

    this.testData.animal = await animalRepo.save(animal);
    return this.testData.animal;
  }

  static async createPond(): Promise<Pond> {
    const pondRepo = testDataSource.getRepository(Pond);
    const location = this.testData.location || (await this.createLocation());

    const pond = pondRepo.create({
      name: 'Test Pond 1',
      type: PondType.EARTHEN,
      size: 1000,
      sizeUnit: 'm2',
      depth: 2.5,
      status: PondStatus.ACTIVE,
      location,
      locationId: location.id,
      farmId: 'test-farm-id',
    });

    this.testData.pond = await pondRepo.save(pond);
    return this.testData.pond;
  }

  static async createAsset(): Promise<Asset> {
    const assetRepo = testDataSource.getRepository(Asset);
    const location = this.testData.location || (await this.createLocation());

    const asset = assetRepo.create({
      assetCode: 'TRC001',
      name: 'Test Tractor',
      type: AssetType.MACHINERY,
      serialNumber: 'TRC001',
      purchaseDate: new Date(),
      purchasePrice: 50000,
      status: AssetStatus.ACTIVE,
      condition: 'good',
      location,
      locationId: location.id,
      manufacturer: 'Test Manufacturer',
      model: 'Test Model',
      farmId: 'test-farm-id',
    });

    this.testData.asset = await assetRepo.save(asset);
    return this.testData.asset;
  }

  static async createInventoryItem(): Promise<InventoryItem> {
    const inventoryRepo = testDataSource.getRepository(InventoryItem);

    const item = inventoryRepo.create({
      name: 'Test Feed',
      sku: 'FEED001',
      category: InventoryCategory.FEED,
      unit: 'kg',
      currentStock: 100,
      minimumStock: 10,
      reorderPoint: 15,
      unitCost: 25.50,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      location: 'Warehouse A',
      isActive: true,
      farmId: 'test-farm-id',
    });

    this.testData.inventoryItem = await inventoryRepo.save(item);
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

  // Instance methods for RBAC testing
  async setup(): Promise<void> {
    // Initialize test database connection if needed
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }
  }

  async createTestFarm(): Promise<any> {
    const farmRepo = testDataSource.getRepository(Farm);
    const farm = farmRepo.create({
      name: 'Test Farm',
      description: 'Test farm for RBAC testing',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      postalCode: '12345',
      phone: '+1234567890',
      email: 'testfarm@example.com',
      isActive: true,
      ownerId: 'test-owner-id'
    });
    const savedFarm = await farmRepo.save(farm);
    this.testFarms.push(savedFarm);
    return savedFarm;
  }

  async createTestUser(userData: { email: string }): Promise<any> {
    const userRepo = testDataSource.getRepository(User);
    const roleRepo = testDataSource.getRepository(Role);
    
    // Get or create a default role
    let role = await roleRepo.findOne({ where: { name: 'worker' } });
    if (!role) {
      role = roleRepo.create({
        name: 'worker',
        description: 'Worker role',
        permissions: []
      });
      role = await roleRepo.save(role);
    }

    const user = userRepo.create({
      email: userData.email,
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      roleId: role.id,
      status: UserStatus.ACTIVE
    });
    const savedUser = await userRepo.save(user);
    this.testUsers.push(savedUser);
    return savedUser;
  }

  async addUserToFarm(userId: string, farmId: string, farmRole: any): Promise<void> {
    const farmUserRepo = testDataSource.getRepository(FarmUser);
    const farmUser = farmUserRepo.create({
      userId,
      farmId,
      role: farmRole,
      isActive: true
    });
    const savedFarmUser = await farmUserRepo.save(farmUser);
    this.testFarmUsers.push(savedFarmUser);
  }

  generateToken(user: any): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        roleId: user.roleId
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }

  async cleanup(): Promise<void> {
    const farmUserRepo = testDataSource.getRepository(FarmUser);
    const farmRepo = testDataSource.getRepository(Farm);
    const userRepo = testDataSource.getRepository(User);

    // Clean up in reverse order
    for (const farmUser of this.testFarmUsers) {
      try {
        await farmUserRepo.remove(farmUser);
      } catch (error) {
        // Ignore errors
      }
    }

    for (const farm of this.testFarms) {
      try {
        await farmRepo.remove(farm);
      } catch (error) {
        // Ignore errors
      }
    }

    for (const user of this.testUsers) {
      try {
        await userRepo.remove(user);
      } catch (error) {
        // Ignore errors
      }
    }

    this.testUsers = [];
    this.testFarms = [];
    this.testFarmUsers = [];
  }
}

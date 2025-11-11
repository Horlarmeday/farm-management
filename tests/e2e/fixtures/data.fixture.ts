import { test as base } from '@playwright/test';
import { ApiUtils, DatabaseUtils, TestDataGenerator } from '../utils/test-helpers';

/**
 * Data fixture for E2E tests
 * Provides test data setup and cleanup for various entities
 */

interface DataFixtures {
  testFarm: {
    farm: any;
    cleanup: () => Promise<void>;
  };
  testLivestock: {
    livestock: any[];
    cleanup: () => Promise<void>;
  };
  testInventory: {
    inventory: any[];
    cleanup: () => Promise<void>;
  };
  testFinancialRecords: {
    records: any[];
    cleanup: () => Promise<void>;
  };
  testUsers: {
    users: any[];
    cleanup: () => Promise<void>;
  };
}

/**
 * Extended test with data fixtures
 */
export const test = base.extend<DataFixtures>({
  /**
   * Test farm fixture
   * Creates a test farm with sample data
   */
  testFarm: async ({}, use) => {
    const farmData = await TestDataGenerator.generateFarm();
    let farm: any = null;

    try {
      // Create farm via API
      farm = await ApiUtils.createTestFarm(farmData);

      const testFarm = {
        farm,
        cleanup: async () => {
          if (farm) {
            try {
              await ApiUtils.deleteTestFarm(farm.id);
            } catch (error) {
              console.warn('Failed to cleanup test farm:', error);
            }
          }
        },
      };

      await use(testFarm);

      // Cleanup
      await testFarm.cleanup();
    } catch (error) {
      console.error('Failed to create test farm:', error);
      throw error;
    }
  },

  /**
   * Test livestock fixture
   * Creates multiple livestock records for testing
   */
  testLivestock: async ({ testFarm }, use) => {
    const livestockData = [
      await TestDataGenerator.generateLivestock({ farmId: testFarm.farm.id, type: 'cattle' }),
      await TestDataGenerator.generateLivestock({ farmId: testFarm.farm.id, type: 'poultry' }),
      await TestDataGenerator.generateLivestock({ farmId: testFarm.farm.id, type: 'sheep' }),
      await TestDataGenerator.generateLivestock({ farmId: testFarm.farm.id, type: 'goat' }),
      await TestDataGenerator.generateLivestock({ farmId: testFarm.farm.id, type: 'pig' }),
    ];

    const livestock: any[] = [];

    try {
      // Create livestock via API
      for (const data of livestockData) {
        const animal = await ApiUtils.createTestLivestock(data);
        livestock.push(animal);
      }

      const testLivestock = {
        livestock,
        cleanup: async () => {
          for (const animal of livestock) {
            try {
              await ApiUtils.deleteTestLivestock(animal.id);
            } catch (error) {
              console.warn(`Failed to cleanup livestock ${animal.id}:`, error);
            }
          }
        },
      };

      await use(testLivestock);

      // Cleanup
      await testLivestock.cleanup();
    } catch (error) {
      console.error('Failed to create test livestock:', error);
      throw error;
    }
  },

  /**
   * Test inventory fixture
   * Creates multiple inventory items for testing
   */
  testInventory: async ({ testFarm }, use) => {
    const inventoryData = [
      await TestDataGenerator.generateInventoryItem({ farmId: testFarm.farm.id, category: 'feed' }),
      await TestDataGenerator.generateInventoryItem({ farmId: testFarm.farm.id, category: 'medicine' }),
      await TestDataGenerator.generateInventoryItem({ farmId: testFarm.farm.id, category: 'equipment' }),
      await TestDataGenerator.generateInventoryItem({ farmId: testFarm.farm.id, category: 'supplies' }),
      await TestDataGenerator.generateInventoryItem({ farmId: testFarm.farm.id, category: 'seeds' }),
    ];

    const inventory: any[] = [];

    try {
      // Create inventory items via API
      for (const data of inventoryData) {
        const item = await ApiUtils.createTestInventoryItem(data);
        inventory.push(item);
      }

      const testInventory = {
        inventory,
        cleanup: async () => {
          for (const item of inventory) {
            try {
              await ApiUtils.deleteTestInventoryItem(item.id);
            } catch (error) {
              console.warn(`Failed to cleanup inventory item ${item.id}:`, error);
            }
          }
        },
      };

      await use(testInventory);

      // Cleanup
      await testInventory.cleanup();
    } catch (error) {
      console.error('Failed to create test inventory:', error);
      throw error;
    }
  },

  /**
   * Test financial records fixture
   * Creates multiple financial records for testing
   */
  testFinancialRecords: async ({ testFarm }, use) => {
    const recordsData = [
      await TestDataGenerator.generateFinancialRecord({
        farmId: testFarm.farm.id,
        type: 'income',
        category: 'livestock_sales',
      }),
      await TestDataGenerator.generateFinancialRecord({
        farmId: testFarm.farm.id,
        type: 'expense',
        category: 'feed_purchase',
      }),
      await TestDataGenerator.generateFinancialRecord({
        farmId: testFarm.farm.id,
        type: 'income',
        category: 'crop_sales',
      }),
      await TestDataGenerator.generateFinancialRecord({
        farmId: testFarm.farm.id,
        type: 'expense',
        category: 'equipment_purchase',
      }),
      await TestDataGenerator.generateFinancialRecord({
        farmId: testFarm.farm.id,
        type: 'expense',
        category: 'veterinary_services',
      }),
    ];

    const records: any[] = [];

    try {
      // Create financial records via API
      for (const data of recordsData) {
        const record = await ApiUtils.createTestFinancialRecord(data);
        records.push(record);
      }

      const testFinancialRecords = {
        records,
        cleanup: async () => {
          for (const record of records) {
            try {
              await ApiUtils.deleteTestFinancialRecord(record.id);
            } catch (error) {
              console.warn(`Failed to cleanup financial record ${record.id}:`, error);
            }
          }
        },
      };

      await use(testFinancialRecords);

      // Cleanup
      await testFinancialRecords.cleanup();
    } catch (error) {
      console.error('Failed to create test financial records:', error);
      throw error;
    }
  },

  /**
   * Test users fixture
   * Creates multiple test users with different roles
   */
  testUsers: async ({}, use) => {
    const usersData = [
      { ...(await TestDataGenerator.generateUser()), role: 'admin' },
      { ...(await TestDataGenerator.generateUser()), role: 'manager' },
      { ...(await TestDataGenerator.generateUser()), role: 'worker' },
      { ...(await TestDataGenerator.generateUser()), role: 'viewer' },
    ];

    const users: any[] = [];

    try {
      // Create users via API
      for (const data of usersData) {
        const { user } = await ApiUtils.createTestUser(data);
        users.push(user);
      }

      const testUsers = {
        users,
        cleanup: async () => {
          for (const user of users) {
            try {
              await ApiUtils.deleteTestUser(user.id);
            } catch (error) {
              console.warn(`Failed to cleanup test user ${user.id}:`, error);
            }
          }
        },
      };

      await use(testUsers);

      // Cleanup
      await testUsers.cleanup();
    } catch (error) {
      console.error('Failed to create test users:', error);
      throw error;
    }
  },
});

/**
 * Data fixture helper functions
 */
export class DataFixtureHelpers {
  /**
   * Create test dataset with relationships
   */
  static async createCompleteTestDataset(): Promise<{
    farm: any;
    users: any[];
    livestock: any[];
    inventory: any[];
    financialRecords: any[];
    cleanup: () => Promise<void>;
  }> {
    const createdEntities: any[] = [];

    try {
      // Create farm
      const farmData = await TestDataGenerator.generateFarm();
      const farm = await ApiUtils.createTestFarm(farmData);
      createdEntities.push({ type: 'farm', entity: farm });

      // Create users
      const usersData = [
        { ...(await TestDataGenerator.generateUser()), role: 'admin', farmId: farm.id },
      { ...(await TestDataGenerator.generateUser()), role: 'manager', farmId: farm.id },
      { ...(await TestDataGenerator.generateUser()), role: 'worker', farmId: farm.id },
      ];

      const users = [];
      for (const userData of usersData) {
        const { user } = await ApiUtils.createTestUser(userData);
        users.push(user);
        createdEntities.push({ type: 'user', entity: user });
      }

      // Create livestock
      const livestockData = [
        await TestDataGenerator.generateLivestock({ farmId: farm.id, type: 'cattle' }),
        await TestDataGenerator.generateLivestock({ farmId: farm.id, type: 'poultry' }),
        await TestDataGenerator.generateLivestock({ farmId: farm.id, type: 'sheep' }),
      ];

      const livestock = [];
      for (const data of livestockData) {
        const animal = await ApiUtils.createTestLivestock(data);
        livestock.push(animal);
        createdEntities.push({ type: 'livestock', entity: animal });
      }

      // Create inventory
      const inventoryData = [
        await TestDataGenerator.generateInventoryItem({ farmId: farm.id, category: 'feed' }),
        await TestDataGenerator.generateInventoryItem({ farmId: farm.id, category: 'medicine' }),
        await TestDataGenerator.generateInventoryItem({ farmId: farm.id, category: 'equipment' }),
      ];

      const inventory = [];
      for (const data of inventoryData) {
        const item = await ApiUtils.createTestInventoryItem(data);
        inventory.push(item);
        createdEntities.push({ type: 'inventory', entity: item });
      }

      // Create financial records
      const recordsData = [
        await TestDataGenerator.generateFinancialRecord({
          farmId: farm.id,
          type: 'income',
          category: 'livestock_sales',
        }),
        await TestDataGenerator.generateFinancialRecord({
          farmId: farm.id,
          type: 'expense',
          category: 'feed_purchase',
        }),
        await TestDataGenerator.generateFinancialRecord({
          farmId: farm.id,
          type: 'income',
          category: 'crop_sales',
        }),
      ];

      const financialRecords = [];
      for (const data of recordsData) {
        const record = await ApiUtils.createTestFinancialRecord(data);
        financialRecords.push(record);
        createdEntities.push({ type: 'financial', entity: record });
      }

      return {
        farm,
        users,
        livestock,
        inventory,
        financialRecords,
        cleanup: async () => {
          // Cleanup in reverse order to handle dependencies
          for (let i = createdEntities.length - 1; i >= 0; i--) {
            const { type, entity } = createdEntities[i];

            try {
              switch (type) {
                case 'financial':
                  await ApiUtils.deleteTestFinancialRecord(entity.id);
                  break;
                case 'inventory':
                  await ApiUtils.deleteTestInventoryItem(entity.id);
                  break;
                case 'livestock':
                  await ApiUtils.deleteTestLivestock(entity.id);
                  break;
                case 'user':
                  await ApiUtils.deleteTestUser(entity.id);
                  break;
                case 'farm':
                  await ApiUtils.deleteTestFarm(entity.id);
                  break;
              }
            } catch (error) {
              console.warn(`Failed to cleanup ${type} ${entity.id}:`, error);
            }
          }
        },
      };
    } catch (error) {
      // Cleanup any created entities on error
      for (let i = createdEntities.length - 1; i >= 0; i--) {
        const { type, entity } = createdEntities[i];

        try {
          switch (type) {
            case 'financial':
              await ApiUtils.deleteTestFinancialRecord(entity.id);
              break;
            case 'inventory':
              await ApiUtils.deleteTestInventoryItem(entity.id);
              break;
            case 'livestock':
              await ApiUtils.deleteTestLivestock(entity.id);
              break;
            case 'user':
              await ApiUtils.deleteTestUser(entity.id);
              break;
            case 'farm':
              await ApiUtils.deleteTestFarm(entity.id);
              break;
          }
        } catch (cleanupError) {
          console.warn(`Failed to cleanup ${type} ${entity.id} after error:`, cleanupError);
        }
      }

      throw error;
    }
  }

  /**
   * Seed database with test data
   */
  static async seedTestDatabase(): Promise<void> {
    try {
      // Clear existing test data
      await DatabaseUtils.clearTestData();

      // Create test farms
      const farms = [];
      for (let i = 0; i < 3; i++) {
        const farmData = await TestDataGenerator.generateFarm();
        const farm = await ApiUtils.createTestFarm(farmData);
        farms.push(farm);
      }

      // Create test data for each farm
      for (const farm of farms) {
        // Create users
        const usersData = [
          { ...(await TestDataGenerator.generateUser()), role: 'admin', farmId: farm.id },
          { ...(await TestDataGenerator.generateUser()), role: 'manager', farmId: farm.id },
        ];

        for (const userData of usersData) {
          await ApiUtils.createTestUser(userData);
        }

        // Create livestock
        const livestockTypes = ['cattle', 'poultry', 'sheep', 'goat', 'pig'];
        for (const type of livestockTypes) {
          for (let i = 0; i < 5; i++) {
            const livestockData = await TestDataGenerator.generateLivestock({ farmId: farm.id, type });
            await ApiUtils.createTestLivestock(livestockData);
          }
        }

        // Create inventory
        const categories = ['feed', 'medicine', 'equipment', 'supplies', 'seeds'];
        for (const category of categories) {
          for (let i = 0; i < 3; i++) {
            const inventoryData = await TestDataGenerator.generateInventoryItem({
              farmId: farm.id,
              category,
            });
            await ApiUtils.createTestInventoryItem(inventoryData);
          }
        }

        // Create financial records
        const recordTypes = [
          { type: 'income', category: 'livestock_sales' },
          { type: 'expense', category: 'feed_purchase' },
          { type: 'income', category: 'crop_sales' },
          { type: 'expense', category: 'equipment_purchase' },
          { type: 'expense', category: 'veterinary_services' },
        ];

        for (const recordType of recordTypes) {
          for (let i = 0; i < 10; i++) {
            const recordData = await TestDataGenerator.generateFinancialRecord({
              farmId: farm.id,
              ...recordType,
            });
            await ApiUtils.createTestFinancialRecord(recordData);
          }
        }
      }

      console.log('Test database seeded successfully');
    } catch (error) {
      console.error('Failed to seed test database:', error);
      throw error;
    }
  }

  /**
   * Clear all test data
   */
  static async clearAllTestData(): Promise<void> {
    try {
      await DatabaseUtils.clearTestData();
      console.log('Test data cleared successfully');
    } catch (error) {
      console.error('Failed to clear test data:', error);
      throw error;
    }
  }

  /**
   * Create test data for specific scenario
   */
  static async createScenarioData(scenario: string): Promise<any> {
    switch (scenario) {
      case 'livestock_management':
        return await this.createLivestockManagementScenario();
      case 'inventory_tracking':
        return await this.createInventoryTrackingScenario();
      case 'financial_reporting':
        return await this.createFinancialReportingScenario();
      case 'user_permissions':
        return await this.createUserPermissionsScenario();
      default:
        throw new Error(`Unknown scenario: ${scenario}`);
    }
  }

  /**
   * Create livestock management scenario data
   */
  private static async createLivestockManagementScenario(): Promise<any> {
    const farmData = await TestDataGenerator.generateFarm();
    const farm = await ApiUtils.createTestFarm(farmData);

    // Create livestock with health records
    const livestock = [];
    const healthRecords = [];

    for (let i = 0; i < 10; i++) {
      const animalData = await TestDataGenerator.generateLivestock({ farmId: farm.id, type: 'cattle' });
      const animal = await ApiUtils.createTestLivestock(animalData);
      livestock.push(animal);

      // Create health records for each animal
      for (let j = 0; j < 3; j++) {
        const healthData = await TestDataGenerator.generateHealthRecord({ livestockId: animal.id });
        const record = await ApiUtils.createTestHealthRecord(healthData);
        healthRecords.push(record);
      }
    }

    return {
      farm,
      livestock,
      healthRecords,
      cleanup: async () => {
        for (const record of healthRecords) {
          await ApiUtils.deleteTestHealthRecord(record.id);
        }
        for (const animal of livestock) {
          await ApiUtils.deleteTestLivestock(animal.id);
        }
        await ApiUtils.deleteTestFarm(farm.id);
      },
    };
  }

  /**
   * Create inventory tracking scenario data
   */
  private static async createInventoryTrackingScenario(): Promise<any> {
    const farmData = await TestDataGenerator.generateFarm();
    const farm = await ApiUtils.createTestFarm(farmData);

    // Create inventory with stock movements
    const inventory = [];
    const stockMovements = [];

    for (let i = 0; i < 5; i++) {
      const itemData = await TestDataGenerator.generateInventoryItem({
        farmId: farm.id,
        category: 'feed',
      });
      const item = await ApiUtils.createTestInventoryItem(itemData);
      inventory.push(item);

      // Create stock movements for each item
      for (let j = 0; j < 5; j++) {
        const movementData = await TestDataGenerator.generateStockMovement({ inventoryItemId: item.id });
        const movement = await ApiUtils.createTestStockMovement(movementData);
        stockMovements.push(movement);
      }
    }

    return {
      farm,
      inventory,
      stockMovements,
      cleanup: async () => {
        for (const movement of stockMovements) {
          await ApiUtils.deleteTestStockMovement(movement.id);
        }
        for (const item of inventory) {
          await ApiUtils.deleteTestInventoryItem(item.id);
        }
        await ApiUtils.deleteTestFarm(farm.id);
      },
    };
  }

  /**
   * Create financial reporting scenario data
   */
  private static async createFinancialReportingScenario(): Promise<any> {
    const farmData = await TestDataGenerator.generateFarm();
    const farm = await ApiUtils.createTestFarm(farmData);

    // Create financial records for different periods
    const records = [];
    const currentDate = new Date();

    // Create records for last 12 months
    for (let month = 0; month < 12; month++) {
      const recordDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - month, 1);

      // Income records
      for (let i = 0; i < 5; i++) {
        const incomeData = await TestDataGenerator.generateFinancialRecord({
          farmId: farm.id,
          type: 'income',
          category: 'livestock_sales',
          date: recordDate,
        });
        const record = await ApiUtils.createTestFinancialRecord(incomeData);
        records.push(record);
      }

      // Expense records
      for (let i = 0; i < 8; i++) {
        const expenseData = await TestDataGenerator.generateFinancialRecord({
          farmId: farm.id,
          type: 'expense',
          category: 'feed_purchase',
          date: recordDate,
        });
        const record = await ApiUtils.createTestFinancialRecord(expenseData);
        records.push(record);
      }
    }

    return {
      farm,
      records,
      cleanup: async () => {
        for (const record of records) {
          await ApiUtils.deleteTestFinancialRecord(record.id);
        }
        await ApiUtils.deleteTestFarm(farm.id);
      },
    };
  }

  /**
   * Create user permissions scenario data
   */
  private static async createUserPermissionsScenario(): Promise<any> {
    const farmData = await TestDataGenerator.generateFarm();
    const farm = await ApiUtils.createTestFarm(farmData);

    // Create users with different roles and permissions
    const users = [];
    const roles = [
      { role: 'admin', permissions: ['all'] },
      {
        role: 'manager',
        permissions: ['livestock:read', 'livestock:write', 'inventory:read', 'inventory:write'],
      },
      { role: 'worker', permissions: ['livestock:read', 'inventory:read'] },
      { role: 'viewer', permissions: ['livestock:read'] },
    ];

    for (const roleConfig of roles) {
      const userData = {
        ...(await TestDataGenerator.generateUser()),
        role: roleConfig.role,
        permissions: roleConfig.permissions,
        farmId: farm.id,
      };

      const { user } = await ApiUtils.createTestUser(userData);
      users.push(user);
    }

    return {
      farm,
      users,
      cleanup: async () => {
        for (const user of users) {
          await ApiUtils.deleteTestUser(user.id);
        }
        await ApiUtils.deleteTestFarm(farm.id);
      },
    };
  }

  /**
   * Verify data integrity
   */
  static async verifyDataIntegrity(entities: any[]): Promise<boolean> {
    try {
      for (const entity of entities) {
        // Verify entity exists in database
        const exists = await DatabaseUtils.entityExists(entity.type, entity.id);
        if (!exists) {
          console.error(`Entity ${entity.type}:${entity.id} does not exist`);
          return false;
        }

        // Verify entity relationships
        const relationshipsValid = await DatabaseUtils.verifyEntityRelationships(
          entity.type,
          entity.id,
        );
        if (!relationshipsValid) {
          console.error(`Entity ${entity.type}:${entity.id} has invalid relationships`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Data integrity verification failed:', error);
      return false;
    }
  }

  /**
   * Generate test report
   */
  static async generateTestReport(testResults: any[]): Promise<string> {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: testResults.length,
      passed: testResults.filter((r) => r.status === 'passed').length,
      failed: testResults.filter((r) => r.status === 'failed').length,
      skipped: testResults.filter((r) => r.status === 'skipped').length,
      results: testResults,
    };

    return JSON.stringify(report, null, 2);
  }
}

// Export the test function with fixtures
export { expect } from '@playwright/test';
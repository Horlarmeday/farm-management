import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMultiTenantSchema1703123456790 implements MigrationInterface {
  name = 'AddMultiTenantSchema1703123456790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create farms table
    await queryRunner.query(`
      CREATE TABLE farms (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        website VARCHAR(255),
        timezone VARCHAR(100) DEFAULT 'UTC',
        currency VARCHAR(10) DEFAULT 'USD',
        ownerId VARCHAR(255) NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create farm_users junction table
    await queryRunner.query(`
      CREATE TABLE farm_users (
        id VARCHAR(255) PRIMARY KEY,
        farmId VARCHAR(255) NOT NULL,
        userId VARCHAR(255) NOT NULL,
        role ENUM('owner', 'manager', 'worker') NOT NULL DEFAULT 'worker',
        isActive BOOLEAN DEFAULT TRUE,
        joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (farmId) REFERENCES farms(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_farm_user (farmId, userId)
      )
    `);

    // Add farm_id to animals table
    const hasAnimalsTable = await queryRunner.hasTable('animals');
    if (hasAnimalsTable) {
      const hasFarmId = await queryRunner.hasColumn('animals', 'farmId');
      if (!hasFarmId) {
        await queryRunner.query(`ALTER TABLE animals ADD COLUMN farmId VARCHAR(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE animals ADD FOREIGN KEY (farmId) REFERENCES farms(id) ON DELETE CASCADE`);
      }
    }

    // Add farm_id to assets table
    const hasAssetsTable = await queryRunner.hasTable('assets');
    if (hasAssetsTable) {
      const hasFarmId = await queryRunner.hasColumn('assets', 'farmId');
      if (!hasFarmId) {
        await queryRunner.query(`ALTER TABLE assets ADD COLUMN farmId VARCHAR(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE assets ADD FOREIGN KEY (farmId) REFERENCES farms(id) ON DELETE CASCADE`);
      }
    }

    // Add farm_id to bird_batches table
    const hasBirdBatchesTable = await queryRunner.hasTable('bird_batches');
    if (hasBirdBatchesTable) {
      const hasFarmId = await queryRunner.hasColumn('bird_batches', 'farmId');
      if (!hasFarmId) {
        await queryRunner.query(`ALTER TABLE bird_batches ADD COLUMN farmId VARCHAR(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE bird_batches ADD FOREIGN KEY (farmId) REFERENCES farms(id) ON DELETE CASCADE`);
      }
    }

    // Add farm_id to financial_transactions table
    const hasFinancialTransactionsTable = await queryRunner.hasTable('financial_transactions');
    if (hasFinancialTransactionsTable) {
      const hasFarmId = await queryRunner.hasColumn('financial_transactions', 'farmId');
      if (!hasFarmId) {
        await queryRunner.query(`ALTER TABLE financial_transactions ADD COLUMN farmId VARCHAR(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE financial_transactions ADD FOREIGN KEY (farmId) REFERENCES farms(id) ON DELETE CASCADE`);
      }
    }

    // Add farm_id to inventory_items table
    const hasInventoryItemsTable = await queryRunner.hasTable('inventory_items');
    if (hasInventoryItemsTable) {
      const hasFarmId = await queryRunner.hasColumn('inventory_items', 'farmId');
      if (!hasFarmId) {
        await queryRunner.query(`ALTER TABLE inventory_items ADD COLUMN farmId VARCHAR(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE inventory_items ADD FOREIGN KEY (farmId) REFERENCES farms(id) ON DELETE CASCADE`);
      }
    }

    // Add farm_id to locations table
    const hasLocationsTable = await queryRunner.hasTable('locations');
    if (hasLocationsTable) {
      const hasFarmId = await queryRunner.hasColumn('locations', 'farmId');
      if (!hasFarmId) {
        await queryRunner.query(`ALTER TABLE locations ADD COLUMN farmId VARCHAR(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE locations ADD FOREIGN KEY (farmId) REFERENCES farms(id) ON DELETE CASCADE`);
      }
    }

    // Add farm_id to ponds table
    const hasPondsTable = await queryRunner.hasTable('ponds');
    if (hasPondsTable) {
      const hasFarmId = await queryRunner.hasColumn('ponds', 'farmId');
      if (!hasFarmId) {
        await queryRunner.query(`ALTER TABLE ponds ADD COLUMN farmId VARCHAR(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE ponds ADD FOREIGN KEY (farmId) REFERENCES farms(id) ON DELETE CASCADE`);
      }
    }

    // Add farm_id to tasks table
    const hasTasksTable = await queryRunner.hasTable('tasks');
    if (hasTasksTable) {
      const hasFarmId = await queryRunner.hasColumn('tasks', 'farmId');
      if (!hasFarmId) {
        await queryRunner.query(`ALTER TABLE tasks ADD COLUMN farmId VARCHAR(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE tasks ADD FOREIGN KEY (farmId) REFERENCES farms(id) ON DELETE CASCADE`);
      }
    }

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX idx_farms_owner ON farms(ownerId)`);
    await queryRunner.query(`CREATE INDEX idx_farm_users_farm ON farm_users(farmId)`);
    await queryRunner.query(`CREATE INDEX idx_farm_users_user ON farm_users(userId)`);
    await queryRunner.query(`CREATE INDEX idx_farm_users_role ON farm_users(role)`);
    
    // Add farm_id indexes on all tables
    if (hasAnimalsTable) {
      await queryRunner.query(`CREATE INDEX idx_animals_farm ON animals(farmId)`);
    }
    if (hasAssetsTable) {
      await queryRunner.query(`CREATE INDEX idx_assets_farm ON assets(farmId)`);
    }
    if (hasBirdBatchesTable) {
      await queryRunner.query(`CREATE INDEX idx_bird_batches_farm ON bird_batches(farmId)`);
    }
    if (hasFinancialTransactionsTable) {
      await queryRunner.query(`CREATE INDEX idx_financial_transactions_farm ON financial_transactions(farmId)`);
    }
    if (hasInventoryItemsTable) {
      await queryRunner.query(`CREATE INDEX idx_inventory_items_farm ON inventory_items(farmId)`);
    }
    if (hasLocationsTable) {
      await queryRunner.query(`CREATE INDEX idx_locations_farm ON locations(farmId)`);
    }
    if (hasPondsTable) {
      await queryRunner.query(`CREATE INDEX idx_ponds_farm ON ponds(farmId)`);
    }
    if (hasTasksTable) {
      await queryRunner.query(`CREATE INDEX idx_tasks_farm ON tasks(farmId)`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX idx_farms_owner`);
    await queryRunner.query(`DROP INDEX idx_farm_users_farm`);
    await queryRunner.query(`DROP INDEX idx_farm_users_user`);
    await queryRunner.query(`DROP INDEX idx_farm_users_role`);
    
    // Remove farm_id indexes
    const tables = ['animals', 'assets', 'bird_batches', 'financial_transactions', 'inventory_items', 'locations', 'ponds', 'tasks'];
    for (const table of tables) {
      const hasTable = await queryRunner.hasTable(table);
      if (hasTable) {
        await queryRunner.query(`DROP INDEX idx_${table}_farm`);
      }
    }

    // Remove farm_id columns and foreign keys
    for (const table of tables) {
      const hasTable = await queryRunner.hasTable(table);
      if (hasTable) {
        const hasFarmId = await queryRunner.hasColumn(table, 'farmId');
        if (hasFarmId) {
          await queryRunner.query(`ALTER TABLE ${table} DROP FOREIGN KEY ${table}_ibfk_farm`);
          await queryRunner.query(`ALTER TABLE ${table} DROP COLUMN farmId`);
        }
      }
    }

    // Drop tables
    await queryRunner.query(`DROP TABLE farm_users`);
    await queryRunner.query(`DROP TABLE farms`);
  }
}
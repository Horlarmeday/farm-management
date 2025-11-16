import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1758351400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Creating performance indexes for query optimization...');

    // Helper function to safely create index
    const createIndexSafely = async (indexName: string, tableName: string, columns: string) => {
      try {
        // Check if index exists
        const result = await queryRunner.query(
          `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
          [tableName, indexName]
        );
        
        if (result[0].count === 0) {
          await queryRunner.query(`CREATE INDEX ${indexName} ON ${tableName} (${columns})`);
          console.log(`✓ Created index: ${indexName}`);
        } else {
          console.log(`✓ Index already exists: ${indexName}`);
        }
      } catch (error) {
        console.log(`✗ Failed to create index ${indexName}:`, (error as Error).message);
      }
    };

    // Users table indexes - for role-based queries and status filtering
    await createIndexSafely('idx_users_role_status', 'users', 'roleId, status');

    // Tasks table indexes - for farm-based task management
    await createIndexSafely('idx_tasks_farm_assigned_status', 'tasks', 'farmId, assignedUserId, status');
    await createIndexSafely('idx_tasks_farm_created_status', 'tasks', 'farmId, createdById, status');

    // Animals table indexes - for livestock tracking and date range queries
    await createIndexSafely('idx_animals_farm_species_status', 'animals', 'farmId, species, status');
    await createIndexSafely('idx_animals_farm_date_range', 'animals', 'farmId, acquisitionDate, status');

    // Inventory items indexes - for product search and category filtering
    await createIndexSafely('idx_inventory_name_category_farm', 'inventory_items', 'name, category, farmId');
    await createIndexSafely('idx_inventory_category_farm_active', 'inventory_items', 'category, farmId, isActive');

    // Financial transactions indexes - for financial reporting and analysis
    await createIndexSafely('idx_financial_category_date_amount', 'financial_transactions', 'categoryId, date, amount');
    await createIndexSafely('idx_financial_farm_date_type', 'financial_transactions', 'farmId, date, type');

    // Production logs indexes - for production tracking and reporting
    await createIndexSafely('idx_production_animal_date', 'production_logs', 'animalId, date');
    await createIndexSafely('idx_production_farm_date_type', 'production_logs', 'farmId, date, type');

    console.log('Performance indexes creation completed!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Dropping performance indexes...');

    // Helper function to safely drop index
    const dropIndexSafely = async (indexName: string, tableName: string) => {
      try {
        const result = await queryRunner.query(
          `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
          [tableName, indexName]
        );
        
        if (result[0].count > 0) {
          await queryRunner.query(`DROP INDEX ${indexName} ON ${tableName}`);
          console.log(`✓ Dropped index: ${indexName}`);
        } else {
          console.log(`✓ Index does not exist: ${indexName}`);
        }
      } catch (error) {
        console.log(`✗ Failed to drop index ${indexName}:`, (error as Error).message);
      }
    };

    // Drop indexes in reverse order
    await dropIndexSafely('idx_production_farm_date_type', 'production_logs');
    await dropIndexSafely('idx_production_animal_date', 'production_logs');
    await dropIndexSafely('idx_financial_farm_date_type', 'financial_transactions');
    await dropIndexSafely('idx_financial_category_date_amount', 'financial_transactions');
    await dropIndexSafely('idx_inventory_category_farm_active', 'inventory_items');
    await dropIndexSafely('idx_inventory_name_category_farm', 'inventory_items');
    await dropIndexSafely('idx_animals_farm_date_range', 'animals');
    await dropIndexSafely('idx_animals_farm_species_status', 'animals');
    await dropIndexSafely('idx_tasks_farm_created_status', 'tasks');
    await dropIndexSafely('idx_tasks_farm_assigned_status', 'tasks');
    await dropIndexSafely('idx_users_role_status', 'users');

    console.log('Performance indexes removal completed!');
  }
}
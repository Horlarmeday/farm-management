import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInventoryItemReorderPoint1757243800000 implements MigrationInterface {
  name = 'AddInventoryItemReorderPoint1757243800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const tableExists = await queryRunner.hasTable('inventory_items');
    if (!tableExists) {
      console.log('Table inventory_items does not exist, skipping migration');
      return;
    }

    // Check if column already exists
    const columnExists = await queryRunner.hasColumn('inventory_items', 'reorderPoint');
    if (columnExists) {
      console.log('Column reorderPoint already exists, skipping migration');
      return;
    }

    // Add reorderPoint column
    await queryRunner.query(`
      ALTER TABLE \`inventory_items\` 
      ADD COLUMN \`reorderPoint\` decimal(10,2) NOT NULL DEFAULT 0
    `);

    console.log('Added reorderPoint column to inventory_items table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const tableExists = await queryRunner.hasTable('inventory_items');
    if (!tableExists) {
      console.log('Table inventory_items does not exist, skipping rollback');
      return;
    }

    // Check if column exists
    const columnExists = await queryRunner.hasColumn('inventory_items', 'reorderPoint');
    if (!columnExists) {
      console.log('Column reorderPoint does not exist, skipping rollback');
      return;
    }

    // Remove reorderPoint column
    await queryRunner.query(`
      ALTER TABLE \`inventory_items\` 
      DROP COLUMN \`reorderPoint\`
    `);

    console.log('Removed reorderPoint column from inventory_items table');
  }
}
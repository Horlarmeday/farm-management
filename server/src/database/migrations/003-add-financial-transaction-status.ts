import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFinancialTransactionStatus1703123456790 implements MigrationInterface {
  name = 'AddFinancialTransactionStatus1703123456790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if financial_transactions table exists
    const tableExists = await queryRunner.hasTable('financial_transactions');
    if (!tableExists) {
      console.log('Financial transactions table does not exist, skipping migration');
      return;
    }

    // Check if status column already exists
    const hasStatus = await queryRunner.hasColumn('financial_transactions', 'status');
    if (!hasStatus) {
      // Add status column with enum type and default value
      await queryRunner.query(`
        ALTER TABLE financial_transactions 
        ADD COLUMN status ENUM('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED') 
        DEFAULT 'PENDING' NOT NULL
      `);
      console.log('Added status column to financial_transactions table');
    } else {
      console.log('Status column already exists in financial_transactions table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if financial_transactions table exists
    const tableExists = await queryRunner.hasTable('financial_transactions');
    if (!tableExists) {
      console.log('Financial transactions table does not exist, skipping rollback');
      return;
    }

    // Check if status column exists before dropping
    const hasStatus = await queryRunner.hasColumn('financial_transactions', 'status');
    if (hasStatus) {
      await queryRunner.query(`ALTER TABLE financial_transactions DROP COLUMN status`);
      console.log('Removed status column from financial_transactions table');
    } else {
      console.log('Status column does not exist in financial_transactions table');
    }
  }
}
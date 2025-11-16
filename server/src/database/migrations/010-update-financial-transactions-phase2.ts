import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFinancialTransactionsPhase21757451600000 implements MigrationInterface {
  name = 'UpdateFinancialTransactionsPhase21757451600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to financial_transactions table (check if they exist first)
    const columns = [
      { name: 'subcategory', definition: 'VARCHAR(100)' },
      { name: 'reference_number', definition: 'VARCHAR(255)' },
      { name: 'reference_type', definition: "VARCHAR(50) CHECK (reference_type IN ('invoice', 'receipt', 'order', 'sale', 'purchase', 'manual'))" },
      { name: 'reference_id', definition: 'VARCHAR(255)' },
      { name: 'attachments', definition: 'TEXT' },
      { name: 'recorded_by_id', definition: 'VARCHAR(255)' },
      { name: 'approved_by_id', definition: 'VARCHAR(255)' },
      { name: 'approved_at', definition: 'TIMESTAMP' }
    ];

    for (const column of columns) {
      const columnExists = await queryRunner.hasColumn('financial_transactions', column.name);
      if (!columnExists) {
        await queryRunner.query(`
          ALTER TABLE financial_transactions 
          ADD COLUMN ${column.name} ${column.definition}
        `);
      }
    }

    // Update payment_method column to use enum (check if it exists first)
    const paymentMethodExists = await queryRunner.hasColumn('financial_transactions', 'payment_method');
    if (paymentMethodExists) {
      await queryRunner.query(`
        ALTER TABLE financial_transactions 
        MODIFY COLUMN payment_method VARCHAR(50)
      `);
    } else {
      // Add payment_method column if it doesn't exist
      await queryRunner.query(`
        ALTER TABLE financial_transactions 
        ADD COLUMN payment_method VARCHAR(50)
      `);
    }

    // Add foreign key constraints for user relationships (check if they exist first)
    const recordedByFkExists = await queryRunner.query(`
      SELECT COUNT(*) as count FROM information_schema.TABLE_CONSTRAINTS 
      WHERE CONSTRAINT_NAME = 'fk_financial_transactions_recorded_by' 
      AND TABLE_NAME = 'financial_transactions'
    `);
    
    if (recordedByFkExists[0].count === 0) {
      await queryRunner.query(`
        ALTER TABLE financial_transactions 
        ADD CONSTRAINT fk_financial_transactions_recorded_by 
        FOREIGN KEY (recorded_by_id) REFERENCES users(id) ON DELETE SET NULL
      `);
    }

    const approvedByFkExists = await queryRunner.query(`
      SELECT COUNT(*) as count FROM information_schema.TABLE_CONSTRAINTS 
      WHERE CONSTRAINT_NAME = 'fk_financial_transactions_approved_by' 
      AND TABLE_NAME = 'financial_transactions'
    `);
    
    if (approvedByFkExists[0].count === 0) {
      await queryRunner.query(`
        ALTER TABLE financial_transactions 
        ADD CONSTRAINT fk_financial_transactions_approved_by 
        FOREIGN KEY (approved_by_id) REFERENCES users(id) ON DELETE SET NULL
      `);
    }

    // Remove old reference column if it exists
    const referenceColumnExists = await queryRunner.hasColumn('financial_transactions', 'reference');
    if (referenceColumnExists) {
      await queryRunner.query(`
        ALTER TABLE financial_transactions 
        DROP COLUMN reference
      `);
    }

    // Add indexes for better performance (check if they exist first)
    const indexes = [
      { name: 'idx_financial_transactions_category', columns: 'category' },
      { name: 'idx_financial_transactions_subcategory', columns: 'subcategory' },
      { name: 'idx_financial_transactions_transaction_date', columns: 'transaction_date' },
      { name: 'idx_financial_transactions_recorded_by', columns: 'recorded_by_id' },
      { name: 'idx_financial_transactions_farm_date', columns: 'farm_id, transaction_date' }
    ];

    for (const index of indexes) {
      const indexExists = await queryRunner.query(`
        SELECT COUNT(*) as count FROM information_schema.STATISTICS 
        WHERE INDEX_NAME = '${index.name}' 
        AND TABLE_NAME = 'financial_transactions'
      `);
      
      if (indexExists[0].count === 0) {
        await queryRunner.query(`
          CREATE INDEX ${index.name} ON financial_transactions(${index.columns})
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financial_transactions_farm_date`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financial_transactions_recorded_by`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financial_transactions_transaction_date`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financial_transactions_subcategory`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_financial_transactions_category`);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE financial_transactions 
      DROP CONSTRAINT IF EXISTS fk_financial_transactions_approved_by
    `);
    
    await queryRunner.query(`
      ALTER TABLE financial_transactions 
      DROP CONSTRAINT IF EXISTS fk_financial_transactions_recorded_by
    `);

    // Add back reference column
    await queryRunner.query(`
      ALTER TABLE financial_transactions 
      ADD COLUMN reference VARCHAR(255)
    `);

    // Remove new columns
    await queryRunner.query(`
      ALTER TABLE financial_transactions 
      DROP COLUMN IF EXISTS approved_at,
      DROP COLUMN IF EXISTS approved_by_id,
      DROP COLUMN IF EXISTS recorded_by_id,
      DROP COLUMN IF EXISTS attachments,
      DROP COLUMN IF EXISTS reference_id,
      DROP COLUMN IF EXISTS reference_type,
      DROP COLUMN IF EXISTS reference_number,
      DROP COLUMN IF EXISTS subcategory
    `);
  }
}
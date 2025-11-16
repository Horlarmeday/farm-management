import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FixFinancialTransactionsColumnNames1757484600000 implements MigrationInterface {
  name = 'FixFinancialTransactionsColumnNames1757484600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add camelCase columns that TypeORM expects
    const columns = [
      { old: 'reference_number', new: 'referenceNumber', definition: 'VARCHAR(255)' },
      { old: 'reference_type', new: 'referenceType', definition: 'VARCHAR(50)' },
      { old: 'reference_id', new: 'referenceId', definition: 'VARCHAR(255)' },
      { old: 'recorded_by_id', new: 'recordedById', definition: 'VARCHAR(255)' },
      { old: 'approved_by_id', new: 'approvedById', definition: 'VARCHAR(255)' },
      { old: 'approved_at', new: 'approvedAt', definition: 'TIMESTAMP' },
      { old: 'payment_method', new: 'paymentMethod', definition: 'VARCHAR(50)' },
      { old: 'transaction_date', new: 'transactionDate', definition: 'DATE' },
      { old: 'transaction_number', new: 'transactionNumber', definition: 'VARCHAR(100)' },
      { old: 'cost_center_id', new: 'costCenterId', definition: 'VARCHAR(255)' },
      { old: 'farm_id', new: 'farmId', definition: 'VARCHAR(255)' },
      { old: 'user_id', new: 'userId', definition: 'VARCHAR(255)' },
      { old: 'created_at', new: 'createdAt', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { old: 'updated_at', new: 'updatedAt', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
      { old: 'deleted_at', new: 'deletedAt', definition: 'TIMESTAMP NULL' }
    ];

    for (const column of columns) {
      // Check if old column exists and new column doesn't
      const oldExists = await queryRunner.hasColumn('financial_transactions', column.old);
      const newExists = await queryRunner.hasColumn('financial_transactions', column.new);
      
      if (oldExists && !newExists) {
        // Copy data from old column to new column
        await queryRunner.query(`
          ALTER TABLE financial_transactions 
          ADD COLUMN ${column.new} ${column.definition}
        `);
        
        await queryRunner.query(`
          UPDATE financial_transactions 
          SET ${column.new} = ${column.old}
        `);
      } else if (!newExists) {
        // Add new column if neither exists
        await queryRunner.query(`
          ALTER TABLE financial_transactions 
          ADD COLUMN ${column.new} ${column.definition}
        `);
      }
    }

    // Recreate foreign key constraints with new column names
    const constraints = [
      {
        name: 'fk_financial_transactions_recorded_by_new',
        column: 'recordedById',
        references: 'users(id)'
      },
      {
        name: 'fk_financial_transactions_approved_by_new', 
        column: 'approvedById',
        references: 'users(id)'
      },
      {
        name: 'fk_financial_transactions_user_new',
        column: 'userId', 
        references: 'users(id)'
      },
      {
        name: 'fk_financial_transactions_farm_new',
        column: 'farmId',
        references: 'farms(id)'
      },
      {
        name: 'fk_financial_transactions_cost_center_new',
        column: 'costCenterId',
        references: 'cost_centers(id)'
      }
    ];

    for (const constraint of constraints) {
      const fkExists = await queryRunner.query(`
        SELECT COUNT(*) as count FROM information_schema.TABLE_CONSTRAINTS 
        WHERE CONSTRAINT_NAME = '${constraint.name}' 
        AND TABLE_NAME = 'financial_transactions'
      `);
      
      if (fkExists[0].count === 0) {
        try {
          await queryRunner.query(`
            ALTER TABLE financial_transactions 
            ADD CONSTRAINT ${constraint.name} 
            FOREIGN KEY (${constraint.column}) REFERENCES ${constraint.references} ON DELETE SET NULL
          `);
        } catch (error) {
          // Ignore if referenced table doesn't exist
          console.log(`Skipping constraint ${constraint.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new foreign key constraints
    const constraints = [
      'fk_financial_transactions_cost_center_new',
      'fk_financial_transactions_farm_new', 
      'fk_financial_transactions_user_new',
      'fk_financial_transactions_approved_by_new',
      'fk_financial_transactions_recorded_by_new'
    ];

    for (const constraint of constraints) {
      await queryRunner.query(`
        ALTER TABLE financial_transactions 
        DROP CONSTRAINT IF EXISTS ${constraint}
      `);
    }

    // Remove camelCase columns
    const columnsToRemove = [
      'deletedAt', 'updatedAt', 'createdAt', 'userId', 'farmId', 'costCenterId',
      'transactionNumber', 'transactionDate', 'paymentMethod', 'approvedAt',
      'approvedById', 'recordedById', 'referenceId', 'referenceType', 'referenceNumber'
    ];

    for (const column of columnsToRemove) {
      await queryRunner.query(`
        ALTER TABLE financial_transactions 
        DROP COLUMN IF EXISTS ${column}
      `);
    }
  }
}
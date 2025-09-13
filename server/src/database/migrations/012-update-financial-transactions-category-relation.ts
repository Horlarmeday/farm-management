import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFinancialTransactionsCategoryRelation1757451800000 implements MigrationInterface {
  name = 'UpdateFinancialTransactionsCategoryRelation1757451800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add category_id column
    const categoryIdExists = await queryRunner.hasColumn('financial_transactions', 'category_id');
    if (!categoryIdExists) {
      await queryRunner.query(`
        ALTER TABLE financial_transactions 
        ADD COLUMN category_id VARCHAR(36)
      `);
    }

    // Migrate existing category data to use category_id
    // Map old enum values to new category IDs
    const categoryMappings = [
      // Income categories
      { oldValue: 'crop_sales', newCategory: 'crop_sales' },
      { oldValue: 'livestock_sales', newCategory: 'livestock_sales' },
      { oldValue: 'product_sales', newCategory: 'product_sales' },
      { oldValue: 'government_subsidies', newCategory: 'government_subsidies' },
      { oldValue: 'insurance_claims', newCategory: 'insurance_claims' },
      { oldValue: 'other_income', newCategory: 'other_income' },
      
      // Expense categories
      { oldValue: 'seeds_plants', newCategory: 'seeds_plants' },
      { oldValue: 'fertilizers', newCategory: 'fertilizers' },
      { oldValue: 'pesticides', newCategory: 'pesticides' },
      { oldValue: 'feed', newCategory: 'feed' },
      { oldValue: 'veterinary', newCategory: 'veterinary' },
      { oldValue: 'fuel', newCategory: 'fuel' },
      { oldValue: 'equipment_maintenance', newCategory: 'equipment_maintenance' },
      { oldValue: 'labor', newCategory: 'labor' },
      { oldValue: 'utilities', newCategory: 'utilities' },
      { oldValue: 'insurance', newCategory: 'insurance' },
      { oldValue: 'taxes', newCategory: 'taxes' },
      { oldValue: 'rent_lease', newCategory: 'rent_lease' },
      { oldValue: 'transportation', newCategory: 'transportation' },
      { oldValue: 'marketing', newCategory: 'marketing' },
      { oldValue: 'professional_services', newCategory: 'professional_services' },
      { oldValue: 'other_expenses', newCategory: 'other_expenses' },
    ];

    // Update category_id based on existing category values
    for (const mapping of categoryMappings) {
      await queryRunner.query(`
        UPDATE financial_transactions ft
        SET category_id = (
          SELECT id FROM financial_categories fc 
          WHERE fc.default_category = '${mapping.newCategory}'
          LIMIT 1
        )
        WHERE ft.category = '${mapping.oldValue}'
      `);
    }

    // Set category_id to 'other_income' or 'other_expenses' for any unmapped categories
    await queryRunner.query(`
      UPDATE financial_transactions ft
      SET category_id = (
        SELECT id FROM financial_categories fc 
        WHERE fc.default_category = 'other_income'
        LIMIT 1
      )
      WHERE ft.category_id IS NULL AND ft.type = 'income'
    `);

    await queryRunner.query(`
      UPDATE financial_transactions ft
      SET category_id = (
        SELECT id FROM financial_categories fc 
        WHERE fc.default_category = 'other_expenses'
        LIMIT 1
      )
      WHERE ft.category_id IS NULL AND ft.type = 'expense'
    `);

    // Make category_id NOT NULL after data migration
    await queryRunner.query(`
      ALTER TABLE financial_transactions 
      MODIFY COLUMN category_id VARCHAR(36) NOT NULL
    `);

    // Add foreign key constraint
    const fkExists = await queryRunner.query(`
      SELECT COUNT(*) as count FROM information_schema.TABLE_CONSTRAINTS 
      WHERE CONSTRAINT_NAME = 'fk_financial_transactions_category' 
      AND TABLE_NAME = 'financial_transactions'
    `);
    
    if (fkExists[0].count === 0) {
      await queryRunner.query(`
        ALTER TABLE financial_transactions 
        ADD CONSTRAINT fk_financial_transactions_category 
        FOREIGN KEY (category_id) REFERENCES financial_categories(id)
      `);
    }

    // Add index for better performance
    const indexExists = await queryRunner.query(`
      SELECT COUNT(*) as count FROM information_schema.STATISTICS 
      WHERE INDEX_NAME = 'idx_financial_transactions_category_id' 
      AND TABLE_NAME = 'financial_transactions'
    `);
    
    if (indexExists[0].count === 0) {
      await queryRunner.query(`
        CREATE INDEX idx_financial_transactions_category_id 
        ON financial_transactions(category_id)
      `);
    }

    // Remove old category column after migration
    const oldCategoryExists = await queryRunner.hasColumn('financial_transactions', 'category');
    if (oldCategoryExists) {
      await queryRunner.query(`
        ALTER TABLE financial_transactions 
        DROP COLUMN category
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the old category column
    await queryRunner.query(`
      ALTER TABLE financial_transactions 
      ADD COLUMN category VARCHAR(100)
    `);

    // Migrate data back from category_id to category enum
    await queryRunner.query(`
      UPDATE financial_transactions ft
      SET category = (
        SELECT fc.default_category FROM financial_categories fc 
        WHERE fc.id = ft.category_id
      )
    `);

    // Remove foreign key constraint
    await queryRunner.query(`
      ALTER TABLE financial_transactions 
      DROP FOREIGN KEY fk_financial_transactions_category
    `);

    // Remove index
    await queryRunner.query(`
      DROP INDEX idx_financial_transactions_category_id 
      ON financial_transactions
    `);

    // Remove category_id column
    await queryRunner.query(`
      ALTER TABLE financial_transactions 
      DROP COLUMN category_id
    `);
  }
}
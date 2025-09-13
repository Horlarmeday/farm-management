import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFinancialCategories1757451700000 implements MigrationInterface {
  name = 'CreateFinancialCategories1757451700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create financial_categories table
    await queryRunner.query(`
      CREATE TABLE financial_categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        default_category ENUM(
          'crop_sales', 'livestock_sales', 'product_sales', 'government_subsidies', 
          'insurance_claims', 'other_income', 'seeds_plants', 'fertilizers', 
          'pesticides', 'feed', 'veterinary', 'fuel', 'equipment_maintenance', 
          'labor', 'utilities', 'insurance', 'taxes', 'rent_lease', 
          'transportation', 'marketing', 'professional_services', 'other_expenses'
        ) NULL,
        description TEXT NULL,
        is_custom BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        color VARCHAR(50) NULL,
        icon VARCHAR(50) NULL,
        farm_id VARCHAR(36) NULL,
        created_by_id VARCHAR(36) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_financial_categories_type (type),
        INDEX idx_financial_categories_farm_id (farm_id),
        INDEX idx_financial_categories_is_active (is_active),
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Insert default income categories
    await queryRunner.query(`
      INSERT INTO financial_categories (id, name, type, default_category, description, is_custom, is_active) VALUES
      (UUID(), 'Crop Sales', 'income', 'crop_sales', 'Revenue from selling crops and produce', FALSE, TRUE),
      (UUID(), 'Livestock Sales', 'income', 'livestock_sales', 'Revenue from selling livestock and animals', FALSE, TRUE),
      (UUID(), 'Product Sales', 'income', 'product_sales', 'Revenue from selling processed products', FALSE, TRUE),
      (UUID(), 'Government Subsidies', 'income', 'government_subsidies', 'Government grants and subsidies', FALSE, TRUE),
      (UUID(), 'Insurance Claims', 'income', 'insurance_claims', 'Insurance payouts and claims', FALSE, TRUE),
      (UUID(), 'Other Income', 'income', 'other_income', 'Miscellaneous income sources', FALSE, TRUE)
    `);

    // Insert default expense categories
    await queryRunner.query(`
      INSERT INTO financial_categories (id, name, type, default_category, description, is_custom, is_active) VALUES
      (UUID(), 'Seeds & Plants', 'expense', 'seeds_plants', 'Cost of seeds, seedlings, and plants', FALSE, TRUE),
      (UUID(), 'Fertilizers', 'expense', 'fertilizers', 'Cost of fertilizers and soil amendments', FALSE, TRUE),
      (UUID(), 'Pesticides', 'expense', 'pesticides', 'Cost of pesticides and herbicides', FALSE, TRUE),
      (UUID(), 'Feed', 'expense', 'feed', 'Animal feed and supplements', FALSE, TRUE),
      (UUID(), 'Veterinary', 'expense', 'veterinary', 'Veterinary services and medicines', FALSE, TRUE),
      (UUID(), 'Fuel', 'expense', 'fuel', 'Fuel for equipment and vehicles', FALSE, TRUE),
      (UUID(), 'Equipment Maintenance', 'expense', 'equipment_maintenance', 'Equipment repairs and maintenance', FALSE, TRUE),
      (UUID(), 'Labor', 'expense', 'labor', 'Wages and labor costs', FALSE, TRUE),
      (UUID(), 'Utilities', 'expense', 'utilities', 'Electricity, water, and other utilities', FALSE, TRUE),
      (UUID(), 'Insurance', 'expense', 'insurance', 'Insurance premiums and costs', FALSE, TRUE),
      (UUID(), 'Taxes', 'expense', 'taxes', 'Property taxes and other tax payments', FALSE, TRUE),
      (UUID(), 'Rent & Lease', 'expense', 'rent_lease', 'Land rent and equipment lease payments', FALSE, TRUE),
      (UUID(), 'Transportation', 'expense', 'transportation', 'Transportation and shipping costs', FALSE, TRUE),
      (UUID(), 'Marketing', 'expense', 'marketing', 'Marketing and advertising expenses', FALSE, TRUE),
      (UUID(), 'Professional Services', 'expense', 'professional_services', 'Legal, accounting, and consulting fees', FALSE, TRUE),
      (UUID(), 'Other Expenses', 'expense', 'other_expenses', 'Miscellaneous expenses', FALSE, TRUE)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE financial_categories`);
  }
}
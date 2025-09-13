const { DataSource } = require('typeorm');
require('dotenv').config();

// Database configuration
const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'farm_management',
  synchronize: false,
  logging: false
});

async function fixTypeEnum() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connected successfully');
    
    console.log('🔧 Updating type column enum values...');
    
    // First, update existing data to uppercase
    await dataSource.query(`
      UPDATE financial_transactions 
      SET type = CASE 
        WHEN type = 'income' THEN 'INCOME'
        WHEN type = 'expense' THEN 'EXPENSE'
        ELSE type
      END
    `);
    
    console.log('✅ Updated existing data to uppercase');
    
    // Then modify the column to use uppercase enum values
    await dataSource.query(`
      ALTER TABLE financial_transactions 
      MODIFY COLUMN type ENUM('INCOME', 'EXPENSE') NOT NULL
    `);
    
    console.log('✅ Updated enum definition to uppercase');
    
    // Verify the change
    const result = await dataSource.query('DESCRIBE financial_transactions');
    const typeColumn = result.find(col => col.Field === 'type');
    
    console.log('\n🔍 Updated Type Column:');
    console.log('Type:', typeColumn.Type);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

fixTypeEnum();
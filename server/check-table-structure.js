const { DataSource } = require('typeorm');
const path = require('path');
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

async function checkTableStructure() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connected successfully');
    
    // Check table structure
    const result = await dataSource.query('DESCRIBE financial_transactions');
    console.log('\n📋 Financial Transactions Table Structure:');
    console.log('='.repeat(80));
    console.table(result);
    
    // Check specifically the type column
    const typeColumn = result.find(col => col.Field === 'type');
    if (typeColumn) {
      console.log('\n🔍 Type Column Details:');
      console.log('Field:', typeColumn.Field);
      console.log('Type:', typeColumn.Type);
      console.log('Null:', typeColumn.Null);
      console.log('Key:', typeColumn.Key);
      console.log('Default:', typeColumn.Default);
      console.log('Extra:', typeColumn.Extra);
    } else {
      console.log('\n❌ Type column not found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

checkTableStructure();
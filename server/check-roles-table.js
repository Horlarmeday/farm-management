const { DataSource } = require('typeorm');
require('dotenv').config();

// Database configuration
const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'kuyash_fms',
  synchronize: false,
  logging: true
});

async function checkTablesStructure() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Check roles table structure
    console.log('\n=== ROLES TABLE STRUCTURE ===');
    const rolesColumns = await dataSource.query('DESCRIBE roles');
    console.table(rolesColumns);

    // Check users table structure
    console.log('\n=== USERS TABLE STRUCTURE ===');
    const usersColumns = await dataSource.query('DESCRIBE users');
    console.table(usersColumns);

    // Check farms table structure
    console.log('\n=== FARMS TABLE STRUCTURE ===');
    const farmsColumns = await dataSource.query('DESCRIBE farms');
    console.table(farmsColumns);

    // Check financial_categories table structure
    console.log('\n=== FINANCIAL_CATEGORIES TABLE STRUCTURE ===');
    const categoriesColumns = await dataSource.query('DESCRIBE financial_categories');
    console.table(categoriesColumns);

    // Check existing data
    console.log('\n=== EXISTING ROLES ===');
    const existingRoles = await dataSource.query('SELECT * FROM roles LIMIT 5');
    console.table(existingRoles);

    console.log('\n=== EXISTING USERS ===');
    const existingUsers = await dataSource.query('SELECT id, email, firstName, lastName FROM users LIMIT 5');
    console.table(existingUsers);

  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  } finally {
    await dataSource.destroy();
  }
}

checkTablesStructure();
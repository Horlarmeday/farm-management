const { DataSource } = require('typeorm');
require('dotenv').config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'kuyash_fms',
});

async function insertTestData() {
  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    // Ensure user with ID 1 exists (using INSERT IGNORE)
    await dataSource.query(`
      INSERT IGNORE INTO users (id, email, password, firstName, lastName, roleId, createdAt, updatedAt) 
      VALUES (
        '1', 
        'test@example.com', 
        '$2b$10$hashedpassword', 
        'Test', 
        'User', 
        1, 
        NOW(), 
        NOW()
      )
    `);
    console.log('✅ User with ID 1 ensured');

    // Ensure farm exists for the user (using INSERT IGNORE)
    await dataSource.query(`
      INSERT IGNORE INTO farms (id, name, address, ownerId, createdAt, updatedAt) 
      VALUES (
        'test-farm-for-user-1', 
        'Test Farm for User 1', 
        'Test Location', 
        '1', 
        NOW(), 
        NOW()
      )
    `);
    console.log('✅ Farm ensured');

    // Ensure financial category with ID 1 exists (using INSERT IGNORE)
    await dataSource.query(`
      INSERT IGNORE INTO financial_categories (id, name, type, description, farm_id, created_by_id, created_at, updated_at) 
      VALUES (
        1, 
        'Feed Expenses', 
        'EXPENSE', 
        'Animal feed and nutrition costs', 
        'test-farm-for-user-1', 
        '1', 
        NOW(), 
        NOW()
      )
    `);
    console.log('✅ Financial category with ID 1 ensured');

    // Verify the test data exists
    const user = await dataSource.query('SELECT id, email FROM users WHERE id = ?', ['1']);
    const farm = await dataSource.query('SELECT id, name FROM farms WHERE ownerId = ?', ['1']);
    const category = await dataSource.query('SELECT id, name FROM financial_categories WHERE id = 1');

    console.log('\n=== Test Data Status ===');
    console.log('✅ User:', user[0] || 'NOT FOUND');
    console.log('✅ Farm:', farm[0] || 'NOT FOUND');
    console.log('✅ Category:', category[0] || 'NOT FOUND');
    console.log('\n🎉 Ready for transaction API testing!');

  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    await dataSource.destroy();
  }
}

insertTestData();
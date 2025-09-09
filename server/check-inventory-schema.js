const mysql = require('mysql2/promise');

async function checkInventorySchema() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kunley23$',
      database: 'kuyash_fms',
    });
    
    console.log('Database connected successfully');
    
    // Get table schema
    const [rows] = await connection.execute('DESCRIBE inventory_items');
    
    console.log('\nInventory Items Table Columns:');
    console.log('==============================');
    rows.forEach(row => {
      console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(nullable)' : '(not null)'} ${row.Default ? `default: ${row.Default}` : ''}`);
    });
    
  } catch (error) {
    console.error('Error checking schema:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkInventorySchema();
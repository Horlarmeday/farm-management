const mysql = require('mysql2/promise');

async function testInventoryQuery() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kunley23$',
      database: 'kuyash_fms',
    });
    
    console.log('Database connected successfully');
    
    // Test basic inventory query
    console.log('\n1. Testing basic inventory query:');
    const [items] = await connection.execute('SELECT COUNT(*) as count FROM inventory_items');
    console.log(`Total inventory items: ${items[0].count}`);
    
    // Test low stock query
    console.log('\n2. Testing low stock query:');
    const [lowStockItems] = await connection.execute(
      'SELECT COUNT(*) as count FROM inventory_items WHERE currentStock <= minimumStock',
    );
    console.log(`Low stock items: ${lowStockItems[0].count}`);
    
    // Test expiring items query
    console.log('\n3. Testing expiring items query:');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const [expiringItems] = await connection.execute(
      'SELECT COUNT(*) as count FROM inventory_items WHERE expiryDate IS NOT NULL AND expiryDate <= ? AND currentStock > 0',
      [futureDate],
    );
    console.log(`Expiring items: ${expiringItems[0].count}`);
    
    // Test inventory valuation query
    console.log('\n4. Testing inventory valuation query:');
    const [valuationItems] = await connection.execute(
      'SELECT SUM(currentStock * COALESCE(unitCost, 0)) as totalValue FROM inventory_items',
    );
    console.log(`Total inventory value: ${valuationItems[0].totalValue || 0}`);
    
    // Test category breakdown
    console.log('\n5. Testing category breakdown:');
    const [categoryItems] = await connection.execute(
      'SELECT category, SUM(currentStock * COALESCE(unitCost, 0)) as categoryValue FROM inventory_items GROUP BY category',
    );
    categoryItems.forEach(item => {
      console.log(`${item.category}: ${item.categoryValue || 0}`);
    });
    
  } catch (error) {
    console.error('Error testing queries:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testInventoryQuery();
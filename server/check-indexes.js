const { AppDataSource } = require('./dist/config/database');

async function checkIndexes() {
  try {
    await AppDataSource.initialize();
    
    // Check existing indexes
    const queries = [
      "SHOW INDEX FROM users WHERE Key_name LIKE 'idx_%'",
      "SHOW INDEX FROM tasks WHERE Key_name LIKE 'idx_%'",
      "SHOW INDEX FROM financial_transactions WHERE Key_name LIKE 'idx_%'",
      "SHOW INDEX FROM animals WHERE Key_name LIKE 'idx_%'",
      "SHOW INDEX FROM inventory WHERE Key_name LIKE 'idx_%'",
    ];
    
    for (const query of queries) {
      console.log(`\n=== ${query} ===`);
      const result = await AppDataSource.query(query);
      console.log(result.map(r => r.Key_name).filter(name => name.startsWith('idx_')));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await AppDataSource.destroy();
  }
}

checkIndexes();
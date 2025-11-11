const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'Kunley23$',
  database: process.env.DB_NAME || 'kuyash_fms',
};

// Performance testing queries
const performanceTests = [
  {
    name: 'Users by Role and Status',
    query: `
      SELECT u.id, u.firstName, u.lastName, u.email, u.status
      FROM users u 
      WHERE u.roleId = ? AND u.status = 'active'
      ORDER BY u.lastName
      LIMIT 100
    `,
    params: [1],
    description: 'Query users by role and status (should use idx_users_role_status)',
  },
  {
    name: 'Tasks by Farm and Assigned User',
    query: `
      SELECT t.id, t.title, t.status, t.dueDate
      FROM tasks t 
      WHERE t.farmId = ? AND t.assignedUserId = ? AND t.status IN ('pending', 'in_progress')
      ORDER BY t.dueDate
      LIMIT 50
    `,
    params: [1, 1],
    description: 'Query tasks by farm and assigned user (should use idx_tasks_farm_assigned_status)',
  },
  {
    name: 'Animals by Farm and Species',
    query: `
      SELECT a.id, a.tagNumber, a.species, a.status, a.acquisitionDate
      FROM animals a 
      WHERE a.farmId = ? AND a.species = ? AND a.status = 'active'
      ORDER BY a.acquisitionDate DESC
      LIMIT 100
    `,
    params: [1, 'cattle'],
    description: 'Query animals by farm and species (should use idx_animals_farm_species_status)',
  },
  {
    name: 'Inventory Items by Category and Farm',
    query: `
      SELECT i.id, i.name, i.category, i.currentStock, i.reorderPoint
      FROM inventory_items i 
      WHERE i.category = ? AND i.farmId = ? AND i.isActive = true
      ORDER BY i.name
      LIMIT 100
    `,
    params: ['feed', 1],
    description: 'Query inventory by category and farm (should use idx_inventory_category_farm_active)',
  },
  {
    name: 'Financial Transactions by Date Range',
    query: `
      SELECT ft.id, ft.amount, ft.type, ft.description, ft.transactionDate
      FROM financial_transactions ft 
      WHERE ft.farmId = ? AND ft.transactionDate BETWEEN ? AND ? AND ft.type = ?
      ORDER BY ft.transactionDate DESC
      LIMIT 100
    `,
    params: [1, '2024-01-01', '2024-12-31', 'expense'],
    description: 'Query financial transactions by farm and date range (should use idx_financial_farm_date_type)',
  },
  {
    name: 'Production Logs by Animal and Date',
    query: `
      SELECT pl.id, pl.productionType, pl.quantity, pl.date, pl.notes
      FROM production_logs pl 
      WHERE pl.animalId = ? AND pl.date BETWEEN ? AND ?
      ORDER BY pl.date DESC
      LIMIT 50
    `,
    params: [1, '2024-01-01', '2024-12-31'],
    description: 'Query production logs by animal and date (should use idx_production_animal_date)',
  },
];

async function runPerformanceTest() {
  let connection;
  
  try {
    console.log('🚀 Starting Database Query Performance Test\n');
    console.log('='.repeat(60));
    
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established\n');

    const results = [];
    
    for (const test of performanceTests) {
      console.log(`📊 Testing: ${test.name}`);
      console.log(`📝 Description: ${test.description}`);
      
      // Run the query multiple times to get average performance
      const iterations = 5;
      const times = [];
      let recordCount = 0;
      
      for (let i = 0; i < iterations; i++) {
        const startTime = process.hrtime.bigint();
        
        try {
          const [rows] = await connection.execute(test.query, test.params);
          const endTime = process.hrtime.bigint();
          const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
          
          times.push(executionTime);
          
          if (i === 0) {
            recordCount = rows.length;
            console.log(`📈 Records returned: ${recordCount}`);
          }
        } catch (error) {
          console.log(`❌ Query failed: ${error.message}`);
          break;
        }
      }
      
      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        console.log(`⚡ Average execution time: ${avgTime.toFixed(2)}ms`);
        console.log(`⚡ Min execution time: ${minTime.toFixed(2)}ms`);
        console.log(`⚡ Max execution time: ${maxTime.toFixed(2)}ms`);
        
        results.push({
          name: test.name,
          records: recordCount,
          avgTime: `${avgTime.toFixed(2)}ms`,
          minTime: `${minTime.toFixed(2)}ms`,
          maxTime: `${maxTime.toFixed(2)}ms`,
          performance: avgTime < 10 ? 'Excellent' : avgTime < 50 ? 'Good' : avgTime < 100 ? 'Acceptable' : 'Needs Optimization',
        });
      }
      
      console.log('-'.repeat(60));
    }
    
    // Show EXPLAIN for one complex query to verify index usage
    console.log('\n🔍 EXPLAIN Analysis for Complex Query:');
    console.log('='.repeat(60));
    
    const explainQuery = `
      EXPLAIN SELECT t.id, t.title, t.status, u.firstName, u.lastName
      FROM tasks t 
      JOIN users u ON t.assignedUserId = u.id
      WHERE t.farmId = 1 AND t.status IN ('pending', 'in_progress') AND u.status = 'active'
      ORDER BY t.dueDate
    `;
    
    try {
      const [explainResult] = await connection.execute(explainQuery);
      console.table(explainResult);
    } catch (error) {
      console.log(`❌ EXPLAIN failed: ${error.message}`);
    }
    
    // Check which indexes are being used
    console.log('\n📋 Current Database Indexes:');
    console.log('='.repeat(60));
    
    try {
      const [indexes] = await connection.execute(`
        SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = ? AND INDEX_NAME LIKE 'idx_%'
        ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
      `, [dbConfig.database]);
      
      console.table(indexes);
    } catch (error) {
      console.log(`❌ Index query failed: ${error.message}`);
    }
    
    // Summary
    console.log('\n📋 Performance Test Summary:');
    console.log('='.repeat(60));
    console.table(results);
    
    // Calculate performance improvement estimate
    const excellentQueries = results.filter(r => r.performance === 'Excellent').length;
    const goodQueries = results.filter(r => r.performance === 'Good').length;
    const totalQueries = results.length;
    
    const performanceScore = ((excellentQueries * 100 + goodQueries * 75) / totalQueries).toFixed(1);
    
    console.log('\n✅ Performance test completed successfully!');
    console.log('\n📊 Performance Analysis:');
    console.log('- Queries under 10ms: Excellent performance');
    console.log('- Queries 10-50ms: Good performance');
    console.log('- Queries 50-100ms: Acceptable performance');
    console.log('- Queries over 100ms: May need optimization');
    console.log(`\n🎯 Overall Performance Score: ${performanceScore}%`);
    
    if (performanceScore >= 75) {
      console.log('🎉 Target achieved! Query performance improved significantly with indexes.');
    } else {
      console.log('⚠️  Performance could be improved further with additional optimization.');
    }
    
    // Save results to file
    const reportData = {
      timestamp: new Date().toISOString(),
      performanceScore: `${performanceScore}%`,
      results: results,
      summary: {
        totalQueries: totalQueries,
        excellentQueries: excellentQueries,
        goodQueries: goodQueries,
        acceptableQueries: results.filter(r => r.performance === 'Acceptable').length,
        needsOptimization: results.filter(r => r.performance === 'Needs Optimization').length,
      },
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'performance-test-results.json'),
      JSON.stringify(reportData, null, 2),
    );
    
    console.log('\n💾 Performance test results saved to performance-test-results.json');
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the performance test
runPerformanceTest().catch(console.error);
#!/usr/bin/env node

/**
 * Performance Baseline Documentation Script
 * This script measures and documents current query performance for the Kuyash Farm Management System
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import database configuration
const config = require('../src/config');
const { AppDataSource } = require('../src/config/database');

class PerformanceBaseline {
  constructor() {
    this.results = [];
    this.testQueries = [];
    this.setupTestQueries();
  }

  /**
   * Setup test queries to measure performance
   */
  setupTestQueries() {
    this.testQueries = [
      {
        name: 'Get all farms with users',
        description: 'Fetch all farms with their associated users',
        query: `
          SELECT f.*, u.id as user_id, u.firstName, u.lastName, u.email
          FROM farms f
          LEFT JOIN farm_users fu ON f.id = fu.farmId
          LEFT JOIN users u ON fu.userId = u.id
          LIMIT 100
        `,
        typeormQuery: 'Farm.find({ relations: ["farmUsers", "farmUsers.user"] })',
        expectedRows: 'Variable',
        category: 'Farm Management',
      },
      {
        name: 'Get animals with location and assigned user',
        description: 'Fetch animals with their location and assigned user details',
        query: `
          SELECT a.*, l.name as location_name, u.firstName, u.lastName
          FROM animals a
          LEFT JOIN locations l ON a.locationId = l.id
          LEFT JOIN users u ON a.assignedUserId = u.id
          LIMIT 100
        `,
        typeormQuery: 'Animal.find({ relations: ["location", "assignedUser"] })',
        expectedRows: 'Variable',
        category: 'Livestock Management',
      },
      {
        name: 'Get user with role and department',
        description: 'Fetch users with their role and department information',
        query: `
          SELECT u.*, r.name as role_name, d.name as department_name
          FROM users u
          LEFT JOIN roles r ON u.roleId = r.id
          LEFT JOIN departments d ON u.departmentId = d.id
          LIMIT 50
        `,
        typeormQuery: 'User.find({ relations: ["role", "department"] })',
        expectedRows: 'Variable',
        category: 'User Management',
      },
      {
        name: 'Get tasks with assigned user and farm',
        description: 'Fetch tasks with assigned user and farm details',
        query: `
          SELECT t.*, u.firstName, u.lastName, f.name as farm_name
          FROM tasks t
          LEFT JOIN users u ON t.assignedUserId = u.id
          LEFT JOIN farms f ON t.farmId = f.id
          WHERE t.status = 'pending'
          LIMIT 100
        `,
        typeormQuery: 'Task.find({ where: { status: "pending" }, relations: ["assignedUser", "farm"] })',
        expectedRows: 'Variable',
        category: 'Task Management',
      },
      {
        name: 'Get inventory items with farm and category',
        description: 'Fetch inventory items with farm and category information',
        query: `
          SELECT i.*, f.name as farm_name, ic.name as category_name
          FROM inventory_items i
          LEFT JOIN farms f ON i.farmId = f.id
          LEFT JOIN inventory_categories ic ON i.categoryId = ic.id
          LIMIT 100
        `,
        typeormQuery: 'InventoryItem.find({ relations: ["farm", "category"] })',
        expectedRows: 'Variable',
        category: 'Inventory Management',
      },
      {
        name: 'Get financial transactions with farm',
        description: 'Fetch financial transactions with farm details',
        query: `
          SELECT ft.*, f.name as farm_name
          FROM financial_transactions ft
          LEFT JOIN farms f ON ft.farmId = f.id
          ORDER BY ft.createdAt DESC
          LIMIT 100
        `,
        typeormQuery: 'FinancialTransaction.find({ relations: ["farm"], order: { createdAt: "DESC" } })',
        expectedRows: 'Variable',
        category: 'Financial Management',
      },
      {
        name: 'Complex farm dashboard query',
        description: 'Complex query for farm dashboard with multiple joins',
        query: `
          SELECT 
            f.id,
            f.name,
            COUNT(DISTINCT a.id) as animal_count,
            COUNT(DISTINCT t.id) as task_count,
            COUNT(DISTINCT fu.userId) as user_count,
            AVG(a.weight) as avg_animal_weight
          FROM farms f
          LEFT JOIN animals a ON f.id = a.farmId
          LEFT JOIN tasks t ON f.id = t.farmId AND t.status = 'pending'
          LEFT JOIN farm_users fu ON f.id = fu.farmId
          GROUP BY f.id, f.name
          LIMIT 20
        `,
        typeormQuery: 'Complex QueryBuilder with multiple joins and aggregations',
        expectedRows: 'Variable',
        category: 'Dashboard',
      },
      {
        name: 'Get notifications with user details',
        description: 'Fetch notifications with user information',
        query: `
          SELECT n.*, u.firstName, u.lastName, u.email
          FROM notifications n
          LEFT JOIN users u ON n.userId = u.id
          WHERE n.isRead = false
          ORDER BY n.createdAt DESC
          LIMIT 50
        `,
        typeormQuery: 'Notification.find({ where: { isRead: false }, relations: ["user"], order: { createdAt: "DESC" } })',
        expectedRows: 'Variable',
        category: 'Notifications',
      },
    ];
  }

  /**
   * Execute a single query and measure performance
   */
  async executeQuery(testQuery) {
    console.log(`🔍 Testing: ${testQuery.name}`);
    
    const startTime = process.hrtime.bigint();
    
    try {
      // Execute the query using raw SQL for accurate timing
      const result = await AppDataSource.query(testQuery.query);
      
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      // Get query execution plan
      const explainQuery = `EXPLAIN FORMAT=JSON ${testQuery.query}`;
      const explainResult = await AppDataSource.query(explainQuery);
      
      const queryResult = {
        name: testQuery.name,
        description: testQuery.description,
        category: testQuery.category,
        executionTime: Math.round(executionTime * 100) / 100, // Round to 2 decimal places
        rowCount: result.length,
        typeormEquivalent: testQuery.typeormQuery,
        executionPlan: explainResult[0],
        timestamp: new Date().toISOString(),
        status: 'success',
      };
      
      console.log(`   ✅ Completed in ${queryResult.executionTime}ms (${queryResult.rowCount} rows)`);
      
      return queryResult;
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      
      return {
        name: testQuery.name,
        description: testQuery.description,
        category: testQuery.category,
        executionTime: null,
        rowCount: null,
        typeormEquivalent: testQuery.typeormQuery,
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'error',
      };
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    console.log('📊 Gathering database statistics...');
    
    try {
      // Get table sizes
      const tableSizeQuery = `
        SELECT 
          table_name,
          ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
          table_rows
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        ORDER BY (data_length + index_length) DESC
      `;
      
      const tableSizes = await AppDataSource.query(tableSizeQuery);
      
      // Get index information
      const indexQuery = `
        SELECT 
          table_name,
          index_name,
          column_name,
          cardinality
        FROM information_schema.statistics 
        WHERE table_schema = DATABASE()
        ORDER BY table_name, index_name
      `;
      
      const indexes = await AppDataSource.query(indexQuery);
      
      // Get database size
      const dbSizeQuery = `
        SELECT 
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS db_size_mb
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `;
      
      const dbSize = await AppDataSource.query(dbSizeQuery);
      
      return {
        databaseSize: dbSize[0].db_size_mb,
        tableSizes,
        indexes,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to gather database statistics:', error.message);
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check for missing indexes
   */
  async checkMissingIndexes() {
    console.log('🔍 Checking for missing indexes...');
    
    try {
      // Query to find tables without indexes on foreign key columns
      const missingIndexQuery = `
        SELECT 
          kcu.table_name,
          kcu.column_name,
          kcu.referenced_table_name,
          kcu.referenced_column_name
        FROM information_schema.key_column_usage kcu
        LEFT JOIN information_schema.statistics s 
          ON kcu.table_name = s.table_name 
          AND kcu.column_name = s.column_name 
          AND s.table_schema = DATABASE()
        WHERE kcu.table_schema = DATABASE()
          AND kcu.referenced_table_name IS NOT NULL
          AND s.column_name IS NULL
        ORDER BY kcu.table_name, kcu.column_name
      `;
      
      const missingIndexes = await AppDataSource.query(missingIndexQuery);
      
      return missingIndexes;
    } catch (error) {
      console.error('❌ Failed to check missing indexes:', error.message);
      return [];
    }
  }

  /**
   * Analyze slow query log if available
   */
  async analyzeSlowQueryLog() {
    console.log('📋 Checking slow query log status...');
    
    try {
      // Check if slow query log is enabled
      const slowLogStatus = await AppDataSource.query("SHOW VARIABLES LIKE 'slow_query_log'");
      const slowLogFile = await AppDataSource.query("SHOW VARIABLES LIKE 'slow_query_log_file'");
      const longQueryTime = await AppDataSource.query("SHOW VARIABLES LIKE 'long_query_time'");
      
      return {
        enabled: slowLogStatus[0]?.Value === 'ON',
        logFile: slowLogFile[0]?.Value,
        longQueryTime: parseFloat(longQueryTime[0]?.Value || '10'),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to check slow query log:', error.message);
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Analyze execution times
    const slowQueries = this.results.filter(r => r.executionTime > 100); // > 100ms
    const verySlowQueries = this.results.filter(r => r.executionTime > 500); // > 500ms
    
    if (verySlowQueries.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Performance',
        issue: `${verySlowQueries.length} queries taking over 500ms`,
        recommendation: 'Optimize these queries immediately with proper indexing and query restructuring',
        queries: verySlowQueries.map(q => q.name),
      });
    }
    
    if (slowQueries.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Performance',
        issue: `${slowQueries.length} queries taking over 100ms`,
        recommendation: 'Consider optimizing these queries with better indexing or query optimization',
        queries: slowQueries.map(q => q.name),
      });
    }
    
    // Check for large result sets
    const largeResultQueries = this.results.filter(r => r.rowCount > 1000);
    if (largeResultQueries.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Data Volume',
        issue: `${largeResultQueries.length} queries returning over 1000 rows`,
        recommendation: 'Implement pagination or result limiting for these queries',
        queries: largeResultQueries.map(q => q.name),
      });
    }
    
    return recommendations;
  }

  /**
   * Run complete performance baseline analysis
   */
  async runBaseline() {
    console.log('🚀 Starting performance baseline analysis...');
    
    try {
      // Initialize database connection
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('✅ Database connection established');
      }
      
      // Execute all test queries
      console.log('\n🔍 Executing test queries...');
      for (const testQuery of this.testQueries) {
        const result = await this.executeQuery(testQuery);
        this.results.push(result);
      }
      
      // Gather database statistics
      const dbStats = await this.getDatabaseStats();
      const missingIndexes = await this.checkMissingIndexes();
      const slowLogStatus = await this.analyzeSlowQueryLog();
      
      // Generate recommendations
      const recommendations = this.generateRecommendations();
      
      // Compile final report
      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalQueries: this.results.length,
          successfulQueries: this.results.filter(r => r.status === 'success').length,
          failedQueries: this.results.filter(r => r.status === 'error').length,
          averageExecutionTime: this.results
            .filter(r => r.executionTime)
            .reduce((sum, r) => sum + r.executionTime, 0) / this.results.filter(r => r.executionTime).length,
          slowestQuery: this.results
            .filter(r => r.executionTime)
            .sort((a, b) => b.executionTime - a.executionTime)[0],
          fastestQuery: this.results
            .filter(r => r.executionTime)
            .sort((a, b) => a.executionTime - b.executionTime)[0],
        },
        queryResults: this.results,
        databaseStatistics: dbStats,
        missingIndexes,
        slowQueryLogStatus: slowLogStatus,
        recommendations,
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          databaseType: 'MySQL',
          typeormVersion: 'Latest',
        },
      };
      
      // Save report
      const reportPath = path.join(__dirname, '../reports', `performance-baseline-${Date.now()}.json`);
      
      // Ensure reports directory exists
      const reportsDir = path.dirname(reportPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      // Display summary
      console.log('\n📊 Performance Baseline Summary:');
      console.log(`   Total queries tested: ${report.summary.totalQueries}`);
      console.log(`   Successful: ${report.summary.successfulQueries}`);
      console.log(`   Failed: ${report.summary.failedQueries}`);
      console.log(`   Average execution time: ${Math.round(report.summary.averageExecutionTime * 100) / 100}ms`);
      console.log(`   Slowest query: ${report.summary.slowestQuery?.name} (${report.summary.slowestQuery?.executionTime}ms)`);
      console.log(`   Database size: ${dbStats.databaseSize}MB`);
      console.log(`   Missing indexes: ${missingIndexes.length}`);
      
      console.log('\n💡 Key Recommendations:');
      recommendations.slice(0, 3).forEach(rec => {
        console.log(`   ${rec.priority}: ${rec.issue}`);
      });
      
      console.log(`\n📋 Full report saved to: ${reportPath}`);
      console.log('✅ Performance baseline analysis completed!');
      
      return report;
    } catch (error) {
      console.error('❌ Performance baseline analysis failed:', error.message);
      throw error;
    } finally {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const baseline = new PerformanceBaseline();
  baseline.runBaseline().catch(console.error);
}

module.exports = PerformanceBaseline;
#!/usr/bin/env node

/**
 * MySQL Performance Analysis Script for Kuyash Farm Management System
 * This script helps analyze slow queries and database performance
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class MySQLPerformanceAnalyzer {
  constructor() {
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kuyash_fms',
    };
  }

  /**
   * Enable slow query logging
   */
  async enableSlowQueryLogging() {
    console.log('🔧 Enabling MySQL slow query logging...');
    
    const queries = [
      "SET GLOBAL slow_query_log = 'ON';",
      "SET GLOBAL long_query_time = 1;",
      "SET GLOBAL log_queries_not_using_indexes = 'ON';",
      "SET GLOBAL log_slow_admin_statements = 'ON';",
    ];

    for (const query of queries) {
      try {
        await this.executeQuery(query);
        console.log(`✅ Executed: ${query}`);
      } catch (error) {
        console.error(`❌ Failed to execute: ${query}`, error.message);
      }
    }
  }

  /**
   * Check current slow query log status
   */
  async checkSlowQueryStatus() {
    console.log('📊 Checking slow query log status...');
    
    const statusQueries = [
      "SHOW VARIABLES LIKE 'slow_query_log';",
      "SHOW VARIABLES LIKE 'long_query_time';",
      "SHOW VARIABLES LIKE 'log_queries_not_using_indexes';",
      "SHOW GLOBAL STATUS LIKE 'Slow_queries';",
    ];

    for (const query of statusQueries) {
      try {
        const result = await this.executeQuery(query);
        console.log(`📈 ${query}:`, result);
      } catch (error) {
        console.error(`❌ Failed to check status: ${query}`, error.message);
      }
    }
  }

  /**
   * Analyze table sizes and row counts
   */
  async analyzeTableSizes() {
    console.log('📊 Analyzing table sizes...');
    
    const query = `
      SELECT 
        table_name,
        table_rows,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
        ROUND((data_length / 1024 / 1024), 2) AS 'Data (MB)',
        ROUND((index_length / 1024 / 1024), 2) AS 'Index (MB)'
      FROM information_schema.tables 
      WHERE table_schema = '${this.dbConfig.database}'
      ORDER BY (data_length + index_length) DESC;
    `;

    try {
      const result = await this.executeQuery(query);
      console.log('📊 Table sizes:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to analyze table sizes:', error.message);
    }
  }

  /**
   * Check for missing indexes
   */
  async checkMissingIndexes() {
    console.log('🔍 Checking for missing indexes...');
    
    const query = `
      SELECT 
        object_schema,
        object_name,
        index_name,
        count_read,
        count_write,
        count_read / (count_read + count_write) * 100 AS read_pct
      FROM performance_schema.table_io_waits_summary_by_index_usage 
      WHERE object_schema = '${this.dbConfig.database}'
        AND index_name IS NULL
        AND count_read > 0
      ORDER BY count_read DESC;
    `;

    try {
      const result = await this.executeQuery(query);
      console.log('🔍 Tables with missing indexes:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to check missing indexes:', error.message);
    }
  }

  /**
   * Analyze query performance
   */
  async analyzeQueryPerformance() {
    console.log('⚡ Analyzing query performance...');
    
    const query = `
      SELECT 
        digest_text,
        count_star,
        avg_timer_wait/1000000000 as avg_time_sec,
        max_timer_wait/1000000000 as max_time_sec,
        sum_timer_wait/1000000000 as total_time_sec
      FROM performance_schema.events_statements_summary_by_digest 
      WHERE schema_name = '${this.dbConfig.database}'
      ORDER BY avg_timer_wait DESC 
      LIMIT 10;
    `;

    try {
      const result = await this.executeQuery(query);
      console.log('⚡ Slowest queries:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to analyze query performance:', error.message);
    }
  }

  /**
   * Execute a MySQL query
   */
  async executeQuery(query) {
    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      user: this.dbConfig.username,
      password: this.dbConfig.password,
      database: this.dbConfig.database,
    });

    try {
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      await connection.end();
    }
  }

  /**
   * Generate performance report
   */
  async generateReport() {
    console.log('📋 Generating MySQL performance report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      database: this.dbConfig.database,
      analysis: {},
    };

    try {
      report.analysis.tableSizes = await this.analyzeTableSizes();
      report.analysis.missingIndexes = await this.checkMissingIndexes();
      report.analysis.slowQueries = await this.analyzeQueryPerformance();
      
      const reportPath = path.join(__dirname, '../reports', `mysql-performance-${Date.now()}.json`);
      
      // Ensure reports directory exists
      const reportsDir = path.dirname(reportPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📋 Performance report saved to: ${reportPath}`);
      
      return report;
    } catch (error) {
      console.error('❌ Failed to generate report:', error.message);
    }
  }

  /**
   * Run complete performance analysis
   */
  async runAnalysis() {
    console.log('🚀 Starting MySQL performance analysis...');
    
    try {
      await this.enableSlowQueryLogging();
      await this.checkSlowQueryStatus();
      await this.generateReport();
      
      console.log('✅ Performance analysis completed!');
      console.log('💡 Next steps:');
      console.log('   1. Monitor slow query log: tail -f /var/log/mysql/slow-query.log');
      console.log('   2. Run EXPLAIN on slow queries to understand execution plans');
      console.log('   3. Consider adding indexes for frequently queried columns');
      console.log('   4. Review N+1 query patterns in TypeORM relations');
      
    } catch (error) {
      console.error('❌ Performance analysis failed:', error.message);
    }
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new MySQLPerformanceAnalyzer();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'enable-logging':
      analyzer.enableSlowQueryLogging();
      break;
    case 'check-status':
      analyzer.checkSlowQueryStatus();
      break;
    case 'analyze-tables':
      analyzer.analyzeTableSizes();
      break;
    case 'check-indexes':
      analyzer.checkMissingIndexes();
      break;
    case 'analyze-queries':
      analyzer.analyzeQueryPerformance();
      break;
    case 'report':
      analyzer.generateReport();
      break;
    case 'full-analysis':
    default:
      analyzer.runAnalysis();
      break;
  }
}

module.exports = MySQLPerformanceAnalyzer;
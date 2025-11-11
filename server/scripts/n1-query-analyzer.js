#!/usr/bin/env node

/**
 * N+1 Query Analyzer for Kuyash Farm Management System
 * This script analyzes TypeORM queries to identify potential N+1 query problems
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class N1QueryAnalyzer {
  constructor() {
    this.servicesDir = path.join(__dirname, '../src/services');
    this.entitiesDir = path.join(__dirname, '../src/entities');
    this.controllersDir = path.join(__dirname, '../src/controllers');
    this.findings = [];
    this.entityRelations = new Map();
  }

  /**
   * Analyze entity relationships to understand the data model
   */
  analyzeEntityRelations() {
    console.log('🔍 Analyzing entity relationships...');
    
    const entityFiles = fs.readdirSync(this.entitiesDir)
      .filter(file => file.endsWith('.ts') && !file.includes('BaseEntity'));

    for (const file of entityFiles) {
      const filePath = path.join(this.entitiesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const entityName = file.replace('.ts', '');
      
      const relations = this.extractRelations(content, entityName);
      this.entityRelations.set(entityName, relations);
    }

    console.log(`📊 Found ${this.entityRelations.size} entities with relationships`);
  }

  /**
   * Extract relationship information from entity files
   */
  extractRelations(content, entityName) {
    const relations = {
      oneToMany: [],
      manyToOne: [],
      manyToMany: [],
      oneToOne: [],
    };

    // Extract @OneToMany relationships
    const oneToManyMatches = content.match(/@OneToMany\(\(\)\s*=>\s*(\w+),\s*\(\w+\)\s*=>\s*\w+\.(\w+)\)/g);
    if (oneToManyMatches) {
      oneToManyMatches.forEach(match => {
        const relationMatch = match.match(/@OneToMany\(\(\)\s*=>\s*(\w+),\s*\(\w+\)\s*=>\s*\w+\.(\w+)\)/);
        if (relationMatch) {
          relations.oneToMany.push({
            targetEntity: relationMatch[1],
            property: relationMatch[2],
          });
        }
      });
    }

    // Extract @ManyToOne relationships
    const manyToOneMatches = content.match(/@ManyToOne\(\(\)\s*=>\s*(\w+)/g);
    if (manyToOneMatches) {
      manyToOneMatches.forEach(match => {
        const relationMatch = match.match(/@ManyToOne\(\(\)\s*=>\s*(\w+)/);
        if (relationMatch) {
          relations.manyToOne.push({
            targetEntity: relationMatch[1],
          });
        }
      });
    }

    // Extract @ManyToMany relationships
    const manyToManyMatches = content.match(/@ManyToMany\(\(\)\s*=>\s*(\w+)/g);
    if (manyToManyMatches) {
      manyToManyMatches.forEach(match => {
        const relationMatch = match.match(/@ManyToMany\(\(\)\s*=>\s*(\w+)/);
        if (relationMatch) {
          relations.manyToMany.push({
            targetEntity: relationMatch[1],
          });
        }
      });
    }

    return relations;
  }

  /**
   * Analyze service files for potential N+1 query patterns
   */
  analyzeServiceFiles() {
    console.log('🔍 Analyzing service files for N+1 query patterns...');
    
    const serviceFiles = fs.readdirSync(this.servicesDir)
      .filter(file => file.endsWith('.ts'));

    for (const file of serviceFiles) {
      const filePath = path.join(this.servicesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      this.analyzeFileForN1Patterns(filePath, content, 'service');
    }
  }

  /**
   * Analyze controller files for potential N+1 query patterns
   */
  analyzeControllerFiles() {
    console.log('🔍 Analyzing controller files for N+1 query patterns...');
    
    if (!fs.existsSync(this.controllersDir)) {
      console.log('⚠️  Controllers directory not found, skipping...');
      return;
    }

    const controllerFiles = fs.readdirSync(this.controllersDir)
      .filter(file => file.endsWith('.ts'));

    for (const file of controllerFiles) {
      const filePath = path.join(this.controllersDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      this.analyzeFileForN1Patterns(filePath, content, 'controller');
    }
  }

  /**
   * Analyze a file for N+1 query patterns
   */
  analyzeFileForN1Patterns(filePath, content, fileType) {
    const fileName = path.basename(filePath);
    
    // Pattern 1: find() without relations followed by property access
    this.checkFindWithoutRelations(filePath, content, fileName, fileType);
    
    // Pattern 2: Loops with individual queries
    this.checkLoopsWithQueries(filePath, content, fileName, fileType);
    
    // Pattern 3: Missing eager loading
    this.checkMissingEagerLoading(filePath, content, fileName, fileType);
    
    // Pattern 4: Inefficient relation loading
    this.checkInefficientRelationLoading(filePath, content, fileName, fileType);
  }

  /**
   * Check for find() calls without proper relations
   */
  checkFindWithoutRelations(filePath, content, fileName, fileType) {
    // Look for repository.find() or findOne() without relations
    const findPatterns = [
      /\.find\(\s*{[^}]*}\s*\)/g,
      /\.findOne\(\s*{[^}]*}\s*\)/g,
      /\.findMany\(\s*{[^}]*}\s*\)/g,
    ];

    findPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!match.includes('relations:')) {
            this.findings.push({
              type: 'MISSING_RELATIONS',
              severity: 'HIGH',
              file: fileName,
              fileType,
              pattern: match.trim(),
              description: 'Query without relations may cause N+1 problem when accessing related entities',
              recommendation: 'Add relations array to eagerly load related entities',
            });
          }
        });
      }
    });
  }

  /**
   * Check for loops that contain database queries
   */
  checkLoopsWithQueries(filePath, content, fileName, fileType) {
    // Look for for/forEach loops containing repository calls
    const loopPatterns = [
      /for\s*\([^)]+\)\s*{[^}]*\.find[^}]*}/gs,
      /\.forEach\([^)]*{[^}]*\.find[^}]*}[^}]*\)/gs,
      /\.map\([^)]*{[^}]*\.find[^}]*}[^}]*\)/gs,
    ];

    loopPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.findings.push({
            type: 'LOOP_WITH_QUERY',
            severity: 'CRITICAL',
            file: fileName,
            fileType,
            pattern: match.substring(0, 100) + '...',
            description: 'Database query inside loop - classic N+1 query problem',
            recommendation: 'Use JOIN queries, IN clauses, or batch loading to fetch all data at once',
          });
        });
      }
    });
  }

  /**
   * Check for missing eager loading in entity definitions
   */
  checkMissingEagerLoading(filePath, content, fileName, fileType) {
    if (fileType === 'service') {
      // Look for frequent relation access patterns
      const relationAccessPatterns = [
        /\w+\.(\w+)\.(\w+)/g, // entity.relation.property
      ];

      relationAccessPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches && matches.length > 3) {
          this.findings.push({
            type: 'FREQUENT_RELATION_ACCESS',
            severity: 'MEDIUM',
            file: fileName,
            fileType,
            pattern: `${matches.length} relation access patterns found`,
            description: 'Frequent relation property access may benefit from eager loading',
            recommendation: 'Consider using eager: true in entity relations or include relations in queries',
          });
        }
      });
    }
  }

  /**
   * Check for inefficient relation loading patterns
   */
  checkInefficientRelationLoading(filePath, content, fileName, fileType) {
    // Look for multiple separate queries that could be joined
    const separateQueryPatterns = [
      /await\s+\w+Repository\.find/g,
    ];

    separateQueryPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches && matches.length > 2) {
        this.findings.push({
          type: 'MULTIPLE_SEPARATE_QUERIES',
          severity: 'MEDIUM',
          file: fileName,
          fileType,
          pattern: `${matches.length} separate repository queries`,
          description: 'Multiple separate queries in same method may be inefficient',
          recommendation: 'Consider using JOIN queries or QueryBuilder to fetch related data in single query',
        });
      }
    });
  }

  /**
   * Generate recommendations based on entity relationships
   */
  generateEntityRecommendations() {
    console.log('💡 Generating entity-specific recommendations...');
    
    for (const [entityName, relations] of this.entityRelations) {
      // Check for entities with many OneToMany relations
      if (relations.oneToMany.length > 5) {
        this.findings.push({
          type: 'COMPLEX_ENTITY',
          severity: 'MEDIUM',
          file: `${entityName}.ts`,
          fileType: 'entity',
          pattern: `${relations.oneToMany.length} OneToMany relations`,
          description: 'Entity with many relations may cause performance issues',
          recommendation: 'Consider lazy loading for less frequently accessed relations',
        });
      }

      // Check for potential circular references
      relations.oneToMany.forEach(relation => {
        const targetRelations = this.entityRelations.get(relation.targetEntity);
        if (targetRelations) {
          const hasBackReference = targetRelations.manyToOne.some(r => r.targetEntity === entityName);
          if (hasBackReference) {
            this.findings.push({
              type: 'CIRCULAR_REFERENCE',
              severity: 'LOW',
              file: `${entityName}.ts`,
              fileType: 'entity',
              pattern: `${entityName} <-> ${relation.targetEntity}`,
              description: 'Circular reference detected between entities',
              recommendation: 'Ensure proper lazy loading to avoid infinite loops',
            });
          }
        }
      });
    }
  }

  /**
   * Generate performance optimization suggestions
   */
  generateOptimizationSuggestions() {
    const suggestions = {
      indexes: [],
      queryOptimizations: [],
      caching: [],
    };

    // Analyze findings to generate specific suggestions
    const criticalFindings = this.findings.filter(f => f.severity === 'CRITICAL');
    const highFindings = this.findings.filter(f => f.severity === 'HIGH');

    if (criticalFindings.length > 0) {
      suggestions.queryOptimizations.push(
        'Implement batch loading for queries inside loops',
        'Use QueryBuilder with JOIN for complex queries',
        'Consider implementing DataLoader pattern for GraphQL-like batching',
      );
    }

    if (highFindings.length > 0) {
      suggestions.queryOptimizations.push(
        'Add relations array to repository find methods',
        'Implement eager loading for frequently accessed relations',
        'Use select() to limit fields in large queries',
      );
    }

    // Index suggestions based on entity relationships
    for (const [entityName, relations] of this.entityRelations) {
      relations.manyToOne.forEach(relation => {
        suggestions.indexes.push(
          `CREATE INDEX idx_${entityName.toLowerCase()}_${relation.targetEntity.toLowerCase()}_id ON ${entityName.toLowerCase()}s (${relation.targetEntity.toLowerCase()}Id);`,
        );
      });
    }

    return suggestions;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('📋 Generating N+1 query analysis report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFindings: this.findings.length,
        critical: this.findings.filter(f => f.severity === 'CRITICAL').length,
        high: this.findings.filter(f => f.severity === 'HIGH').length,
        medium: this.findings.filter(f => f.severity === 'MEDIUM').length,
        low: this.findings.filter(f => f.severity === 'LOW').length,
      },
      entityAnalysis: {
        totalEntities: this.entityRelations.size,
        entitiesWithManyRelations: Array.from(this.entityRelations.entries())
          .filter(([_, relations]) => relations.oneToMany.length > 3)
          .map(([name, relations]) => ({ name, relationCount: relations.oneToMany.length })),
      },
      findings: this.findings,
      optimizationSuggestions: this.generateOptimizationSuggestions(),
      recommendedIndexes: this.generateIndexRecommendations(),
    };

    const reportPath = path.join(__dirname, '../reports', `n1-query-analysis-${Date.now()}.json`);
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 N+1 query analysis report saved to: ${reportPath}`);
    
    return report;
  }

  /**
   * Generate index recommendations
   */
  generateIndexRecommendations() {
    const indexes = [];
    
    // Common patterns that need indexes
    const commonIndexes = [
      'CREATE INDEX idx_animals_farm_id ON animals (farmId);',
      'CREATE INDEX idx_animals_location_id ON animals (locationId);',
      'CREATE INDEX idx_animals_assigned_user_id ON animals (assignedUserId);',
      'CREATE INDEX idx_animals_status ON animals (status);',
      'CREATE INDEX idx_farm_users_farm_id ON farm_users (farmId);',
      'CREATE INDEX idx_farm_users_user_id ON farm_users (userId);',
      'CREATE INDEX idx_tasks_farm_id ON tasks (farmId);',
      'CREATE INDEX idx_tasks_assigned_user_id ON tasks (assignedUserId);',
      'CREATE INDEX idx_inventory_items_farm_id ON inventory_items (farmId);',
      'CREATE INDEX idx_financial_transactions_farm_id ON financial_transactions (farmId);',
      'CREATE INDEX idx_notifications_user_id ON notifications (userId);',
      'CREATE INDEX idx_users_email ON users (email);',
      'CREATE INDEX idx_users_role_id ON users (roleId);',
    ];

    indexes.push(...commonIndexes);
    
    return indexes;
  }

  /**
   * Run complete N+1 query analysis
   */
  async runAnalysis() {
    console.log('🚀 Starting N+1 query analysis...');
    
    try {
      this.analyzeEntityRelations();
      this.analyzeServiceFiles();
      this.analyzeControllerFiles();
      this.generateEntityRecommendations();
      
      const report = this.generateReport();
      
      console.log('\n📊 Analysis Summary:');
      console.log(`   Total findings: ${report.summary.totalFindings}`);
      console.log(`   Critical: ${report.summary.critical}`);
      console.log(`   High: ${report.summary.high}`);
      console.log(`   Medium: ${report.summary.medium}`);
      console.log(`   Low: ${report.summary.low}`);
      
      console.log('\n💡 Top Recommendations:');
      if (report.summary.critical > 0) {
        console.log('   🚨 Fix critical N+1 queries in loops immediately');
      }
      if (report.summary.high > 0) {
        console.log('   ⚠️  Add relations to repository queries');
      }
      console.log('   📈 Implement recommended database indexes');
      console.log('   🔄 Consider implementing query result caching');
      
      console.log('\n✅ N+1 query analysis completed!');
      
      return report;
    } catch (error) {
      console.error('❌ N+1 query analysis failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new N1QueryAnalyzer();
  analyzer.runAnalysis().catch(console.error);
}

module.exports = N1QueryAnalyzer;
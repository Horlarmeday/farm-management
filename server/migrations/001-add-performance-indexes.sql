-- Database Performance Optimization - Index Creation
-- Phase 4: Week 7.1 Index Optimization
-- Target: 50% query performance improvement for critical operations
-- MySQL Database Indexes

-- =====================================================
-- COMPOSITE INDEXES FOR FREQUENTLY QUERIED COLUMNS
-- =====================================================

-- Users table indexes
-- Index for role-based user queries
CREATE INDEX idx_users_role_status ON users(roleId, status);

-- Index for department-based queries
CREATE INDEX idx_users_department_active ON users(departmentId, isActive);

-- Animals table composite indexes
-- Primary livestock tracking index (farm + assigned user)
CREATE INDEX idx_animals_farm_assigned_user ON animals(farmId, assignedUserId, status);

-- Livestock status and species filtering
CREATE INDEX idx_animals_farm_status_species ON animals(farmId, status, species);

-- Location-based animal queries
CREATE INDEX idx_animals_location_status ON animals(locationId, status);

-- Tasks table composite indexes
-- Task assignment and status tracking
CREATE INDEX idx_tasks_farm_assigned_status ON tasks(farmId, assignedUserId, status);

-- Task due date and priority management
CREATE INDEX idx_tasks_farm_due_priority ON tasks(farmId, dueDate, priority);

-- Task creation and completion tracking
CREATE INDEX idx_tasks_created_date_status ON tasks(createdById, createdAt, status);

-- Financial transactions composite indexes
-- Farm-based financial reporting
CREATE INDEX idx_financial_farm_date_type ON financial_transactions(farmId, transactionDate, type);

-- User-based transaction history
CREATE INDEX idx_financial_user_date_status ON financial_transactions(userId, transactionDate, status);

-- Category-based financial analysis
CREATE INDEX idx_financial_category_date_amount ON financial_transactions(categoryId, transactionDate, amount);

-- =====================================================
-- LIVESTOCK TRACKING OPTIMIZATION INDEXES
-- =====================================================

-- Animal acquisition and lifecycle tracking
CREATE INDEX idx_animals_farm_acquisition_date ON animals(farmId, acquisitionDate, status);

-- Breeding and reproduction tracking
CREATE INDEX idx_animals_farm_birth_gender ON animals(farmId, dateOfBirth, gender);

-- Weight and health monitoring
CREATE INDEX idx_animals_farm_weight_date ON animals(farmId, weight, createdAt);

-- Animal health records optimization
CREATE INDEX idx_animal_health_animal_date ON animal_health_records(animalId, date);

-- Animal production logs optimization
CREATE INDEX idx_animal_production_animal_date ON animal_production_logs(animalId, date);

-- =====================================================
-- INVENTORY SEARCH AND MANAGEMENT INDEXES
-- =====================================================

-- Inventory item search optimization
-- Name-based search with farm filtering
CREATE INDEX idx_inventory_farm_name_category ON inventory_items(farmId, name, category, isActive);

-- Stock level monitoring and alerts
CREATE INDEX idx_inventory_farm_stock_levels ON inventory_items(farmId, currentStock, minimumStock, isActive);

-- Category-based inventory management
CREATE INDEX idx_inventory_farm_category_stock ON inventory_items(farmId, category, currentStock, isActive);

-- SKU-based inventory lookup
CREATE INDEX idx_inventory_sku_farm ON inventory_items(sku, farmId, isActive);

-- Expiry date monitoring for perishable items
CREATE INDEX idx_inventory_farm_expiry ON inventory_items(farmId, expiryDate, isActive);

-- Inventory transaction optimization
CREATE INDEX idx_inventory_transactions_item_date ON inventory_transactions(itemId, transactionDate);

-- =====================================================
-- OPTIMIZED INDEXES FOR ACTIVE RECORDS
-- =====================================================

-- Active users index for authentication and authorization
CREATE INDEX idx_users_active_email ON users(email, isActive, status);

-- Active animals for daily operations
CREATE INDEX idx_animals_active_farm_tag ON animals(farmId, tagNumber, status);

-- Active tasks for task management
CREATE INDEX idx_tasks_active_farm_due ON tasks(farmId, dueDate, status);

-- Active inventory items for stock management
CREATE INDEX idx_inventory_active_farm_reorder ON inventory_items(farmId, reorderPoint, isActive, currentStock);

-- Active farms for multi-tenant operations
CREATE INDEX idx_farms_active_owner ON farms(ownerId, isActive);

-- =====================================================
-- SPECIALIZED PERFORMANCE INDEXES
-- =====================================================

-- Dashboard statistics optimization
-- Farm overview statistics
CREATE INDEX idx_dashboard_farm_stats ON animals(farmId, status, species, createdAt);

-- Financial dashboard optimization
CREATE INDEX idx_dashboard_financial_stats ON financial_transactions(farmId, type, transactionDate, amount);

-- Task completion tracking
CREATE INDEX idx_dashboard_task_completion ON tasks(farmId, status, completedAt);

-- Notification system optimization
CREATE INDEX idx_notifications_user_unread ON notifications(userId, isRead, createdAt);

-- =====================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

-- Animal listing with basic info
CREATE INDEX idx_animals_listing_cover ON animals(farmId, status, tagNumber, species, breed, assignedUserId, createdAt);

-- Inventory listing with stock info
CREATE INDEX idx_inventory_listing_cover ON inventory_items(farmId, isActive, name, category, currentStock, minimumStock, unit);

-- Task listing with assignment info
CREATE INDEX idx_tasks_listing_cover ON tasks(farmId, status, title, priority, dueDate, assignedUserId, createdAt);

-- =====================================================
-- INDEX MAINTENANCE AND MONITORING
-- =====================================================

-- Note: These indexes are designed to optimize the following query patterns:
-- 1. Farm-scoped queries (multi-tenant architecture)
-- 2. User assignment and role-based access
-- 3. Status-based filtering for active records
-- 4. Date range queries for reporting
-- 5. Search functionality for inventory and livestock
-- 6. Dashboard statistics and aggregations

-- Performance monitoring queries for MySQL:
-- SHOW INDEX FROM table_name;
-- SELECT * FROM information_schema.statistics WHERE table_schema = 'your_database_name';

-- Index usage analysis:
-- SELECT object_schema, object_name, index_name, count_read, count_fetch
-- FROM performance_schema.table_io_waits_summary_by_index_usage 
-- WHERE object_schema = 'your_database_name' ORDER BY count_read DESC;

-- Query performance analysis:
-- SELECT * FROM performance_schema.events_statements_summary_by_digest 
-- ORDER BY avg_timer_wait DESC LIMIT 10;
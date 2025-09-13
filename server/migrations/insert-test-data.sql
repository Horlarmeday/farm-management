-- Insert test data for API testing
-- This migration creates test users and farms for API testing purposes

-- Insert test role (if not exists)
INSERT IGNORE INTO roles (id, name, description, permissions, createdAt, updatedAt) 
VALUES (1, 'Admin', 'Administrator role for testing', '[]', NOW(), NOW());

-- Insert test user
INSERT IGNORE INTO users (
  id, 
  firstName, 
  lastName, 
  email, 
  password, 
  phone, 
  roleId, 
  isActive, 
  createdAt, 
  updatedAt
) VALUES (
  1, 
  'Test', 
  'User', 
  'test@example.com', 
  '$2b$10$rQZ9QmjqjKjKjKjKjKjKjOeH8H8H8H8H8H8H8H8H8H8H8H8H8H8H8', -- password: 'password123'
  '+1234567890', 
  1, 
  1, 
  NOW(), 
  NOW()
);

-- Insert test farm
INSERT IGNORE INTO farms (
  id, 
  name, 
  description, 
  location, 
  size, 
  ownerId, 
  isActive, 
  createdAt, 
  updatedAt
) VALUES (
  1, 
  'Test Farm', 
  'Test farm for API testing', 
  'Test Location', 
  100.0, 
  1, 
  1, 
  NOW(), 
  NOW()
);

-- Insert test financial category
INSERT IGNORE INTO financial_categories (
  id, 
  name, 
  type, 
  description, 
  farmId, 
  isActive, 
  createdAt, 
  updatedAt
) VALUES (
  1, 
  'Feed & Supplies', 
  'EXPENSE', 
  'Animal feed and farm supplies', 
  1, 
  1, 
  NOW(), 
  NOW()
import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Global setup for E2E tests
 * - Sets up test database
 * - Creates test users and farms
 * - Prepares authentication state
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...');

  try {
    // Wait for servers to be ready
    console.log('⏳ Waiting for servers to be ready...');
    await waitForServer('http://localhost:5001/api/health', 60000);
    await waitForServer('http://localhost:5173', 60000);

    // Setup test database
    console.log('🗄️ Setting up test database...');
    await setupTestDatabase();

    // Create test users and authenticate
    console.log('👤 Creating test users and authentication...');
    await createTestUsersAndAuth();

    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

/**
 * Wait for server to be ready
 */
async function waitForServer(url: string, timeout: number): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        console.log(`✅ Server ready at ${url}`);
        return;
      }
    } catch (error) {
      // Server not ready yet, continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error(`Server at ${url} not ready after ${timeout}ms`);
}

/**
 * Setup test database with clean state
 */
async function setupTestDatabase(): Promise<void> {
  try {
    const serverPath = path.join(process.cwd(), 'server');
    
    // Skip migrations in test environment since DB_SYNCHRONIZE=true
    // TypeORM will automatically create tables from entities
    console.log('ℹ️ Skipping migrations in test environment (DB_SYNCHRONIZE=true)');
    
    // Clear existing test data
    try {
      execSync('yarn db:reset', { cwd: serverPath, stdio: 'inherit' });
    } catch (resetError) {
      console.log('⚠️ Database reset warning (may be expected):', resetError);
    }
    
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.log('⚠️ Database setup warning (may be expected):', error);
  }
}

/**
 * Create test users and prepare authentication states
 */
async function createTestUsersAndAuth(): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Create test users via API
    const testUsers = [
      {
        email: 'admin@test.com',
        password: 'TestPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      },
      {
        email: 'manager@test.com',
        password: 'TestPassword123!',
        firstName: 'Manager',
        lastName: 'User',
        role: 'manager'
      },
      {
        email: 'worker@test.com',
        password: 'TestPassword123!',
        firstName: 'Worker',
        lastName: 'User',
        role: 'worker'
      }
    ];

    // Create users and save authentication states
    for (const user of testUsers) {
      await createUserAndSaveAuth(page, user);
    }

    console.log('✅ Test users created and authentication states saved');
  } catch (error) {
    console.error('❌ Failed to create test users:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Create a user and save authentication state
 */
async function createUserAndSaveAuth(page: any, user: any): Promise<void> {
  try {
    // Register user
    await page.goto('http://localhost:5173/register');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.fill('[data-testid="firstName-input"]', user.firstName);
    await page.fill('[data-testid="lastName-input"]', user.lastName);
    await page.click('[data-testid="register-button"]');
    
    // Navigate to dashboard - will redirect to farm selection if no farm selected
    await page.goto('http://localhost:5173/dashboard');
    
    // Check if redirected to farm selection
    const currentUrl = page.url();
    if (currentUrl.includes('/select-farm')) {
      // Wait for farm cards to load and select the first available farm
      await page.waitForSelector('[data-testid^="farm-card-"]', { timeout: 10000 });
      const firstFarmCard = page.locator('[data-testid^="farm-card-"]').first();
      await firstFarmCard.click();
      
      // Wait for navigation to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    } else {
      // Already on dashboard, just wait for it to load
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }
    
    // Save authentication state
    const authFile = `tests/e2e/auth/${user.role}-auth.json`;
    await page.context().storageState({ path: authFile });
    
    console.log(`✅ Created ${user.role} user and saved auth state`);
  } catch (error) {
    console.log(`⚠️ User ${user.email} may already exist, attempting login...`);
    
    // Try to login instead
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');
    
    try {
      // Navigate to dashboard - will redirect to farm selection if no farm selected
      await page.goto('http://localhost:5173/dashboard');
      
      // Check if redirected to farm selection
      const currentUrl = page.url();
      if (currentUrl.includes('/select-farm')) {
        // Wait for farm cards to load and select the first available farm
        await page.waitForSelector('[data-testid^="farm-card-"]', { timeout: 10000 });
        const firstFarmCard = page.locator('[data-testid^="farm-card-"]').first();
        await firstFarmCard.click();
        
        // Wait for navigation to dashboard
        await page.waitForURL('**/dashboard', { timeout: 10000 });
      } else {
        // Already on dashboard, just wait for it to load
        await page.waitForURL('**/dashboard', { timeout: 10000 });
      }
      
      const authFile = `tests/e2e/auth/${user.role}-auth.json`;
      await page.context().storageState({ path: authFile });
      console.log(`✅ Logged in ${user.role} user and saved auth state`);
    } catch (loginError) {
      console.error(`❌ Failed to login user ${user.email}:`, loginError);
    }
  }
}

export default globalSetup;
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuration
const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// Generate a test JWT token
function generateTestToken() {
  const payload = {
    userId: '1',
    farmId: 'test-farm-for-user-1',
    email: 'test@example.com'
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// Helper function to make authenticated requests
function createAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Test functions
async function testGetCategories(token) {
  console.log('=== Testing GET /api/finance/categories ===');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/finance/categories`,
      { headers: createAuthHeaders(token) }
    );
    
    console.log('✅ Get Categories - Status:', response.status);
    console.log('✅ Found', response.data.data?.length || 0, 'categories');
    return response.data;
  } catch (error) {
    console.log('❌ Get Categories Failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateTransaction(token, categoryId) {
  console.log('\n=== Testing POST /api/finance/transactions ===');
  
  const testTransaction = {
    type: 'EXPENSE',
    amount: 150.50,
    description: 'Feed purchase for cattle - Test',
    categoryId: categoryId,
    date: new Date().toISOString()
  };
  
  console.log('📝 Transaction data:', JSON.stringify(testTransaction, null, 2));
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/finance/transactions`,
      testTransaction,
      { headers: createAuthHeaders(token) }
    );
    
    console.log('✅ Create Transaction - Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.id) {
      return response.data.id;
    }
    return response.data;
  } catch (error) {
    console.log('❌ Create Transaction Failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetTransactions(token) {
  console.log('\n=== Testing GET /api/finance/transactions ===');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/finance/transactions`,
      { headers: createAuthHeaders(token) }
    );
    
    console.log('✅ Get Transactions - Status:', response.status);
    console.log('✅ Found', response.data.data?.length || 0, 'transactions');
    return response.data;
  } catch (error) {
    console.log('❌ Get Transactions Failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log('✅ Server is running and healthy');
    return true;
  } catch (error) {
    console.log('❌ Server health check failed:');
    console.log('Make sure the server is running on', BASE_URL);
    console.log('Error:', error.message);
    return false;
  }
}

// Main test runner
async function runMainTests() {
  console.log('🚀 Starting Main Transaction API Tests');
  console.log('='.repeat(50));
  
  // Generate test token
  const token = generateTestToken();
  console.log('🔑 Generated test JWT token\n');
  
  let testsPassed = 0;
  let totalTests = 3;
  
  // Test 1: Get Categories
  const categoriesResult = await testGetCategories(token);
  if (categoriesResult) {
    testsPassed++;
    
    // Find a valid expense category
    let categoryId = null;
    if (categoriesResult.data && categoriesResult.data.length > 0) {
      const expenseCategory = categoriesResult.data.find(cat => cat.type === 'expense');
      if (expenseCategory) {
        categoryId = expenseCategory.id;
        console.log(`🔧 Using category: ${expenseCategory.name} (${categoryId})`);
      }
    }
    
    if (categoryId) {
      // Test 2: Create Transaction
      const createResult = await testCreateTransaction(token, categoryId);
      if (createResult) {
        testsPassed++;
      }
      
      // Test 3: Get All Transactions
      const getResult = await testGetTransactions(token);
      if (getResult) {
        testsPassed++;
      }
    } else {
      console.log('❌ No valid expense category found for testing');
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 MAIN FUNCTIONALITY TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`❌ Tests Failed: ${totalTests - testsPassed}/${totalTests}`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 ALL MAIN TESTS PASSED! Core transaction functionality is working.');
    return true;
  } else {
    console.log('⚠️  Some main tests failed. Core functionality needs attention.');
    return false;
  }
}

// Run the tests
async function main() {
  console.log('🔍 Checking server health...');
  const serverHealthy = await checkServerHealth();
  
  if (!serverHealthy) {
    console.log('\n❌ Cannot run tests - server is not accessible');
    process.exit(1);
  }
  
  const allTestsPassed = await runMainTests();
  
  if (allTestsPassed) {
    console.log('\n✅ Main Transaction API functionality is working!');
    process.exit(0);
  } else {
    console.log('\n❌ Main functionality needs attention.');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main();
}

module.exports = {
  runMainTests,
  testCreateTransaction,
  testGetTransactions,
  testGetCategories
};
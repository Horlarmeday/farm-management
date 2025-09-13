const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuration
const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production'; // Should match your server's JWT secret

// Generate a test JWT token
function generateTestToken() {
  const payload = {
    userId: '1',
    farmId: 'test-farm-for-user-1',
    email: 'test@example.com'
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// Test data - will be updated with valid category ID
let testTransaction = {
  type: 'EXPENSE',
  amount: 150.50,
  description: 'Feed purchase for cattle',
  categoryId: null, // Will be set dynamically
  subcategoryId: null,
  date: new Date().toISOString()
};

// Function to ensure category exists
async function ensureCategoryExists() {
  try {
    console.log('🔧 Checking if categories exist...');
    const response = await fetch(`${BASE_URL}/api/finance/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 404 || response.status === 500) {
      console.log('📝 Creating default category...');
      const createCategoryResponse = await fetch(`${BASE_URL}/api/finance/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Feed & Supplies',
          type: 'EXPENSE',
          description: 'Animal feed and farm supplies'
        })
      });
      
      if (createCategoryResponse.ok) {
        const category = await createCategoryResponse.json();
        console.log('✅ Created category:', category);
        return category.id;
      } else {
        console.log('❌ Failed to create category:', await createCategoryResponse.text());
        return 1; // fallback to ID 1
      }
    } else if (response.ok) {
      const categories = await response.json();
      console.log('✅ Found existing categories:', categories.length);
      return categories.length > 0 ? categories[0].id : 1;
    }
    
    return 1; // fallback
  } catch (error) {
    console.log('⚠️ Category check failed:', error.message);
    return 1; // fallback
  }
}

const updatedTransaction = {
  type: 'EXPENSE',
  amount: 175.75,
  description: 'Updated feed purchase for cattle',
  categoryId: 1,
  subcategoryId: 1,
  date: new Date().toISOString()
};

// Helper function to make authenticated requests
function createAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Test functions
async function testCreateTransaction(token) {
  console.log('\n=== Testing POST /api/finance/transactions ===');
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
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log('❌ Get Transactions Failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetTransactionById(token, transactionId) {
  console.log(`\n=== Testing GET /api/finance/transactions/${transactionId} ===`);
  try {
    const response = await axios.get(
      `${BASE_URL}/api/finance/transactions/${transactionId}`,
      { headers: createAuthHeaders(token) }
    );
    
    console.log('✅ Get Transaction By ID - Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log('❌ Get Transaction By ID Failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testUpdateTransaction(token, transactionId) {
  console.log(`\n=== Testing PUT /api/finance/transactions/${transactionId} ===`);
  try {
    const response = await axios.put(
      `${BASE_URL}/api/finance/transactions/${transactionId}`,
      updatedTransaction,
      { headers: createAuthHeaders(token) }
    );
    
    console.log('✅ Update Transaction - Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log('❌ Update Transaction Failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetCategories(token) {
  console.log('\n=== Testing GET /api/finance/categories ===');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/finance/categories`,
      { headers: createAuthHeaders(token) }
    );
    
    console.log('✅ Get Categories - Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log('❌ Get Categories Failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

// Test error handling
async function testErrorHandling(token) {
  console.log('\n=== Testing Error Handling ===');
  let errorTestsPassed = 0;
  let totalErrorTests = 3;
  
  // Test invalid transaction data
  console.log('\n--- Testing invalid transaction data ---');
  try {
    const invalidTransaction = {
      type: 'INVALID_TYPE',
      amount: 'not_a_number',
      description: '',
      categoryId: 'invalid_id'
    };
    
    const response = await axios.post(
      `${BASE_URL}/api/finance/transactions`,
      invalidTransaction,
      { headers: createAuthHeaders(token) }
    );
    
    console.log('❌ Should have failed but got:', response.status);
  } catch (error) {
    if (error.response?.status >= 400) {
      console.log('✅ Correctly rejected invalid data - Status:', error.response?.status);
      console.log('✅ Error message:', error.response?.data);
      errorTestsPassed++;
    }
  }
  
  // Test unauthorized access
  console.log('\n--- Testing unauthorized access ---');
  try {
    const response = await axios.get(`${BASE_URL}/api/finance/transactions`);
    console.log('❌ Should have failed but got:', response.status);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected unauthorized access - Status:', error.response?.status);
      console.log('✅ Error message:', error.response?.data);
      errorTestsPassed++;
    }
  }
  
  // Test non-existent transaction
  console.log('\n--- Testing non-existent transaction ---');
  try {
    const response = await axios.get(
      `${BASE_URL}/api/finance/transactions/99999`,
      { headers: createAuthHeaders(token) }
    );
    console.log('❌ Should have failed but got:', response.status);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Correctly handled non-existent transaction - Status:', error.response?.status);
      console.log('✅ Error message:', error.response?.data);
      errorTestsPassed++;
    }
  }
  
  return errorTestsPassed === totalErrorTests;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Transaction API Tests');
  console.log('='.repeat(50));
  
  // Generate test token
  const token = generateTestToken();
  console.log('🔑 Generated test JWT token');
  
  
  
  let transactionId = null;
  let testsPassed = 0;
  let totalTests = 0;
  
  // Test 1: Get Categories (first to ensure they exist)
  totalTests++;
  const categoriesResult = await testGetCategories(token);
  if (categoriesResult) {
    testsPassed++;
    // Set valid category ID for transaction tests
    if (categoriesResult.data && categoriesResult.data.length > 0) {
      const expenseCategory = categoriesResult.data.find(cat => cat.type === 'expense');
      if (expenseCategory) {
        testTransaction.categoryId = expenseCategory.id;
        console.log(`🔧 Using category ID: ${expenseCategory.id} (${expenseCategory.name})`);
      }
    }
  }

  // Test 2: Create Transaction
  totalTests++;
  const createResult = await testCreateTransaction(token);
  if (createResult) {
    testsPassed++;
    transactionId = createResult.id || createResult;
  }

  // Test 3: Get All Transactions
  totalTests++;
  const getResult = await testGetTransactions(token);
  if (getResult) testsPassed++;

  // Test 4: Get Transaction by ID (if we have an ID)
  if (transactionId) {
    totalTests++;
    const getByIdResult = await testGetTransactionById(token, transactionId);
    if (getByIdResult) testsPassed++;
    
    // Test 5: Update Transaction
    totalTests++;
    const updateResult = await testUpdateTransaction(token, transactionId);
    if (updateResult) testsPassed++;
  }

  // Test 6: Error Handling (run last to avoid interference)
  totalTests++;
  const errorHandlingPassed = await testErrorHandling(token);
  if (errorHandlingPassed) testsPassed++;
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`❌ Tests Failed: ${totalTests - testsPassed}/${totalTests}`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Transaction API is working correctly.');
    return true;
  } else {
    console.log('⚠️  Some tests failed. Please check the API implementation.');
    return false;
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

// Run the tests
async function main() {
  console.log('🔍 Checking server health...');
  const serverHealthy = await checkServerHealth();
  
  if (!serverHealthy) {
    console.log('\n❌ Cannot run tests - server is not accessible');
    process.exit(1);
  }
  
  const allTestsPassed = await runAllTests();
  
  if (allTestsPassed) {
    console.log('\n✅ Transaction Recording API is fully functional!');
    process.exit(0);
  } else {
    console.log('\n❌ Some API endpoints need attention.');
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
  runAllTests,
  testCreateTransaction,
  testGetTransactions,
  testGetTransactionById,
  testUpdateTransaction,
  testGetCategories,
  testErrorHandling
};
const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// Test transaction data
const testTransaction = {
  type: 'EXPENSE',
  amount: 150.50,
  description: 'Feed purchase for cattle',
  categoryId: 1,
  subcategoryId: 1,
  date: new Date().toISOString()
};

// Generate JWT token for testing
function generateTestToken() {
  const payload = {
    userId: '1',
    email: 'test@example.com',
    farmId: 'test-farm-for-user-1'
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// Helper function to create auth headers
function createAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Test main transaction creation
async function testMainTransaction() {
  console.log('🚀 Testing Main Transaction Creation');
  console.log('==================================================');
  
  const token = generateTestToken();
  console.log('🔑 Generated test JWT token');
  
  try {
    console.log('\n=== Testing POST /api/finance/transactions ===');
    console.log('📤 Sending transaction data:', JSON.stringify(testTransaction, null, 2));
    
    const response = await axios.post(
      `${BASE_URL}/api/finance/transactions`,
      testTransaction,
      { headers: createAuthHeaders(token) }
    );
    
    console.log('✅ Create Transaction - Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 201) {
      console.log('\n🎉 MAIN TRANSACTION TEST PASSED!');
      return true;
    } else {
      console.log('\n❌ MAIN TRANSACTION TEST FAILED - Unexpected status:', response.status);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Main Transaction Test Failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    console.log('Full error:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Check server health
    console.log('🔍 Checking server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running and healthy');
    
    // Run main test
    const success = await testMainTransaction();
    
    if (success) {
      console.log('\n🎉 ALL TESTS PASSED!');
      process.exit(0);
    } else {
      console.log('\n❌ TESTS FAILED!');
      process.exit(1);
    }
    
  } catch (error) {
    console.log('❌ Server is not running or health check failed:', error.message);
    console.log('Please make sure the server is running on http://localhost:5000');
    process.exit(1);
  }
}

main();
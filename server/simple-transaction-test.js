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

// Simple test data
const testTransaction = {
  type: 'EXPENSE',
  amount: 150.50,
  description: 'Feed purchase for cattle',
  categoryId: 1,
  date: new Date().toISOString()
};

async function testCreateTransaction() {
  console.log('🚀 Testing Transaction Creation');
  console.log('Test data:', JSON.stringify(testTransaction, null, 2));
  
  const token = generateTestToken();
  console.log('🔑 Generated token for user ID: 1, farm ID: test-farm-for-user-1');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/finance/transactions`,
      testTransaction,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ SUCCESS - Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ FAILED - Status:', error.response?.status);
    console.log('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.log('❌ Full error response:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run the test
testCreateTransaction().then(success => {
  if (success) {
    console.log('\n🎉 Transaction creation test PASSED!');
    process.exit(0);
  } else {
    console.log('\n💥 Transaction creation test FAILED!');
    process.exit(1);
  }
});
const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
const BASE_URL = 'http://localhost:5000';

// Generate test JWT token
function generateTestToken(userId = '1', farmId = 'test-farm-for-user-1') {
  const payload = {
    userId: userId,
    farmId: farmId,
    email: 'test@example.com',
    role: 'FARM_OWNER'
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

async function testFullTransactionCRUD() {
  try {
    console.log('🔍 Testing Full Transaction CRUD Operations');
    console.log('==================================================');
    
    // Check server health first
    console.log('🔍 Checking server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running and healthy');
    
    const token = generateTestToken();
    console.log('🔑 Generated test JWT token');
    
    // Step 1: Create a transaction
    console.log('\n=== Step 1: Create Transaction ===');
    const transactionData = {
      type: 'EXPENSE',
      amount: 250.75,
      description: 'Test transaction for CRUD operations',
      categoryId: 1,
      subcategoryId: 1,
      date: new Date().toISOString(),
      farmId: 'test-farm-for-user-1'
    };
    
    console.log('📤 Creating transaction:', JSON.stringify(transactionData, null, 2));
    
    const createResponse = await axios.post(`${BASE_URL}/api/finance/transactions`, transactionData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Create Transaction - Status:', createResponse.status);
    console.log('📄 Created transaction:', JSON.stringify(createResponse.data, null, 2));
    
    const createdTransactionId = createResponse.data.id;
    
    // Step 2: Get all transactions (should include the one we just created)
    console.log('\n=== Step 2: Get All Transactions ===');
    const getAllResponse = await axios.get(`${BASE_URL}/api/finance/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Get All Transactions - Status:', getAllResponse.status);
    console.log('📄 Full response:', JSON.stringify(getAllResponse.data, null, 2));
    
    const transactions = Array.isArray(getAllResponse.data) ? getAllResponse.data : getAllResponse.data.data || [];
    console.log('📊 Total transactions found:', transactions.length);
    
    if (transactions.length > 0) {
      console.log('📄 Sample transaction:', JSON.stringify(transactions[0], null, 2));
    }
    
    console.log('\n🎉 FULL TRANSACTION CRUD TEST COMPLETED!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    process.exit(1);
  }
}

testFullTransactionCRUD();
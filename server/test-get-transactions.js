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

async function testGetTransactions() {
  try {
    console.log('🔍 Testing GET /api/finance/transactions');
    console.log('==================================================');
    
    // Check server health first
    console.log('🔍 Checking server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running and healthy');
    
    const token = generateTestToken();
    console.log('🔑 Generated test JWT token');
    
    // Test 1: Get all transactions for farm
    console.log('\n=== Test 1: Get All Transactions ===');
    const allTransactionsResponse = await axios.get(`${BASE_URL}/api/finance/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Get All Transactions - Status:', allTransactionsResponse.status);
    console.log('📄 Full response:', JSON.stringify(allTransactionsResponse.data, null, 2));
    
    const transactions = Array.isArray(allTransactionsResponse.data) ? allTransactionsResponse.data : allTransactionsResponse.data.transactions || [];
    console.log('📊 Total transactions found:', transactions.length);
    
    if (transactions.length > 0) {
      console.log('📄 Sample transaction:', JSON.stringify(transactions[0], null, 2));
    }
    
    // Test 2: Filter by type
    console.log('\n=== Test 2: Filter by Type (EXPENSE) ===');
    const expenseTransactionsResponse = await axios.get(`${BASE_URL}/api/finance/transactions?type=EXPENSE`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Get Expense Transactions - Status:', expenseTransactionsResponse.status);
    const expenseTransactions = Array.isArray(expenseTransactionsResponse.data) ? expenseTransactionsResponse.data : expenseTransactionsResponse.data.data || [];
    console.log('📊 Expense transactions found:', expenseTransactions.length);
    
    // Test 3: Filter by date range
    console.log('\n=== Test 3: Filter by Date Range ===');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateFilterResponse = await axios.get(`${BASE_URL}/api/finance/transactions?dateFrom=${yesterday.toISOString()}&dateTo=${today.toISOString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Get Transactions by Date - Status:', dateFilterResponse.status);
    const dateTransactions = Array.isArray(dateFilterResponse.data) ? dateFilterResponse.data : dateFilterResponse.data.data || [];
    console.log('📊 Transactions in date range:', dateTransactions.length);
    
    // Test 4: Pagination
    console.log('\n=== Test 4: Pagination ===');
    const paginatedResponse = await axios.get(`${BASE_URL}/api/finance/transactions?limit=2&page=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Get Paginated Transactions - Status:', paginatedResponse.status);
    const paginatedTransactions = Array.isArray(paginatedResponse.data) ? paginatedResponse.data : paginatedResponse.data.data || [];
    console.log('📊 Paginated transactions (limit 2):', paginatedTransactions.length);
    console.log('📄 Pagination info:', JSON.stringify(paginatedResponse.data.pagination, null, 2));
    
    console.log('\n🎉 ALL GET TRANSACTION TESTS PASSED!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    process.exit(1);
  }
}

testGetTransactions();
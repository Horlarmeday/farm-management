const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const BASE_URL = 'http://localhost:5000/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJmYXJtSWQiOiJ0ZXN0LWZhcm0taWQiLCJmYXJtUm9sZSI6Ik9XTkVSIiwiaWF0IjoxNzU3NDg1OTgyLCJleHAiOjE3NTc1NzIzODJ9.OgPXrhgtvAxk8sVjTDmcV8Mz7nYzENcQAbaklyWLgvs';

// Test data
const testTransaction = {
  farm_id: 'test-farm-id',
  type: 'expense',
  amount: 150.50,
  description: 'Feed purchase for cattle',
  category_id: 'feed-category-id',
  subcategory: 'cattle-feed-subcategory',
  transaction_date: new Date().toISOString(),
  payment_method: 'cash',
  reference_number: 'REF-001',
  notes: 'Monthly feed purchase',
  user_id: 'test-user-id'
};

const FARM_ID = 'test-farm-id';

const testTransactionUpdate = {
  amount: 175.75,
  description: 'Updated feed purchase for cattle',
  subcategory: 'Premium Animal Feed'
};

// Helper function to make requests with curl
async function makeRequest(method, url, data = null) {
  try {
    let curlCommand = `curl -s -w "\nHTTP_STATUS:%{http_code}" -X ${method} "${BASE_URL}${url}" -H "Content-Type: application/json" -H "Authorization: Bearer ${JWT_TOKEN}"`;
    
    if (data) {
      curlCommand += ` -d '${JSON.stringify(data)}'`;
    }
    
    const { stdout, stderr } = await execAsync(curlCommand);
    
    if (stderr) {
      return { success: false, error: stderr, status: 0 };
    }
    
    const parts = stdout.split('\nHTTP_STATUS:');
    const responseBody = parts[0];
    const status = parseInt(parts[1] || '0');
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseBody);
    } catch (e) {
      parsedData = responseBody;
    }
    
    return { 
      success: status >= 200 && status < 300, 
      data: parsedData, 
      status 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      status: 0 
    };
  }
}

// Test functions
async function testCreateTransaction() {
  console.log('\n=== Testing POST /api/finance/transactions ===');
  const result = await makeRequest('POST', '/finance/transactions', testTransaction);
  
  if (result.success) {
    console.log('✅ Transaction created successfully');
    console.log('Response:', JSON.stringify(result.data, null, 2));
    return result.data.data?.id || result.data.id;
  } else {
    console.log('❌ Failed to create transaction');
    console.log('Error:', result.error);
    return null;
  }
}

async function testGetTransactions() {
  console.log('\n=== Testing GET /api/finance/transactions ===');
  const result = await makeRequest('GET', `/finance/transactions?farmId=${FARM_ID}`);
  
  if (result.success) {
    console.log('✅ Transactions retrieved successfully');
    console.log('Count:', result.data.data?.length || 0);
    console.log('Response structure:', {
      success: result.data.success,
      hasData: !!result.data.data,
      isArray: Array.isArray(result.data.data)
    });
    return result.data.data;
  } else {
    console.log('❌ Failed to get transactions');
    console.log('Error:', result.error);
    return null;
  }
}

async function testGetTransactionById(id) {
  console.log(`\n=== Testing GET /api/finance/transactions/${id} ===`);
  const result = await makeRequest('GET', `/finance/transactions/${id}?farmId=${FARM_ID}`);
  
  if (result.success) {
    console.log('✅ Transaction retrieved by ID successfully');
    console.log('Response:', JSON.stringify(result.data, null, 2));
    return result.data.data;
  } else {
    console.log('❌ Failed to get transaction by ID');
    console.log('Error:', result.error);
    return null;
  }
}

async function testUpdateTransaction(id) {
  console.log(`\n=== Testing PUT /api/finance/transactions/${id} ===`);
  const updateData = { ...testTransactionUpdate, farmId: FARM_ID };
  const result = await makeRequest('PUT', `/finance/transactions/${id}`, updateData);
  
  if (result.success) {
    console.log('✅ Transaction updated successfully');
    console.log('Response:', JSON.stringify(result.data, null, 2));
    return result.data.data;
  } else {
    console.log('❌ Failed to update transaction');
    console.log('Error:', result.error);
    return null;
  }
}

async function testGetCategories() {
  console.log('\n=== Testing GET /api/finance/categories ===');
  const result = await makeRequest('GET', `/finance/categories?farmId=${FARM_ID}`);
  
  if (result.success) {
    console.log('✅ Categories retrieved successfully');
    console.log('Count:', result.data.data?.length || 0);
    console.log('Sample categories:', result.data.data?.slice(0, 3));
    return result.data.data;
  } else {
    console.log('❌ Failed to get categories');
    console.log('Error:', result.error);
    return null;
  }
}

async function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');
  
  // Test invalid transaction data
  console.log('\nTesting invalid transaction data...');
  const invalidResult = await makeRequest('POST', '/finance/transactions', {
    type: 'INVALID_TYPE',
    amount: 'not_a_number'
  });
  
  if (!invalidResult.success && invalidResult.status >= 400) {
    console.log('✅ Invalid data properly rejected');
    console.log('Error response:', invalidResult.error);
  } else {
    console.log('❌ Invalid data was not properly rejected');
  }
  
  // Test non-existent transaction
  console.log('\nTesting non-existent transaction...');
  const notFoundResult = await makeRequest('GET', `/finance/transactions/99999?farmId=${FARM_ID}`);
  
  if (!notFoundResult.success && notFoundResult.status === 404) {
    console.log('✅ Non-existent transaction properly handled');
  } else {
    console.log('❌ Non-existent transaction not properly handled');
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Transaction Recording API Tests');
  console.log('='.repeat(50));
  
  try {
    // Test categories first
    const categories = await testGetCategories();
    
    // Update test transaction with real category ID
    if (categories && categories.length > 0) {
      const feedCategory = categories.find(cat => cat.default_category === 'feed') || categories[0];
      testTransaction.category_id = feedCategory.id;
      console.log(`\nUsing category: ${feedCategory.name} (${feedCategory.id})`);
    }
    
    // Test transaction creation
    const transactionId = await testCreateTransaction();
    
    if (transactionId) {
      // Test getting all transactions
      await testGetTransactions();
      
      // Test getting specific transaction
      await testGetTransactionById(transactionId);
      
      // Test updating transaction
      await testUpdateTransaction(transactionId);
      
      // Verify update by getting the transaction again
      await testGetTransactionById(transactionId);
    }
    
    // Test error handling
    await testErrorHandling();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 All API tests completed!');
    
  } catch (error) {
    console.error('💥 Test runner failed:', error.message);
  }
}

// Run the tests
runAllTests();
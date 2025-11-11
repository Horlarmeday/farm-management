#!/usr/bin/env node

/**
 * End-to-End API Test Script for New Forms
 * Tests: Fishery, HR, and Inventory forms created in Phase 1B
 * 
 * Usage:
 *   1. Start server: cd server && yarn dev
 *   2. Get auth token: Login via API or use generate-test-token.js
 *   3. Run: node test-new-forms-api.js <AUTH_TOKEN>
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Get token from command line argument
const AUTH_TOKEN = process.argv[2];

if (!AUTH_TOKEN) {
  console.error('❌ Error: Auth token required');
  console.log('Usage: node test-new-forms-api.js <AUTH_TOKEN>');
  console.log('\nTo get token:');
  console.log('  1. Login via API: POST /api/auth/login');
  console.log('  2. Or use: node generate-test-token.js');
  process.exit(1);
}

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(normalizedPath, `${API_BASE}/`);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        let parsedData;
        try {
          parsedData = JSON.parse(responseData);
        } catch (e) {
          parsedData = responseData;
        }
        
        resolve({
          status: res.statusCode,
          data: parsedData,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test helper
async function runTest(testName, testFn) {
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    const result = await testFn();
    
    if (result.success) {
      console.log(`✅ PASS: ${testName}`);
      results.passed++;
      if (result.message) console.log(`   ${result.message}`);
    } else {
      console.log(`❌ FAIL: ${testName}`);
      console.log(`   Status: ${result.status || 'N/A'}`);
      console.log(`   Error: ${result.error || JSON.stringify(result.data)}`);
      results.failed++;
      results.errors.push({ test: testName, error: result.error || result.data });
    }
  } catch (error) {
    console.log(`❌ ERROR: ${testName}`);
    console.log(`   ${error.message}`);
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
  }
}

// ============================================================================
// FISHERY FORMS TESTS
// ============================================================================

async function testGetPonds() {
  const response = await makeRequest('/fishery/ponds?limit=10');
  if (response.status === 200 && response.data.data) {
    return {
      success: true,
      ponds: response.data.data,
      message: `Found ${response.data.data.length} pond(s)`
    };
  }
  return { success: false, status: response.status, data: response.data };
}

async function testCreateWaterQuality() {
  // First get a pond
  const pondsResult = await testGetPonds();
  if (!pondsResult.success || !pondsResult.ponds || pondsResult.ponds.length === 0) {
    return {
      success: false,
      error: 'No ponds available for testing. Please create a pond first.'
    };
  }

  const pondId = pondsResult.ponds[0].id;
  const testData = {
    pondId: pondId,
    date: new Date().toISOString(),
    temperature: 28.5,
    ph: 7.2,
    dissolvedOxygen: 6.5,
    ammonia: 0.25,
    nitrite: 0.1,
    nitrate: 5.0,
    notes: 'Test water quality record'
  };

  const response = await makeRequest('/fishery/water-quality', 'POST', testData);
  
  if (response.status === 201 && response.data.success) {
    return {
      success: true,
      message: `Water quality recorded for pond ${pondId}`,
      data: response.data.data
    };
  }
  return { success: false, status: response.status, data: response.data };
}

async function testCreateFeedingLog() {
  const pondsResult = await testGetPonds();
  if (!pondsResult.success || !pondsResult.ponds || pondsResult.ponds.length === 0) {
    return {
      success: false,
      error: 'No ponds available for testing.'
    };
  }

  const pondId = pondsResult.ponds[0].id;
  const testData = {
    pondId: pondId,
    feedingTime: new Date().toISOString(),
    feedType: 'Grower Feed',
    quantityKg: 25.5,
    waterTemperature: 28.4,
    notes: 'Test feeding record'
  };

  const response = await makeRequest('/fishery/feeding', 'POST', testData);
  
  if (response.status === 201 && response.data.success) {
    return {
      success: true,
      message: `Feeding log created for pond ${pondId}`,
      data: response.data.data
    };
  }
  return { success: false, status: response.status, data: response.data };
}

async function testCreateHarvestLog() {
  const pondsResult = await testGetPonds();
  if (!pondsResult.success || !pondsResult.ponds || pondsResult.ponds.length === 0) {
    return {
      success: false,
      error: 'No ponds available for testing.'
    };
  }

  const pondId = pondsResult.ponds[0].id;
  const testData = {
    pondId: pondId,
    harvestDate: new Date().toISOString(),
    quantityHarvested: 250,
    totalWeightKg: 150.5,
    averageWeightG: 602, // 0.602 kg per fish in grams
    harvestType: 'FULL',
    notes: 'Test harvest record'
  };

  const response = await makeRequest('/fishery/harvests', 'POST', testData);
  
  if (response.status === 201 && response.data.success) {
    return {
      success: true,
      message: `Harvest log created for pond ${pondId}`,
      data: response.data.data
    };
  }
  return { success: false, status: response.status, data: response.data };
}

// ============================================================================
// HR FORMS TESTS
// ============================================================================

async function testGetUsers() {
  const response = await makeRequest('/users?limit=10');
  if (response.status === 200 && (response.data.data?.items || response.data.data)) {
    const users = response.data.data?.items || response.data.data;
    return {
      success: true,
      users: Array.isArray(users) ? users : [],
      message: `Found ${Array.isArray(users) ? users.length : 0} user(s)`
    };
  }
  return { success: false, status: response.status, data: response.data };
}

async function testCreateAttendance() {
  const usersResult = await testGetUsers();
  if (!usersResult.success || !usersResult.users || usersResult.users.length === 0) {
    return {
      success: false,
      error: 'No users available for testing. Please create a user first.'
    };
  }

  const userId = usersResult.users[0].id;
  const now = new Date();
  const testData = {
    userId: userId,
    date: now.toISOString().split('T')[0] + 'T00:00:00.000Z',
    checkIn: now.toISOString(),
    checkOut: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours later
    location: 'HQ',
    notes: 'Test attendance record'
  };

  const response = await makeRequest('/users/attendance', 'POST', testData);
  
  if (response.status === 201 && response.data.success) {
    return {
      success: true,
      message: `Attendance recorded for user ${userId}`,
      data: response.data.data
    };
  }
  return { success: false, status: response.status, data: response.data };
}

async function testCreateLeaveRequest() {
  const usersResult = await testGetUsers();
  if (!usersResult.success || !usersResult.users || usersResult.users.length === 0) {
    return {
      success: false,
      error: 'No users available for testing.'
    };
  }

  const userId = usersResult.users[0].id;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7); // 7 days from now
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 2); // 3 days total

  const testData = {
    userId: userId,
    type: 'ANNUAL',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    reason: 'Test leave request'
  };

  const response = await makeRequest('/users/leave', 'POST', testData);
  
  if (response.status === 201 && response.data.success) {
    return {
      success: true,
      message: `Leave request created for user ${userId}`,
      data: response.data.data,
      leaveId: response.data.data?.id
    };
  }
  return { success: false, status: response.status, data: response.data };
}

async function testApproveLeave() {
  // First create a leave request
  const leaveResult = await testCreateLeaveRequest();
  if (!leaveResult.success || !leaveResult.leaveId) {
    return {
      success: false,
      error: 'Could not create leave request for testing approval'
    };
  }

  const leaveId = leaveResult.leaveId;
  const testData = {
    status: 'APPROVED',
    comments: 'Test approval'
  };

  const response = await makeRequest(`/users/leave/${leaveId}/approve`, 'PUT', testData);
  
  if (response.status === 200 && response.data.success) {
    return {
      success: true,
      message: `Leave ${leaveId} approved successfully`,
      data: response.data.data
    };
  }
  return { success: false, status: response.status, data: response.data };
}

// ============================================================================
// INVENTORY FORMS TESTS
// ============================================================================

async function testGetInventoryItems() {
  const response = await makeRequest('/inventory/items?limit=10');
  if (response.status === 200 && (response.data?.length > 0 || response.data?.data)) {
    const items = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    return {
      success: true,
      items: items,
      message: `Found ${items.length} item(s)`
    };
  }
  return { success: false, status: response.status, data: response.data };
}

async function testCreateInventoryTransaction() {
  const itemsResult = await testGetInventoryItems();
  if (!itemsResult.success || !itemsResult.items || itemsResult.items.length === 0) {
    return {
      success: false,
      error: 'No inventory items available for testing. Please create an item first.'
    };
  }

  const itemId = itemsResult.items[0].id;
  const testData = {
    itemId: itemId,
    type: 'out',
    quantity: 12.5,
    unitCost: 350.00,
    totalCost: 4375.00,
    reference: 'TXN-TEST-001',
    notes: 'Test transaction'
  };

  const response = await makeRequest('/inventory/transactions', 'POST', testData);
  
  if (response.status === 201 && (response.data.success || response.data.id)) {
    return {
      success: true,
      message: `Transaction created for item ${itemId}`,
      data: response.data
    };
  }
  return { success: false, status: response.status, data: response.data };
}

async function testCreateStockAdjustment() {
  const itemsResult = await testGetInventoryItems();
  if (!itemsResult.success || !itemsResult.items || itemsResult.items.length === 0) {
    return {
      success: false,
      error: 'No inventory items available for testing.'
    };
  }

  const itemId = itemsResult.items[0].id;
  const testData = {
    itemId: itemId,
    adjustmentType: 'increase',
    quantity: 5,
    reason: 'Physical count correction',
    notes: 'Test stock adjustment'
  };

  const response = await makeRequest('/inventory/adjustments', 'POST', testData);
  
  if (response.status === 201 && (response.data.success || response.data.id)) {
    return {
      success: true,
      message: `Stock adjustment created for item ${itemId}`,
      data: response.data
    };
  }
  return { success: false, status: response.status, data: response.data };
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   E2E API Tests for Phase 1B New Forms                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n🔗 Testing against: ${BASE_URL}`);
  console.log(`🔑 Using auth token: ${AUTH_TOKEN.substring(0, 20)}...`);

  // Fishery Forms
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FISHERY MODULE FORMS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await runTest('Get Ponds (Prerequisite)', testGetPonds);
  await runTest('CreateWaterQualityForm → POST /api/fishery/water-quality', testCreateWaterQuality);
  await runTest('CreateFeedingRecordForm → POST /api/fishery/feeding', testCreateFeedingLog);
  await runTest('CreateHarvestRecordForm → POST /api/fishery/harvests', testCreateHarvestLog);

  // HR Forms
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👥 HR MODULE FORMS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await runTest('Get Users (Prerequisite)', testGetUsers);
  await runTest('CreateAttendanceForm → POST /api/users/attendance', testCreateAttendance);
  await runTest('CreateLeaveRequestForm → POST /api/users/leave', testCreateLeaveRequest);
  await runTest('ApproveLeaveForm → PUT /api/users/leave/:id/approve', testApproveLeave);

  // Inventory Forms
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 INVENTORY MODULE FORMS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await runTest('Get Inventory Items (Prerequisite)', testGetInventoryItems);
  await runTest('CreateInventoryTransactionForm → POST /api/inventory/transactions', testCreateInventoryTransaction);
  await runTest('CreateStockAdjustmentForm → POST /api/inventory/adjustments', testCreateStockAdjustment);

  // Summary
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total:  ${results.passed + results.failed}`);

  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    results.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err.test}: ${err.error}`);
    });
  }

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});


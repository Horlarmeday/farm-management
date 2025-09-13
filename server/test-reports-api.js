// Using native fetch API (Node.js 18+)

const API_BASE_URL = 'http://localhost:5000';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

async function testReportsAPI() {
  console.log('🧪 Testing P&L Reports API with Enhanced Features...');
  
  try {
    // Step 1: Login to get authentication token
    console.log('\n1. Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status, await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log('✅ Login successful');
    
    // Step 2: Test cache stats endpoint
    console.log('\n2. Testing cache stats endpoint...');
    const cacheStatsResponse = await fetch(`${API_BASE_URL}/api/reports/cache/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (cacheStatsResponse.ok) {
      const cacheStats = await cacheStatsResponse.json();
      console.log('✅ Cache stats:', JSON.stringify(cacheStats, null, 2));
    } else {
      console.log('❌ Cache stats failed:', cacheStatsResponse.status, await cacheStatsResponse.text());
    }
    
    // Step 3: Test P&L report endpoint (first call - should be cache miss)
    console.log('\n3. Testing P&L report endpoint (first call)...');
    const plReportResponse1 = await fetch(`${API_BASE_URL}/api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (plReportResponse1.ok) {
      const plReport1 = await plReportResponse1.json();
      console.log('✅ P&L Report (first call):', JSON.stringify(plReport1, null, 2));
    } else {
      console.log('❌ P&L Report failed:', plReportResponse1.status, await plReportResponse1.text());
    }
    
    // Step 4: Test P&L report endpoint again (second call - should be cache hit)
    console.log('\n4. Testing P&L report endpoint (second call - should be cached)...');
    const plReportResponse2 = await fetch(`${API_BASE_URL}/api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (plReportResponse2.ok) {
      const plReport2 = await plReportResponse2.json();
      console.log('✅ P&L Report (second call):', JSON.stringify(plReport2, null, 2));
    } else {
      console.log('❌ P&L Report (second call) failed:', plReportResponse2.status, await plReportResponse2.text());
    }
    
    // Step 5: Test monthly summary endpoint
    console.log('\n5. Testing monthly summary endpoint...');
    const monthlySummaryResponse = await fetch(`${API_BASE_URL}/api/reports/monthly-summary/2024`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (monthlySummaryResponse.ok) {
      const monthlySummary = await monthlySummaryResponse.json();
      console.log('✅ Monthly Summary:', JSON.stringify(monthlySummary, null, 2));
    } else {
      console.log('❌ Monthly Summary failed:', monthlySummaryResponse.status, await monthlySummaryResponse.text());
    }
    
    // Step 6: Test rate limiting by making multiple rapid requests
    console.log('\n6. Testing rate limiting (making 12 rapid requests)...');
    const rateLimitPromises = [];
    for (let i = 0; i < 12; i++) {
      rateLimitPromises.push(
        fetch(`${API_BASE_URL}/api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31&test=${i}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      );
    }
    
    const rateLimitResults = await Promise.all(rateLimitPromises);
    const successCount = rateLimitResults.filter(r => r.ok).length;
    const rateLimitedCount = rateLimitResults.filter(r => r.status === 429).length;
    
    console.log(`✅ Rate limiting test: ${successCount} successful, ${rateLimitedCount} rate limited`);
    
    // Step 7: Test cache invalidation
    console.log('\n7. Testing cache invalidation...');
    const invalidateResponse = await fetch(`${API_BASE_URL}/api/reports/cache/invalidate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (invalidateResponse.ok) {
      console.log('✅ Cache invalidation successful');
    } else {
      console.log('❌ Cache invalidation failed:', invalidateResponse.status, await invalidateResponse.text());
    }
    
    // Step 8: Check cache stats after invalidation
    console.log('\n8. Checking cache stats after invalidation...');
    const finalCacheStatsResponse = await fetch(`${API_BASE_URL}/api/reports/cache/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (finalCacheStatsResponse.ok) {
      const finalCacheStats = await finalCacheStatsResponse.json();
      console.log('✅ Final cache stats:', JSON.stringify(finalCacheStats, null, 2));
    } else {
      console.log('❌ Final cache stats failed:', finalCacheStatsResponse.status, await finalCacheStatsResponse.text());
    }
    
    console.log('\n🎉 P&L Reports API testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testReportsAPI();
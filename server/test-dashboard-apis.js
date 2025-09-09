const http = require('http');

const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjQ1ZjAzMy1lMmY1LTRiM2MtODNiNC1jNTA2MDgzMDBkYzEiLCJlbWFpbCI6ImFkbWluQGt1eWFzaGZhcm1zLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NzI0MzMwOCwiZXhwIjoxNzU3MzI5NzA4LCJhdWQiOiJrdXlhc2gtYXBpIiwiaXNzIjoia3V5YXNoLWZtcyJ9.bdMUehRIZPx4lGjEMDHF4ZC78gcIjge6cn5vVhU-38w';

const endpoints = [
  '/api/reports/dashboard/overview',
  '/api/reports/dashboard',
  '/api/reports/dashboard/kpis',
  '/api/reports/dashboard/modules',
  '/api/reports/dashboard/alerts',
  '/api/reports/dashboard/tasks',
];

async function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n=== Testing ${path} ===`);
        console.log(`Status Code: ${res.statusCode}`);
        
        if (res.statusCode >= 500) {
          console.log('🚨 500 ERROR DETECTED!');
        } else if (res.statusCode >= 400) {
          console.log('⚠️  Client Error');
        } else {
          console.log('✅ Success');
        }
        
        try {
          const response = JSON.parse(data);
          console.log('Response:', JSON.stringify(response, null, 2));
        } catch (error) {
          console.log('Raw response:', data);
        }
        
        resolve({ path, statusCode: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.error(`Request error for ${path}:`, error.message);
      reject(error);
    });
    
    req.end();
  });
}

async function testAllEndpoints() {
  console.log('🧪 Testing Dashboard API Endpoints for 500 Errors...');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(endpoint);
      results.push(result);
    } catch (error) {
      console.error(`Failed to test ${endpoint}:`, error.message);
      results.push({ path: endpoint, error: error.message });
    }
  }
  
  console.log('\n📊 Summary:');
  const errors500 = results.filter(r => r.statusCode >= 500);
  const errors400 = results.filter(r => r.statusCode >= 400 && r.statusCode < 500);
  const success = results.filter(r => r.statusCode >= 200 && r.statusCode < 300);
  
  console.log(`✅ Successful: ${success.length}`);
  console.log(`⚠️  4xx Errors: ${errors400.length}`);
  console.log(`🚨 5xx Errors: ${errors500.length}`);
  
  if (errors500.length > 0) {
    console.log('\n🚨 Endpoints with 500 errors:');
    errors500.forEach(r => console.log(`  - ${r.path}`));
  }
}

testAllEndpoints().catch(console.error);
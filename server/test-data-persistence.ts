// Using native fetch API (Node.js 18+)

const API_BASE_URL = 'http://localhost:5000';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  token: string;
}

interface Farm {
  id: string;
  name: string;
  description?: string;
  location?: string;
  isActive: boolean;
  role: string;
}

interface FarmsResponse {
  farms: Farm[];
}

async function makeRequest(url: string, options: any = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}

async function testDataPersistence() {
  console.log('🧪 Testing Data Persistence...');
  console.log('=' .repeat(50));

  try {
    // Test 1: Login with admin credentials
    console.log('\n1. Testing login...');
    const { response: loginResponse, data: loginData } = await makeRequest(
      `${API_BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@kuyashfarms.com',
          password: 'admin123'
        })
      }
    );

    if (loginResponse.ok) {
      console.log('✅ Login successful');
      console.log(`   User: ${loginData.user.firstName} ${loginData.user.lastName}`);
      console.log(`   Email: ${loginData.user.email}`);
      
      const token = loginData.token;
      
      // Test 2: Get user farms
      console.log('\n2. Testing farm retrieval...');
      const { response: farmsResponse, data: farmsData } = await makeRequest(
        `${API_BASE_URL}/api/farm/user-farms`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (farmsResponse.ok && farmsData.farms && farmsData.farms.length > 0) {
        console.log('✅ Farms retrieved successfully');
        console.log(`   Found ${farmsData.farms.length} farm(s)`);
        
        const firstFarm = farmsData.farms[0];
        console.log(`   First farm: ${firstFarm.name} (${firstFarm.role})`);
        console.log(`   Farm ID: ${firstFarm.id}`);
        
        // Test 3: Simulate localStorage persistence
        console.log('\n3. Testing localStorage simulation...');
        const farmData = JSON.stringify(firstFarm);
        console.log('✅ Farm data can be serialized for localStorage');
        console.log(`   Serialized size: ${farmData.length} characters`);
        
        // Test 4: Simulate retrieval from localStorage
        const retrievedFarm = JSON.parse(farmData);
        console.log('✅ Farm data can be deserialized from localStorage');
        console.log(`   Retrieved farm: ${retrievedFarm.name}`);
        console.log(`   Retrieved ID: ${retrievedFarm.id}`);
        
        // Test 5: Verify farm context would work
        console.log('\n4. Testing farm context compatibility...');
        if (retrievedFarm.id && retrievedFarm.name && retrievedFarm.role) {
          console.log('✅ Farm data has all required fields for context');
          console.log(`   - ID: ${retrievedFarm.id}`);
          console.log(`   - Name: ${retrievedFarm.name}`);
          console.log(`   - Role: ${retrievedFarm.role}`);
          console.log(`   - Active: ${retrievedFarm.isActive}`);
        } else {
          console.log('❌ Farm data missing required fields');
        }
        
      } else {
        console.log('❌ Failed to retrieve farms');
        console.log(`   Status: ${farmsResponse.status}`);
        console.log(`   Response:`, farmsData);
      }
      
    } else {
      console.log('❌ Login failed');
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Response:`, loginData);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('Data persistence tests completed!');
}

// Run the test
testDataPersistence();
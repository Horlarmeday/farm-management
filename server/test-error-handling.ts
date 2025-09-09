const API_BASE_URL = 'http://localhost:5000';

async function makeRequest(url: string, data: any) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const responseData = await response.json();
  return { status: response.status, data: responseData, ok: response.ok };
}

async function testErrorHandling() {
  console.log('🧪 Testing Error Handling...');
  
  // Test 1: Invalid email format
  console.log('\n1. Testing invalid email format...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      email: 'invalid-email',
      password: 'password123'
    });
    if (response.ok) {
      console.log('❌ Should have failed with invalid email');
    } else {
      console.log('✅ Invalid email error:', response.status, response.data);
    }
  } catch (error: any) {
    console.log('❌ Network error:', error.message);
  }

  // Test 2: Wrong password
  console.log('\n2. Testing wrong password...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@kuyashfarms.com',
      password: 'wrongpassword',
    });
    if (response.ok) {
      console.log('❌ Should have failed with wrong password');
    } else {
      console.log('✅ Wrong password error:', response.status, response.data);
    }
  } catch (error: any) {
    console.log('❌ Network error:', error.message);
  }

  // Test 3: Non-existent user
  console.log('\n3. Testing non-existent user...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      email: 'nonexistent@test.com',
      password: 'password123',
    });
    if (response.ok) {
      console.log('❌ Should have failed with non-existent user');
    } else {
      console.log('✅ Non-existent user error:', response.status, response.data);
    }
  } catch (error: any) {
    console.log('❌ Network error:', error.message);
  }

  // Test 4: Missing fields
  console.log('\n4. Testing missing fields...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@kuyashfarms.com',
      // missing password
    });
    if (response.ok) {
      console.log('❌ Should have failed with missing password');
    } else {
      console.log('✅ Missing fields error:', response.status, response.data);
    }
  } catch (error: any) {
    console.log('❌ Network error:', error.message);
  }

  // Test 5: Valid login (should succeed)
  console.log('\n5. Testing valid login...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@kuyashfarms.com',
      password: 'admin123',
    });
    if (response.ok) {
      console.log(
        '✅ Valid login successful:',
        response.status,
        'User:',
        response.data.data?.user?.email,
      );
    } else {
      console.log('❌ Valid login failed:', response.status, response.data);
    }
  } catch (error: any) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n🎉 Error handling tests completed!');
}

testErrorHandling().catch(console.error);
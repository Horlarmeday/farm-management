const http = require('http');

async function testLogin() {
  const postData = JSON.stringify({
    email: 'admin@kuyashfarms.com',
    password: 'admin123',
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('Status Code:', res.statusCode);
          console.log('Response:', JSON.stringify(response, null, 2));
          
          if (response.data && response.data.accessToken) {
            console.log('\nAccess Token:', response.data.accessToken);
          }
          resolve(response);
        } catch (error) {
          console.error('Error parsing response:', error.message);
          console.error('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

testLogin();
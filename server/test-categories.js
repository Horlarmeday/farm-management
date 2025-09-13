const { exec } = require('child_process');

const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJmYXJtSWQiOiJ0ZXN0LWZhcm0taWQiLCJmYXJtUm9sZSI6Ik9XTkVSIiwiaWF0IjoxNzU3NDg1MjIzLCJleHAiOjE3NTc1NzE2MjN9.fQW4cDLRPCBn-EXBoY4cmilE-pInfFS6p05ukGtmu1w';

const testCategories = () => {
  const command = `curl -s "http://localhost:5000/api/finance/categories?farmId=test-farm-id" -H "Authorization: Bearer ${JWT_TOKEN}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    if (stderr) {
      console.error('Stderr:', stderr);
      return;
    }
    
    console.log('Categories Response:');
    console.log(stdout);
    
    try {
      const response = JSON.parse(stdout);
      console.log('\nParsed Response:');
      console.log(JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('Failed to parse JSON response');
    }
  });
};

testCategories();
const jwt = require('jsonwebtoken');

const payload = {
  userId: 'test-user-id',
  email: 'test@test.com',
  farmId: 'test-farm-id',
  farmRole: 'OWNER'
};

const token = jwt.sign(payload, 'your-super-secret-jwt-key-change-this-in-production', {
  expiresIn: '24h'
});

console.log('Generated JWT Token:');
console.log(token);
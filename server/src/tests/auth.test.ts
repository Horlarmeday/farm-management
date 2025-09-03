import request from 'supertest';
import { app } from '../app';
import { testDataSource } from './setup';
import { TestData, TestUtils } from './utils';

describe('Authentication API', () => {
  let testData: TestData;

  beforeEach(async () => {
    await TestUtils.cleanupTestData();
    testData = await TestUtils.createTestData();
  });

  afterEach(async () => {
    await TestUtils.cleanupTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '+1234567890',
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.lastName).toBe(userData.lastName);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail to register user with existing email', async () => {
      const userData = {
        email: testData.adminUser.email,
        password: 'password123',
        firstName: 'Another',
        lastName: 'User',
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should fail to register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].msg).toContain('Valid email is required');
    });

    it('should fail to register user with short password', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: '123',
        firstName: 'New',
        lastName: 'User',
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].msg).toContain('Password must be at least 6 characters');
    });

    it('should fail to register user with missing required fields', async () => {
      const userData = {
        email: 'newuser@test.com',
        // Missing password, firstName, lastName
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: testData.adminUser.email,
        password: testData.adminUser.password,
      };

      const response = await request(app).post('/api/auth/login').send(loginData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail to login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/login').send(loginData).expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should fail to login with invalid password', async () => {
      const loginData = {
        email: testData.adminUser.email,
        password: 'wrongpassword',
      };

      const response = await request(app).post('/api/auth/login').send(loginData).expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should fail to login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/login').send(loginData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].msg).toContain('Valid email is required');
    });

    it('should fail to login with missing credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({}).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // First login to get refresh token
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testData.adminUser.email,
        password: testData.adminUser.password,
      });

      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should fail to refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid refresh token');
    });

    it('should fail to refresh with missing refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({}).expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email for valid user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testData.adminUser.email })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset');
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(1);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      // First request password reset
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testData.adminUser.email });

      // Get the reset token from database (in real scenario, this would come from email)
      const userRepo = testDataSource.getRepository('User');
      const user = await userRepo.findOne({ where: { email: testData.adminUser.email } });
      if (!user) {
        throw new Error('User not found for password reset test');
      }
      const resetToken = user.passwordResetToken;

      const newPassword = 'newpassword123';
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword,
          confirmPassword: newPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset successful');

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testData.adminUser.email,
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it('should fail with invalid reset token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired reset token');
    });

    it('should fail with mismatched passwords', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some-token',
          newPassword: 'newpassword123',
          confirmPassword: 'differentpassword',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(1);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .post('/api/auth/change-password')
        .send({
          currentPassword: testData.adminUser.password,
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password changed successfully');

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testData.adminUser.email,
          password: 'newpassword123',
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it('should fail with incorrect current password', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Current password is incorrect');
    });

    it('should fail with mismatched new passwords', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq
        .post('/api/auth/change-password')
        .send({
          currentPassword: testData.adminUser.password,
          newPassword: 'newpassword123',
          confirmPassword: 'differentpassword',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(1);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.post('/api/auth/logout').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).post('/api/auth/logout').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile when authenticated', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const response = await authReq.get('/api/auth/profile').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testData.adminUser.email);
      expect(response.body.data.user.firstName).toBe(testData.adminUser.user.firstName);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/auth/profile').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on login attempts', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'wrongpassword',
      };

      // Make multiple failed login attempts (assuming rate limit is 5 per minute)
      for (let i = 0; i < 6; i++) {
        const response = await request(app).post('/api/auth/login').send(loginData);

        if (i < 5) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429); // Too Many Requests
        }
      }
    });
  });

  describe('Token Validation', () => {
    it('should reject expired token', async () => {
      // This test would require manipulating JWT expiration time
      // For now, we'll test with an obviously invalid token
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject malformed token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer malformed-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing token', async () => {
      const response = await request(app).get('/api/auth/profile').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/admin/create-user', () => {
    it('should create user successfully with auto-generated employeeId', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const userData = {
        email: 'newemployee@test.com',
        firstName: 'New',
        lastName: 'Employee',
        phone: '+1234567890',
        password: 'password123',
        roleId: testData.adminUser.user.roleId,
        department: testData.adminUser.user.department?.id,
        hireDate: new Date(),
        salary: 50000,
        status: 'active',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        bio: 'Test employee bio',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        postalCode: '12345',
        emergencyContact: '+0987654321',
        isActive: true,
        isEmailVerified: false,
        preferences: { theme: 'dark' },
      };

      const response = await authReq.post('/api/auth/admin/create-user').send(userData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).toHaveProperty('firstName', userData.firstName);
      expect(response.body.data).toHaveProperty('lastName', userData.lastName);
      expect(response.body.data).toHaveProperty('employeeId');
      expect(response.body.data.employeeId).toMatch(/^EMP\d{6}$/); // Format: EMP + YY + 4-digit sequence
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should fail to create user with existing email', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const userData = {
        email: testData.adminUser.email, // Existing email
        firstName: 'Another',
        lastName: 'User',
        phone: '+1234567890',
        password: 'password123',
        roleId: testData.adminUser.user.roleId,
        hireDate: new Date(),
        salary: 50000,
        status: 'active',
        isActive: true,
      };

      const response = await authReq.post('/api/auth/admin/create-user').send(userData).expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User with this email already exists');
    });

    it('should fail to create user without authentication', async () => {
      const userData = {
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        phone: '+1234567890',
        password: 'password123',
        roleId: 'some-role-id',
        hireDate: new Date(),
        salary: 50000,
        status: 'active',
        isActive: true,
      };

      const response = await request(app)
        .post('/api/auth/admin/create-user')
        .send(userData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail to create user with invalid role ID', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const userData = {
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        phone: '+1234567890',
        password: 'password123',
        roleId: 'invalid-role-id',
        hireDate: new Date(),
        salary: 50000,
        status: 'active',
        isActive: true,
      };

      const response = await authReq.post('/api/auth/admin/create-user').send(userData).expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Role not found');
    });

    it('should fail to create user with missing required fields', async () => {
      const authReq = TestUtils.createAuthenticatedRequest(testData.adminUser.accessToken);

      const userData = {
        email: 'newuser@test.com',
        // Missing firstName, lastName, phone, password, roleId, hireDate, salary, status, isActive
      };

      const response = await authReq.post('/api/auth/admin/create-user').send(userData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});

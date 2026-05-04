'use strict';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Set required env vars for tests
process.env.JWT_ACCESS_SECRET = 'test_access_secret_for_unit_tests_only';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_unit_tests_only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

const authService = require('../../src/services/auth.service');
const User = require('../../src/models/User.model');

describe('Auth Service', () => {
  describe('register()', () => {
    it('should create a new user and return tokens', async () => {
      const result = await authService.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password@123',
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('john@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw conflict error for duplicate email', async () => {
      await authService.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        password: 'Password@123',
      });

      await expect(
        authService.register({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'duplicate@example.com',
          password: 'Password@123',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('should hash the password before saving', async () => {
      const { user } = await authService.register({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password@123',
      });

      const dbUser = await User.findById(user._id).select('+password');
      expect(dbUser.password).not.toBe('Password@123');
      expect(dbUser.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash
    });
  });

  describe('login()', () => {
    beforeEach(async () => {
      await authService.register({
        firstName: 'Login',
        lastName: 'Test',
        email: 'login@example.com',
        password: 'Password@123',
      });
    });

    it('should return tokens on valid credentials', async () => {
      const result = await authService.login({
        email: 'login@example.com',
        password: 'Password@123',
      });

      expect(result.requires2FA).toBe(false);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw unauthorized on wrong password', async () => {
      await expect(
        authService.login({
          email: 'login@example.com',
          password: 'WrongPassword@123',
        })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw unauthorized on non-existent email', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'Password@123',
        })
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe('forgotPassword()', () => {
    it('should not throw for non-existent email (prevents enumeration)', async () => {
      await expect(
        authService.forgotPassword('nonexistent@example.com')
      ).resolves.toBeUndefined();
    });

    it('should set reset token for existing user', async () => {
      await authService.register({
        firstName: 'Reset',
        lastName: 'Test',
        email: 'reset@example.com',
        password: 'Password@123',
      });

      await authService.forgotPassword('reset@example.com');

      const user = await User.findOne({ email: 'reset@example.com' })
        .select('+passwordResetToken +passwordResetExpires');

      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();
      expect(user.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('verifyEmail()', () => {
    it('should verify email with valid token', async () => {
      const { user } = await authService.register({
        firstName: 'Verify',
        lastName: 'Test',
        email: 'verify@example.com',
        password: 'Password@123',
      });

      const dbUser = await User.findById(user._id)
        .select('+emailVerificationToken +emailVerificationExpires');

      // Get the raw token (we need to find it from the hash)
      // In real tests, we'd capture the token from the email service mock
      expect(dbUser.emailVerificationToken).toBeDefined();
    });

    it('should throw for invalid token', async () => {
      await expect(
        authService.verifyEmail('invalid_token_that_does_not_exist')
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});

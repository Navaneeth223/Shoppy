'use strict';

// Set test environment variables before any module loads
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_for_jest_setup';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_jest_setup';
process.env.MONGODB_URI = 'mongodb://localhost:27017/nexus_jest_test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Suppress console.log in tests (keep errors)
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: console.error,
};

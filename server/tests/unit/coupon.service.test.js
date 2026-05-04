'use strict';

process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

const { calculateDiscountPercentage, formatCurrency } = require('../../src/utils/currency');

describe('Coupon Discount Calculations', () => {
  describe('calculateDiscountPercentage()', () => {
    it('should calculate correct discount percentage', () => {
      expect(calculateDiscountPercentage(100, 80)).toBe(20);
      expect(calculateDiscountPercentage(200, 150)).toBe(25);
      expect(calculateDiscountPercentage(99.99, 49.99)).toBe(50);
    });

    it('should return 0 for no discount', () => {
      expect(calculateDiscountPercentage(100, 100)).toBe(0);
    });

    it('should return 0 for invalid original price', () => {
      expect(calculateDiscountPercentage(0, 50)).toBe(0);
      expect(calculateDiscountPercentage(-10, 50)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateDiscountPercentage(100, 66.67)).toBe(33);
    });
  });

  describe('formatCurrency()', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency(10.99)).toBe('$10.99');
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('should format EUR correctly', () => {
      const result = formatCurrency(10.99, 'EUR', 'de-DE');
      expect(result).toContain('10');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });
});

describe('ApiError', () => {
  const ApiError = require('../../src/utils/ApiError');

  it('should create a 400 bad request error', () => {
    const err = ApiError.badRequest('Invalid input');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid input');
    expect(err.isOperational).toBe(true);
  });

  it('should create a 401 unauthorized error', () => {
    const err = ApiError.unauthorized();
    expect(err.statusCode).toBe(401);
  });

  it('should create a 404 not found error', () => {
    const err = ApiError.notFound('Resource not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Resource not found');
  });

  it('should create a 409 conflict error', () => {
    const err = ApiError.conflict('Already exists');
    expect(err.statusCode).toBe(409);
  });

  it('should create a 500 internal error', () => {
    const err = ApiError.internal();
    expect(err.statusCode).toBe(500);
  });

  it('should include validation errors array', () => {
    const errors = [{ field: 'email', message: 'Invalid email' }];
    const err = ApiError.badRequest('Validation failed', errors);
    expect(err.errors).toEqual(errors);
  });
});

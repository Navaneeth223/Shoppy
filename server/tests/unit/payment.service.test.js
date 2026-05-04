'use strict';

process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

const { toStripeAmount, fromStripeAmount } = require('../../src/utils/currency');

describe('Payment Service — Currency Utils', () => {
  describe('toStripeAmount()', () => {
    it('should convert dollars to cents for USD', () => {
      expect(toStripeAmount(10.99, 'USD')).toBe(1099);
      expect(toStripeAmount(100, 'USD')).toBe(10000);
      expect(toStripeAmount(0.01, 'USD')).toBe(1);
    });

    it('should not multiply for zero-decimal currencies', () => {
      expect(toStripeAmount(1000, 'JPY')).toBe(1000);
      expect(toStripeAmount(500, 'KRW')).toBe(500);
    });

    it('should handle rounding correctly', () => {
      expect(toStripeAmount(10.999, 'USD')).toBe(1100);
      expect(toStripeAmount(10.001, 'USD')).toBe(1000);
    });
  });

  describe('fromStripeAmount()', () => {
    it('should convert cents to dollars for USD', () => {
      expect(fromStripeAmount(1099, 'USD')).toBe(10.99);
      expect(fromStripeAmount(10000, 'USD')).toBe(100);
    });

    it('should not divide for zero-decimal currencies', () => {
      expect(fromStripeAmount(1000, 'JPY')).toBe(1000);
    });
  });
});

describe('Payment Service — Webhook Handling', () => {
  it('should reject webhook with invalid signature', async () => {
    // Mock Stripe not configured
    const originalKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    const paymentService = require('../../src/services/payment.service');

    await expect(
      paymentService.handleWebhook('{}', 'invalid_signature')
    ).rejects.toMatchObject({ statusCode: 503 });

    process.env.STRIPE_SECRET_KEY = originalKey;
  });
});

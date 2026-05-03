'use strict';

const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

/**
 * Creates a rate limiter with standard options.
 * @param {object} options
 * @returns {Function} Express rate limit middleware
 */
function createRateLimiter(options = {}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    handler: (req, res, next) => {
      next(
        ApiError.tooManyRequests(
          options.message || 'Too many requests from this IP. Please try again later.'
        )
      );
    },
    keyGenerator: (req) => {
      return req.ip || req.headers['x-forwarded-for'] || 'unknown';
    },
    ...options,
  });
}

// General API rate limit: 100 requests per 15 minutes
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests. Please try again in 15 minutes.',
});

// Auth routes: 5 attempts per 15 minutes
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

// Password reset: 3 attempts per hour
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts. Please try again in 1 hour.',
});

// Search: 10 requests per minute
const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many search requests. Please slow down.',
});

// Upload: 20 uploads per hour
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Upload limit reached. Please try again in 1 hour.',
});

// Email verification resend: 3 per hour
const emailResendLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many verification email requests. Please try again in 1 hour.',
});

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  searchLimiter,
  uploadLimiter,
  emailResendLimiter,
  createRateLimiter,
};

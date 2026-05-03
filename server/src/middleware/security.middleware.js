'use strict';

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const env = require('../config/env');

/**
 * Helmet configuration with comprehensive Content Security Policy.
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Stripe.js
        'https://js.stripe.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https://res.cloudinary.com',
        'https://picsum.photos',
        'https://via.placeholder.com',
        'https://www.google-analytics.com',
      ],
      connectSrc: [
        "'self'",
        'https://api.stripe.com',
        'https://www.google-analytics.com',
        env.FRONTEND_URL,
        env.SELLER_DASHBOARD_URL,
        env.ADMIN_DASHBOARD_URL,
      ],
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: env.isProduction ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Stripe
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * MongoDB injection sanitization.
 * Strips $ and . from user input to prevent NoSQL injection.
 */
const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    // Log sanitization attempts
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[Security] Sanitized key "${key}" in request from ${req.ip}`);
    }
  },
});

/**
 * HTTP Parameter Pollution protection.
 * Allows specific parameters to have multiple values.
 */
const hppConfig = hpp({
  whitelist: [
    'brand', 'category', 'tags', 'color', 'size',
    'sort', 'fields', 'status', 'role',
  ],
});

module.exports = {
  helmetConfig,
  mongoSanitizeConfig,
  xssClean: xss(),
  hppConfig,
};

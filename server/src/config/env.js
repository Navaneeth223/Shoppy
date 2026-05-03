'use strict';

const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Validates that all required environment variables are present.
 * Fails fast on startup if any required variable is missing.
 */
const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[ENV] Missing required environment variables: ${missing.join(', ')}`);
  console.error('[ENV] Copy server/.env.example to server/.env and fill in all values.');
  process.exit(1);
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  API_VERSION: process.env.API_VERSION || 'v1',

  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  SELLER_DASHBOARD_URL: process.env.SELLER_DASHBOARD_URL || 'http://localhost:5174',
  ADMIN_DASHBOARD_URL: process.env.ADMIN_DASHBOARD_URL || 'http://localhost:5175',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),

  // Database
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_URI_PROD: process.env.MONGODB_URI_PROD,

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_CONNECT_CLIENT_ID: process.env.STRIPE_CONNECT_CLIENT_ID,

  // Email
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@nexuscommerce.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Nexus Commerce',

  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL,

  // Business
  DEFAULT_COMMISSION_RATE: parseFloat(process.env.DEFAULT_COMMISSION_RATE) || 0.1,
  MINIMUM_PAYOUT_AMOUNT: parseFloat(process.env.MINIMUM_PAYOUT_AMOUNT) || 50,

  // Feature flags
  ENABLE_2FA: process.env.ENABLE_2FA !== 'false',
  ENABLE_SOCIAL_AUTH: process.env.ENABLE_SOCIAL_AUTH !== 'false',
  ENABLE_GUEST_CHECKOUT: process.env.ENABLE_GUEST_CHECKOUT !== 'false',
  ENABLE_REVIEWS: process.env.ENABLE_REVIEWS !== 'false',
  ENABLE_WISHLIST: process.env.ENABLE_WISHLIST !== 'false',
  ENABLE_FLASH_DEALS: process.env.ENABLE_FLASH_DEALS !== 'false',
  ENABLE_RECOMMENDATIONS: process.env.ENABLE_RECOMMENDATIONS !== 'false',

  // Sentry
  SENTRY_DSN: process.env.SENTRY_DSN,

  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'nexus_session_secret_change_in_production',

  // Helpers
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};

module.exports = env;

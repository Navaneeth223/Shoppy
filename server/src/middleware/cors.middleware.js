'use strict';

const cors = require('cors');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const allowedOrigins = env.CORS_ORIGINS;

/**
 * CORS configuration.
 * In production, only allows requests from configured origins.
 * In development, allows all origins for convenience.
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (env.isDevelopment || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new ApiError(403, `CORS: Origin ${origin} not allowed.`));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400, // 24 hours preflight cache
};

module.exports = cors(corsOptions);

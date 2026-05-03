'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const passport = require('passport');

const env = require('./config/env');
const corsMiddleware = require('./middleware/cors.middleware');
const { helmetConfig, mongoSanitizeConfig, xssClean, hppConfig } = require('./middleware/security.middleware');
const { requestId, requestLogger } = require('./middleware/logger.middleware');
const { generalLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();

// ─── Trust proxy (for correct IP behind load balancer) ───────────────────────
app.set('trust proxy', 1);

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmetConfig);
app.use(corsMiddleware);

// ─── Request ID & logging ─────────────────────────────────────────────────────
app.use(requestId);
app.use(requestLogger);

// ─── Stripe webhook — must use raw body BEFORE json parser ───────────────────
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── Security sanitization ────────────────────────────────────────────────────
app.use(mongoSanitizeConfig);
app.use(xssClean);
app.use(hppConfig);

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ─── Passport ────────────────────────────────────────────────────────────────
app.use(passport.initialize());

// Configure Passport strategies
require('./config/passport')(passport);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const { isRedisConnected } = require('./config/redis');
  const { getStripe } = require('./config/stripe');

  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = isRedisConnected() ? 'connected' : 'disconnected';

  let stripeStatus = 'not_configured';
  if (getStripe()) {
    try {
      await getStripe().balance.retrieve();
      stripeStatus = 'connected';
    } catch {
      stripeStatus = 'error';
    }
  }

  const status = dbStatus === 'connected' ? 'ok' : 'degraded';

  res.status(status === 'ok' ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: {
      database: dbStatus,
      redis: redisStatus,
      stripe: stripeStatus,
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV,
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use(`/api/${env.API_VERSION}`, require('./routes/v1'));

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;

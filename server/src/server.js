'use strict';

const http = require('http');
const app = require('./app');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { configureCloudinary } = require('./config/cloudinary');
const { configureEmail } = require('./config/email');
const { initializeSocket } = require('./sockets');
const env = require('./config/env');
const logger = require('./utils/logger');

const httpServer = http.createServer(app);

/**
 * Starts the server and all dependent services.
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Connect to Redis (non-blocking — app works without it)
    await connectRedis();

    // Configure Cloudinary
    configureCloudinary();

    // Configure email transport
    await configureEmail();

    // Initialize Socket.IO
    initializeSocket(httpServer, env.CORS_ORIGINS);

    // Start HTTP server
    httpServer.listen(env.PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════════════╗
║          NEXUS COMMERCE API SERVER                   ║
╠══════════════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(36)}║
║  Port        : ${String(env.PORT).padEnd(36)}║
║  API Version : ${env.API_VERSION.padEnd(36)}║
║  Health      : http://localhost:${env.PORT}/api/health${' '.repeat(Math.max(0, 20 - String(env.PORT).length))}║
╚══════════════════════════════════════════════════════╝
      `);
    });

    // Start background jobs
    require('./jobs/flashDealExpiry');
    require('./jobs/inventoryCheck');

  } catch (error) {
    logger.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

async function gracefulShutdown(signal) {
  logger.info(`[Server] ${signal} received. Shutting down gracefully...`);

  httpServer.close(async () => {
    logger.info('[Server] HTTP server closed.');

    try {
      await disconnectDatabase();
      logger.info('[Server] Database disconnected.');
    } catch (err) {
      logger.error('[Server] Error during shutdown:', err.message);
    }

    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('[Server] Forced shutdown after timeout.');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Server] Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('[Server] Uncaught Exception:', error);
  process.exit(1);
});

startServer();

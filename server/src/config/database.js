'use strict';

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

/**
 * Connects to MongoDB.
 * In development without a running MongoDB, falls back to mongodb-memory-server.
 * @param {number} retryCount
 */
async function connectDatabase(retryCount = 0) {
  const uri = env.isProduction
    ? env.MONGODB_URI_PROD || env.MONGODB_URI
    : env.MONGODB_URI;

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  try {
    await mongoose.connect(uri, options);
    logger.info(`[Database] Connected to MongoDB: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('[Database] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('[Database] MongoDB disconnected.');
    });
  } catch (error) {
    // In development, fall back to in-memory MongoDB
    if (env.isDevelopment && retryCount === 0) {
      logger.warn('[Database] Could not connect to MongoDB. Trying in-memory fallback...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri, options);
        logger.info('[Database] Connected to in-memory MongoDB (development mode).');
        logger.warn('[Database] ⚠️  Data will NOT persist between restarts. Start MongoDB for persistence.');
        return;
      } catch (memErr) {
        logger.error('[Database] In-memory fallback also failed:', memErr.message);
      }
    }

    logger.error(
      `[Database] Connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}): ${error.message}`
    );

    if (retryCount < MAX_RETRIES - 1) {
      logger.info(`[Database] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDatabase(retryCount + 1);
    }

    logger.error('[Database] Max retries reached. Starting without database (degraded mode).');
    // Don't exit — let the app run in degraded mode
  }
}

async function disconnectDatabase() {
  await mongoose.connection.close();
  logger.info('[Database] MongoDB connection closed.');
}

module.exports = { connectDatabase, disconnectDatabase };

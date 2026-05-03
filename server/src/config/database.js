'use strict';

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Connects to MongoDB with retry logic.
 * @param {number} retryCount - Current retry attempt
 */
async function connectDatabase(retryCount = 0) {
  const uri = env.isProduction ? env.MONGODB_URI_PROD || env.MONGODB_URI : env.MONGODB_URI;

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
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
      logger.warn('[Database] MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('[Database] MongoDB reconnected.');
    });
  } catch (error) {
    logger.error(`[Database] Connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);

    if (retryCount < MAX_RETRIES - 1) {
      logger.info(`[Database] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDatabase(retryCount + 1);
    }

    logger.error('[Database] Max retries reached. Exiting.');
    process.exit(1);
  }
}

/**
 * Gracefully closes the database connection.
 */
async function disconnectDatabase() {
  await mongoose.connection.close();
  logger.info('[Database] MongoDB connection closed.');
}

module.exports = { connectDatabase, disconnectDatabase };

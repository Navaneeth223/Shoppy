'use strict';

const { createClient } = require('redis');
const env = require('./env');
const logger = require('../utils/logger');

let redisClient = null;
let isConnected = false;

/**
 * Creates and connects the Redis client with reconnect handling.
 * @returns {Promise<import('redis').RedisClientType>}
 */
async function connectRedis() {
  const clientOptions = {
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('[Redis] Max reconnection attempts reached.');
          return new Error('Max reconnection attempts reached');
        }
        const delay = Math.min(retries * 500, 5000);
        logger.warn(`[Redis] Reconnecting in ${delay}ms (attempt ${retries})...`);
        return delay;
      },
    },
  };

  if (env.REDIS_PASSWORD) {
    clientOptions.password = env.REDIS_PASSWORD;
  }

  redisClient = createClient(clientOptions);

  redisClient.on('connect', () => {
    logger.info('[Redis] Connected.');
    isConnected = true;
  });

  redisClient.on('error', (err) => {
    logger.error('[Redis] Error:', err.message);
    isConnected = false;
  });

  redisClient.on('reconnecting', () => {
    logger.warn('[Redis] Reconnecting...');
    isConnected = false;
  });

  redisClient.on('ready', () => {
    logger.info('[Redis] Ready.');
    isConnected = true;
  });

  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('[Redis] Initial connection failed:', error.message);
    // Don't exit — app can run without Redis (degraded mode)
  }

  return redisClient;
}

/**
 * Returns the Redis client instance.
 * @returns {import('redis').RedisClientType}
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Checks if Redis is currently connected.
 * @returns {boolean}
 */
function isRedisConnected() {
  return isConnected && redisClient !== null;
}

/**
 * Safe Redis get — returns null if Redis is unavailable.
 * @param {string} key
 * @returns {Promise<string|null>}
 */
async function safeGet(key) {
  if (!isRedisConnected()) return null;
  try {
    return await redisClient.get(key);
  } catch {
    return null;
  }
}

/**
 * Safe Redis set with optional TTL — no-op if Redis is unavailable.
 * @param {string} key
 * @param {string} value
 * @param {number} [ttlSeconds]
 */
async function safeSet(key, value, ttlSeconds) {
  if (!isRedisConnected()) return;
  try {
    if (ttlSeconds) {
      await redisClient.setEx(key, ttlSeconds, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch {
    // Silently fail — Redis is optional
  }
}

/**
 * Safe Redis delete — no-op if Redis is unavailable.
 * @param {string} key
 */
async function safeDel(key) {
  if (!isRedisConnected()) return;
  try {
    await redisClient.del(key);
  } catch {
    // Silently fail
  }
}

/**
 * Safe Redis delete by pattern — no-op if Redis is unavailable.
 * @param {string} pattern
 */
async function safeDelPattern(pattern) {
  if (!isRedisConnected()) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch {
    // Silently fail
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisConnected,
  safeGet,
  safeSet,
  safeDel,
  safeDelPattern,
};

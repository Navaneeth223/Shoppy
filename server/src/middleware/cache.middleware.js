'use strict';

const { safeGet, safeSet } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Creates a Redis cache middleware for GET requests.
 * @param {number} ttlSeconds - Cache TTL in seconds
 * @param {Function} [keyFn] - Custom cache key generator (defaults to req.originalUrl)
 * @returns {Function} Express middleware
 */
function cacheMiddleware(ttlSeconds, keyFn) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const cacheKey = keyFn ? keyFn(req) : `cache:${req.originalUrl}`;

    try {
      const cached = await safeGet(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(data);
      }
    } catch (err) {
      logger.warn('[Cache] Error reading from cache:', err.message);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      res.setHeader('X-Cache', 'MISS');

      // Only cache successful responses
      if (res.statusCode === 200 && body?.success !== false) {
        try {
          await safeSet(cacheKey, JSON.stringify(body), ttlSeconds);
        } catch (err) {
          logger.warn('[Cache] Error writing to cache:', err.message);
        }
      }

      return originalJson(body);
    };

    next();
  };
}

// Pre-configured cache durations
const cache = {
  /** 5 minutes — for featured/trending products */
  short: cacheMiddleware(5 * 60),
  /** 10 minutes — for product details */
  medium: cacheMiddleware(10 * 60),
  /** 1 hour — for category tree, brands */
  long: cacheMiddleware(60 * 60),
  /** 1 minute — for flash deals (time-sensitive) */
  flashDeal: cacheMiddleware(60),
  /** Custom TTL */
  custom: (ttl, keyFn) => cacheMiddleware(ttl, keyFn),
};

module.exports = cache;

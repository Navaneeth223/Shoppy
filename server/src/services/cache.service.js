'use strict';

const { safeGet, safeSet, safeDel, safeDelPattern } = require('../config/redis');
const logger = require('../utils/logger');

// Cache TTLs in seconds
const TTL = {
  PRODUCT: 10 * 60,          // 10 minutes
  PRODUCT_LIST: 5 * 60,      // 5 minutes
  CATEGORY_TREE: 60 * 60,    // 1 hour
  FEATURED: 5 * 60,          // 5 minutes
  TRENDING: 5 * 60,          // 5 minutes
  FLASH_DEAL: 60,             // 1 minute
  SEARCH_AUTOCOMPLETE: 30 * 60, // 30 minutes
  POPULAR_SEARCHES: 15 * 60, // 15 minutes
  SELLER_ANALYTICS: 5 * 60,  // 5 minutes
  BANNERS: 10 * 60,          // 10 minutes
};

/**
 * Gets a cached value, or computes and caches it.
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function to compute the value if not cached
 * @param {number} [ttl] - TTL in seconds
 * @returns {Promise<*>}
 */
async function getOrSet(key, fetchFn, ttl = TTL.PRODUCT) {
  try {
    const cached = await safeGet(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.warn('[Cache] Error reading cache:', err.message);
  }

  const value = await fetchFn();

  try {
    await safeSet(key, JSON.stringify(value), ttl);
  } catch (err) {
    logger.warn('[Cache] Error writing cache:', err.message);
  }

  return value;
}

/**
 * Invalidates cache keys matching a pattern.
 * @param {string} pattern - Redis key pattern (e.g. 'product:*')
 */
async function invalidate(pattern) {
  await safeDelPattern(pattern);
}

/**
 * Invalidates a specific cache key.
 * @param {string} key
 */
async function invalidateKey(key) {
  await safeDel(key);
}

/**
 * Builds a standardized cache key.
 * @param {string} namespace - e.g. 'product', 'category'
 * @param {string} identifier - e.g. product slug or ID
 * @param {object} [params] - Additional params to include in key
 * @returns {string}
 */
function buildKey(namespace, identifier, params = {}) {
  const paramStr = Object.keys(params).length
    ? ':' + Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    : '';
  return `${namespace}:${identifier}${paramStr}`;
}

module.exports = {
  TTL,
  getOrSet,
  invalidate,
  invalidateKey,
  buildKey,
};

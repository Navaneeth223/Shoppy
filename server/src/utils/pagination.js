'use strict';

/**
 * Parses and validates pagination parameters from query string.
 * @param {object} query - Express req.query object
 * @param {object} [defaults] - Default values
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePagination(query, defaults = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || defaults.page || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit, 10) || defaults.limit || 20)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Builds a sort object from a sort string.
 * @param {string} sortStr - Sort parameter (e.g. 'price_asc', 'newest', 'rating')
 * @param {object} [fieldMap] - Custom field mappings
 * @returns {object} Mongoose sort object
 */
function parseSort(sortStr, fieldMap = {}) {
  const defaultMap = {
    price_asc: { basePrice: 1 },
    price_desc: { basePrice: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    rating: { 'ratings.average': -1 },
    bestseller: { soldCount: -1 },
    most_reviewed: { reviewCount: -1 },
    relevance: { score: { $meta: 'textScore' } },
    name_asc: { title: 1 },
    name_desc: { title: -1 },
  };

  const map = { ...defaultMap, ...fieldMap };
  return map[sortStr] || { createdAt: -1 };
}

module.exports = { parsePagination, parseSort };

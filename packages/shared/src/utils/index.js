'use strict';

/**
 * Formats a price as currency string.
 * @param {number} amount
 * @param {string} [currency='USD']
 * @param {string} [locale='en-US']
 * @returns {string}
 */
function formatPrice(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates discount percentage.
 * @param {number} original
 * @param {number} sale
 * @returns {number}
 */
function discountPercent(original, sale) {
  if (!original || original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

/**
 * Truncates a string to a maximum length.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Generates a URL-friendly slug from a string.
 * @param {string} str
 * @returns {string}
 */
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Formats a date as a human-readable string.
 * @param {Date|string} date
 * @param {string} [locale='en-US']
 * @returns {string}
 */
function formatDate(date, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Calculates loyalty points for an order amount.
 * @param {number} amount
 * @param {string} [tier='bronze']
 * @returns {number}
 */
function calculateLoyaltyPoints(amount, tier = 'bronze') {
  const multipliers = { bronze: 1, silver: 1.25, gold: 1.5, platinum: 2 };
  return Math.floor(amount * (multipliers[tier] || 1));
}

module.exports = {
  formatPrice,
  discountPercent,
  truncate,
  slugify,
  formatDate,
  calculateLoyaltyPoints,
};

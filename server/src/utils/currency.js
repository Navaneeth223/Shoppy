'use strict';

/**
 * Formats a number as currency.
 * @param {number} amount - Amount in smallest unit (cents) or full unit
 * @param {string} [currency='USD'] - ISO 4217 currency code
 * @param {string} [locale='en-US'] - Locale string
 * @param {boolean} [fromCents=false] - Whether amount is in cents
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'USD', locale = 'en-US', fromCents = false) {
  const value = fromCents ? amount / 100 : amount;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Converts amount to Stripe's smallest currency unit (cents for USD).
 * @param {number} amount - Amount in full units (e.g. dollars)
 * @param {string} [currency='USD']
 * @returns {number} Amount in smallest unit
 */
function toStripeAmount(amount, currency = 'USD') {
  // Zero-decimal currencies don't need multiplication
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'BIF', 'CLP', 'GNF', 'MGA', 'PYG', 'RWF', 'UGX', 'XAF', 'XOF'];
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

/**
 * Converts from Stripe's smallest unit back to full units.
 * @param {number} amount - Amount in cents
 * @param {string} [currency='USD']
 * @returns {number}
 */
function fromStripeAmount(amount, currency = 'USD') {
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND'];
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return amount;
  }
  return amount / 100;
}

/**
 * Calculates discount percentage.
 * @param {number} originalPrice
 * @param {number} salePrice
 * @returns {number} Discount percentage (0-100)
 */
function calculateDiscountPercentage(originalPrice, salePrice) {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

module.exports = {
  formatCurrency,
  toStripeAmount,
  fromStripeAmount,
  calculateDiscountPercentage,
};

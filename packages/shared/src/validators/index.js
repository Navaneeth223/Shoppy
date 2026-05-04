'use strict';

/**
 * Validates an email address.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

/**
 * Validates password strength.
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain at least one number');
  return { valid: errors.length === 0, errors };
}

/**
 * Validates a phone number (basic).
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  return /^\+?[\d\s\-()]{7,20}$/.test(phone);
}

/**
 * Validates a postal code (US format).
 * @param {string} postalCode
 * @returns {boolean}
 */
function isValidPostalCode(postalCode) {
  return /^\d{5}(-\d{4})?$/.test(postalCode);
}

/**
 * Validates a price value.
 * @param {number} price
 * @returns {boolean}
 */
function isValidPrice(price) {
  return typeof price === 'number' && price >= 0 && isFinite(price);
}

module.exports = {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidPostalCode,
  isValidPrice,
};

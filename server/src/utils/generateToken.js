'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

/**
 * Generates a JWT access token for a user.
 * @param {object} payload - Token payload
 * @param {string} payload.id - User ID
 * @param {string} payload.role - User role
 * @param {string} payload.email - User email
 * @returns {string} Signed JWT access token
 */
function generateAccessToken(payload) {
  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      email: payload.email,
      type: 'access',
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRE }
  );
}

/**
 * Generates a JWT refresh token for a user.
 * @param {object} payload - Token payload
 * @param {string} payload.id - User ID
 * @param {string} payload.family - Token family ID (for theft detection)
 * @returns {string} Signed JWT refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(
    {
      id: payload.id,
      family: payload.family || crypto.randomUUID(),
      type: 'refresh',
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRE }
  );
}

/**
 * Verifies a JWT access token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

/**
 * Verifies a JWT refresh token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

/**
 * Generates a cryptographically secure random token (hex string).
 * @param {number} [bytes=32] - Number of random bytes
 * @returns {string} Hex-encoded random token
 */
function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hashes a token using SHA-256 for secure storage.
 * @param {string} token
 * @returns {string} SHA-256 hash of the token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateSecureToken,
  hashToken,
};

'use strict';

const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

/**
 * Protects routes by verifying the JWT access token.
 * Attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required. Please log in.');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Your session has expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid authentication token.');
  }

  if (decoded.type !== 'access') {
    throw ApiError.unauthorized('Invalid token type.');
  }

  // Fetch user from DB (ensures user still exists and is active)
  const user = await User.findById(decoded.id).select('+passwordChangedAt');

  if (!user) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists.');
  }

  if (!user.isActive || user.isBanned) {
    throw ApiError.forbidden('Your account has been suspended. Please contact support.');
  }

  // Check if password was changed after token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    throw ApiError.unauthorized('Password was recently changed. Please log in again.');
  }

  req.user = user;
  next();
});

/**
 * Optional authentication — attaches user if token present, but doesn't fail if not.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    req.user = user && user.isActive && !user.isBanned ? user : null;
  } catch {
    req.user = null;
  }

  next();
});

module.exports = { protect, optionalAuth };

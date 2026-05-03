'use strict';

const crypto = require('crypto');
const User = require('../models/User.model');
const Seller = require('../models/Seller.model');
const ApiError = require('../utils/ApiError');
const { hashToken } = require('../utils/generateToken');
const { safeSet, safeDel, safeGet } = require('../config/redis');
const emailService = require('./email.service');
const env = require('../config/env');
const logger = require('../utils/logger');

const REFRESH_TOKEN_EXPIRE_DAYS = 7;

/**
 * Registers a new user.
 * @param {object} data - Registration data
 * @returns {Promise<{user: User, accessToken: string, refreshToken: string}>}
 */
async function register(data) {
  const { firstName, lastName, email, password } = data;

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists.');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
  });

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verificationUrl = `${env.FRONTEND_URL}/verify-email/${verificationToken}`;
  try {
    await emailService.sendEmailVerification(user, verificationUrl);
    await emailService.sendWelcomeEmail(user);
  } catch (err) {
    logger.error('[Auth] Failed to send verification email:', err.message);
    // Don't fail registration if email fails
  }

  // Generate tokens
  const { accessToken, refreshToken, family } = generateTokenPair(user);

  // Store refresh token
  await storeRefreshToken(user, refreshToken, family, data.userAgent, data.ip);

  return { user, accessToken, refreshToken };
}

/**
 * Logs in a user with email and password.
 * @param {object} data - Login credentials
 * @returns {Promise<{user: User, accessToken: string, refreshToken: string, requires2FA: boolean}>}
 */
async function login(data) {
  const { email, password, userAgent, ip } = data;

  // Find user with password field
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password +loginAttempts +lockUntil +twoFactorEnabled +twoFactorSecret +refreshTokens');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Check if account is locked
  if (user.isLocked) {
    const lockExpiry = new Date(user.lockUntil).toLocaleTimeString();
    throw ApiError.unauthorized(`Account temporarily locked due to too many failed attempts. Try again after ${lockExpiry}.`);
  }

  // Check if account is banned
  if (user.isBanned) {
    throw ApiError.forbidden(`Your account has been suspended. Reason: ${user.banReason || 'Policy violation'}`);
  }

  // Check if account is active
  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Reset login attempts on success
  await user.resetLoginAttempts();

  // Update last login info
  user.lastLogin = new Date();
  user.lastLoginIP = ip;
  await user.save({ validateBeforeSave: false });

  // Check if 2FA is required
  if (user.twoFactorEnabled) {
    // Return a temporary token for 2FA validation
    const tempToken = crypto.randomBytes(32).toString('hex');
    await safeSet(`2fa:${tempToken}`, user._id.toString(), 5 * 60); // 5 min TTL
    return { requires2FA: true, tempToken, userId: user._id };
  }

  // Generate tokens
  const { accessToken, refreshToken, family } = generateTokenPair(user);
  await storeRefreshToken(user, refreshToken, family, userAgent, ip);

  return { user, accessToken, refreshToken, requires2FA: false };
}

/**
 * Validates a 2FA token and completes login.
 */
async function validate2FA(tempToken, totpCode) {
  const speakeasy = require('speakeasy');

  const userId = await safeGet(`2fa:${tempToken}`);
  if (!userId) {
    throw ApiError.unauthorized('2FA session expired. Please log in again.');
  }

  const user = await User.findById(userId).select('+twoFactorSecret +refreshTokens');
  if (!user) throw ApiError.unauthorized('User not found.');

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: totpCode,
    window: 1,
  });

  if (!isValid) {
    throw ApiError.unauthorized('Invalid 2FA code. Please try again.');
  }

  await safeDel(`2fa:${tempToken}`);

  const { accessToken, refreshToken, family } = generateTokenPair(user);
  await storeRefreshToken(user, refreshToken, family);

  return { user, accessToken, refreshToken };
}

/**
 * Rotates a refresh token.
 * Implements refresh token family tracking for theft detection.
 */
async function refreshTokens(oldRefreshToken) {
  const { verifyRefreshToken } = require('../utils/generateToken');

  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token.');
  }

  if (decoded.type !== 'refresh') {
    throw ApiError.unauthorized('Invalid token type.');
  }

  // Check if token is blacklisted
  const isBlacklisted = await safeGet(`blacklist:${hashToken(oldRefreshToken)}`);
  if (isBlacklisted) {
    // Token reuse detected — invalidate entire family
    await invalidateTokenFamily(decoded.id, decoded.family);
    throw ApiError.unauthorized('Token reuse detected. Please log in again.');
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.isActive || user.isBanned) {
    throw ApiError.unauthorized('User not found or account suspended.');
  }

  // Blacklist the old token
  const tokenTTL = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
  await safeSet(`blacklist:${hashToken(oldRefreshToken)}`, '1', tokenTTL);

  // Remove old token from user's token list
  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.token !== hashToken(oldRefreshToken)
  );

  // Generate new token pair (same family)
  const { accessToken, refreshToken, family } = generateTokenPair(user, decoded.family);
  await storeRefreshToken(user, refreshToken, family);

  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
}

/**
 * Logs out a user by blacklisting their refresh token.
 */
async function logout(refreshToken) {
  if (!refreshToken) return;

  try {
    const { verifyRefreshToken } = require('../utils/generateToken');
    const decoded = verifyRefreshToken(refreshToken);
    const tokenTTL = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
    await safeSet(`blacklist:${hashToken(refreshToken)}`, '1', tokenTTL);

    // Remove from user's token list
    await User.findByIdAndUpdate(decoded.id, {
      $pull: { refreshTokens: { token: hashToken(refreshToken) } },
    });
  } catch {
    // Token already invalid — that's fine
  }
}

/**
 * Initiates password reset flow.
 */
async function forgotPassword(email, origin) {
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success to prevent email enumeration
  if (!user) return;

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${origin || env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await emailService.sendPasswordResetEmail(user, resetUrl);
  } catch (err) {
    // Clear the reset token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw ApiError.internal('Failed to send password reset email. Please try again.');
  }
}

/**
 * Resets a user's password using a valid reset token.
 */
async function resetPassword(token, newPassword) {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw ApiError.badRequest('Password reset token is invalid or has expired.');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Invalidate all existing refresh tokens
  user.refreshTokens = [];
  await user.save({ validateBeforeSave: false });

  return user;
}

/**
 * Verifies a user's email address.
 */
async function verifyEmail(token) {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    throw ApiError.badRequest('Email verification token is invalid or has expired.');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user;
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function generateTokenPair(user, existingFamily) {
  const family = existingFamily || crypto.randomUUID();
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken(family);
  return { accessToken, refreshToken, family };
}

async function storeRefreshToken(user, refreshToken, family, userAgent, ip) {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000);

  // Keep only last 5 refresh tokens per user (cleanup old ones)
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens = user.refreshTokens.slice(-4);
  }

  user.refreshTokens.push({
    token: hashToken(refreshToken),
    family,
    expiresAt,
    userAgent: userAgent || null,
    ip: ip || null,
  });

  await user.save({ validateBeforeSave: false });
}

async function invalidateTokenFamily(userId, family) {
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: { family } },
  });
  logger.warn(`[Auth] Token family ${family} invalidated for user ${userId} (theft detection)`);
}

module.exports = {
  register,
  login,
  validate2FA,
  refreshTokens,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
};

'use strict';

const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { hashToken } = require('../utils/generateToken');
const User = require('../models/User.model');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const UAParser = require('ua-parser-js');
const env = require('../config/env');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

function setRefreshTokenCookie(res, token) {
  res.cookie('refreshToken', token, COOKIE_OPTIONS);
}

function clearRefreshTokenCookie(res) {
  res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, maxAge: 0 });
}

// ─── Register ─────────────────────────────────────────────────────────────────

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const parser = new UAParser(req.headers['user-agent']);
  const ua = parser.getResult();

  const { user, accessToken, refreshToken } = await authService.register({
    firstName,
    lastName,
    email,
    password,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });

  setRefreshTokenCookie(res, refreshToken);

  ApiResponse.created(res, 'Account created successfully. Please verify your email.', {
    user: sanitizeUser(user),
    accessToken,
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({
    email,
    password,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });

  if (result.requires2FA) {
    return ApiResponse.ok(res, '2FA verification required.', {
      requires2FA: true,
      tempToken: result.tempToken,
    });
  }

  setRefreshTokenCookie(res, result.refreshToken);

  ApiResponse.ok(res, 'Logged in successfully.', {
    user: sanitizeUser(result.user),
    accessToken: result.accessToken,
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  await authService.logout(refreshToken);
  clearRefreshTokenCookie(res);
  ApiResponse.ok(res, 'Logged out successfully.');
});

// ─── Refresh Token ────────────────────────────────────────────────────────────

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw ApiError.unauthorized('No refresh token provided.');
  }

  const { user, accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(token);

  setRefreshTokenCookie(res, newRefreshToken);

  ApiResponse.ok(res, 'Token refreshed successfully.', {
    user: sanitizeUser(user),
    accessToken,
  });
});

// ─── Forgot Password ──────────────────────────────────────────────────────────

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const origin = req.headers.origin || env.FRONTEND_URL;

  await authService.forgotPassword(email, origin);

  // Always return success to prevent email enumeration
  ApiResponse.ok(res, 'If an account with that email exists, a password reset link has been sent.');
});

// ─── Reset Password ───────────────────────────────────────────────────────────

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  await authService.resetPassword(token, password);

  clearRefreshTokenCookie(res);
  ApiResponse.ok(res, 'Password reset successfully. Please log in with your new password.');
});

// ─── Verify Email ─────────────────────────────────────────────────────────────

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  await authService.verifyEmail(token);
  ApiResponse.ok(res, 'Email verified successfully. You can now log in.');
});

// ─── Resend Verification ──────────────────────────────────────────────────────

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || user.isEmailVerified) {
    // Don't reveal if email exists
    return ApiResponse.ok(res, 'If your email is registered and unverified, a new verification link has been sent.');
  }

  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const emailService = require('../services/email.service');
  await emailService.sendEmailVerification(user, verificationUrl);

  ApiResponse.ok(res, 'Verification email sent. Please check your inbox.');
});

// ─── 2FA Setup ────────────────────────────────────────────────────────────────

const setup2FA = asyncHandler(async (req, res) => {
  if (!env.ENABLE_2FA) {
    throw ApiError.forbidden('Two-factor authentication is not enabled on this platform.');
  }

  const secret = speakeasy.generateSecret({
    name: `Nexus Commerce (${req.user.email})`,
    length: 20,
  });

  // Store secret temporarily (not yet enabled)
  await User.findByIdAndUpdate(req.user._id, {
    twoFactorSecret: secret.base32,
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  ApiResponse.ok(res, '2FA setup initiated. Scan the QR code with your authenticator app.', {
    secret: secret.base32,
    qrCode: qrCodeUrl,
    otpauthUrl: secret.otpauth_url,
  });
});

// ─── 2FA Verify & Enable ──────────────────────────────────────────────────────

const verify2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const user = await User.findById(req.user._id).select('+twoFactorSecret');

  if (!user.twoFactorSecret) {
    throw ApiError.badRequest('Please set up 2FA first.');
  }

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!isValid) {
    throw ApiError.badRequest('Invalid 2FA code. Please try again.');
  }

  user.twoFactorEnabled = true;
  await user.save({ validateBeforeSave: false });

  const emailService = require('../services/email.service');
  await emailService.send2FAEnabled(user);

  ApiResponse.ok(res, 'Two-factor authentication enabled successfully.');
});

// ─── 2FA Disable ─────────────────────────────────────────────────────────────

const disable2FA = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select('+password +twoFactorSecret');

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Incorrect password.');
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save({ validateBeforeSave: false });

  ApiResponse.ok(res, 'Two-factor authentication disabled.');
});

// ─── 2FA Validate (during login) ─────────────────────────────────────────────

const validate2FA = asyncHandler(async (req, res) => {
  const { tempToken, code } = req.body;

  const { user, accessToken, refreshToken } = await authService.validate2FA(tempToken, code);

  setRefreshTokenCookie(res, refreshToken);

  ApiResponse.ok(res, 'Logged in successfully.', {
    user: sanitizeUser(user),
    accessToken,
  });
});

// ─── OAuth Callbacks ──────────────────────────────────────────────────────────

const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  setRefreshTokenCookie(res, refreshToken);

  // Redirect to frontend with token
  res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
});

const facebookCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  setRefreshTokenCookie(res, refreshToken);

  res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.passwordChangedAt;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  delete obj.twoFactorSecret;
  return obj;
}

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  setup2FA,
  verify2FA,
  disable2FA,
  validate2FA,
  googleCallback,
  facebookCallback,
};

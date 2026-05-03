'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateAccessToken, generateRefreshToken, generateSecureToken, hashToken } = require('../utils/generateToken');

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,20}$/, 'Please provide a valid phone number'],
    },
    avatar: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    role: {
      type: String,
      enum: ['customer', 'seller', 'admin', 'superadmin'],
      default: 'customer',
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordChangedAt: { type: Date, select: false },
    refreshTokens: {
      type: [
        {
          token: { type: String, required: true },
          family: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          expiresAt: { type: Date, required: true },
          userAgent: String,
          ip: String,
        },
      ],
      select: false,
      default: [],
    },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    googleId: { type: String, default: null, sparse: true },
    facebookId: { type: String, default: null, sparse: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    lastLogin: { type: Date, default: null },
    lastLoginIP: { type: String, default: null },
    preferences: {
      newsletter: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      priceAlerts: { type: Boolean, default: true },
    },
    defaultAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      default: null,
    },
    savedPaymentMethods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentMethod',
      },
    ],
    stripeCustomerId: { type: String, default: null },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
    membershipTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ facebookId: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ membershipTier: 1 });
userSchema.index({ referralCode: 1 }, { sparse: true });

// ─── Pre-save hooks ───────────────────────────────────────────────────────────

userSchema.pre('save', async function (next) {
  // Hash password only if modified
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);

    // Update passwordChangedAt (not on initial creation)
    if (!this.isNew) {
      this.passwordChangedAt = new Date(Date.now() - 1000); // 1s in past to ensure token issued after
    }
  }

  // Generate referral code for new users
  if (this.isNew && !this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  // Update membership tier based on loyalty points
  if (this.isModified('loyaltyPoints')) {
    if (this.loyaltyPoints >= 5000) this.membershipTier = 'platinum';
    else if (this.loyaltyPoints >= 2000) this.membershipTier = 'gold';
    else if (this.loyaltyPoints >= 500) this.membershipTier = 'silver';
    else this.membershipTier = 'bronze';
  }

  next();
});

// ─── Instance methods ─────────────────────────────────────────────────────────

/**
 * Compares a plain-text password against the stored hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generates and stores an email verification token.
 * @returns {string} The raw (unhashed) token to send via email
 */
userSchema.methods.generateEmailVerificationToken = function () {
  const rawToken = generateSecureToken(32);
  this.emailVerificationToken = hashToken(rawToken);
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return rawToken;
};

/**
 * Generates and stores a password reset token.
 * @returns {string} The raw (unhashed) token to send via email
 */
userSchema.methods.generatePasswordResetToken = function () {
  const rawToken = generateSecureToken(32);
  this.passwordResetToken = hashToken(rawToken);
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return rawToken;
};

/**
 * Generates a JWT access token for this user.
 * @returns {string}
 */
userSchema.methods.generateAccessToken = function () {
  return generateAccessToken({
    id: this._id.toString(),
    role: this.role,
    email: this.email,
  });
};

/**
 * Generates a JWT refresh token for this user.
 * @param {string} [family] - Token family ID for theft detection
 * @returns {string}
 */
userSchema.methods.generateRefreshToken = function (family) {
  return generateRefreshToken({
    id: this._id.toString(),
    family: family || crypto.randomUUID(),
  });
};

/**
 * Checks if the user changed their password after a JWT was issued.
 * @param {number} jwtIssuedAt - JWT iat claim (seconds since epoch)
 * @returns {boolean}
 */
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return jwtIssuedAt < changedTimestamp;
  }
  return false;
};

/**
 * Increments login attempts and locks account if threshold exceeded.
 * @returns {Promise<void>}
 */
userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes

  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION) };
  }

  return this.updateOne(updates);
};

/**
 * Resets login attempts after successful login.
 * @returns {Promise<void>}
 */
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;

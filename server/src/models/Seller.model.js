'use strict';

const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      maxlength: [100, 'Store name cannot exceed 100 characters'],
    },
    storeSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      url: String,
      publicId: String,
    },
    banner: {
      url: String,
      publicId: String,
    },
    description: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    address: {
      addressLine1: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'US' },
    },
    socialLinks: {
      instagram: String,
      twitter: String,
      facebook: String,
      website: String,
    },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    verificationDocuments: [
      {
        type: { type: String, enum: ['id', 'business_license', 'tax_id', 'bank_statement'] },
        url: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      },
    ],
    rejectionReason: { type: String, default: null },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    commissionRate: { type: Number, default: null }, // null = use platform default
    payoutAccountType: {
      type: String,
      enum: ['stripe', 'bank', 'paypal'],
      default: null,
    },
    stripeAccountId: { type: String, default: null },
    bankDetails: {
      // Stored encrypted in production
      accountHolderName: String,
      accountNumber: String, // Last 4 digits only after masking
      routingNumber: String,
      bankName: String,
    },
    payoutSchedule: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'monthly',
    },
    totalPayout: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    policies: {
      return: { type: String, default: '30-day return policy' },
      shipping: { type: String, default: 'Ships within 2-3 business days' },
      privacy: String,
    },
    holidays: [
      {
        startDate: Date,
        endDate: Date,
        reason: String,
      },
    ],
    responseRate: { type: Number, default: 100 }, // Percentage
    avgResponseTime: { type: Number, default: 24 }, // Hours
    metrics: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    suspendedAt: { type: Date, default: null },
    suspensionReason: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

sellerSchema.index({ storeSlug: 1 }, { unique: true });
sellerSchema.index({ user: 1 }, { unique: true });
sellerSchema.index({ isVerified: 1, verificationStatus: 1 });
sellerSchema.index({ createdAt: -1 });

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;

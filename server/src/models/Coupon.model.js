'use strict';

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [50, 'Coupon code cannot exceed 50 characters'],
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: [0, 'Coupon value cannot be negative'],
    },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: null }, // Cap for percentage coupons
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    excludedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    applicableSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isFirstTimeOnly: { type: Boolean, default: false },
    usageLimitPerUser: { type: Number, default: 1 },
    totalUsageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date, default: Date.now },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        discountAmount: Number,
      },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, trim: true },
    // For buy_x_get_y
    buyQuantity: { type: Number, default: null },
    getQuantity: { type: Number, default: null },
    getProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.endDate;
});

couponSchema.virtual('isValid').get(function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.totalUsageLimit === null || this.usedCount < this.totalUsageLimit)
  );
});

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ createdBy: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;

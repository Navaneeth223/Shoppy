'use strict';

const mongoose = require('mongoose');

const flashDealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalPrice: { type: Number, required: true },
    dealPrice: { type: Number, required: true },
    discountPercentage: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalStock: { type: Number, required: true },
    soldCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'ended', 'cancelled'],
      default: 'scheduled',
    },
    earlyAccessTiers: [
      {
        type: String,
        enum: ['gold', 'platinum'],
      },
    ],
    earlyAccessMinutes: { type: Number, default: 0 }, // Minutes before public start
    notifiedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

flashDealSchema.virtual('remainingStock').get(function () {
  return Math.max(0, this.totalStock - this.soldCount);
});

flashDealSchema.virtual('soldPercentage').get(function () {
  if (this.totalStock === 0) return 100;
  return Math.round((this.soldCount / this.totalStock) * 100);
});

flashDealSchema.virtual('isCurrentlyActive').get(function () {
  const now = new Date();
  return this.isActive && this.status === 'active' && now >= this.startTime && now <= this.endTime;
});

flashDealSchema.index({ product: 1 });
flashDealSchema.index({ startTime: 1, endTime: 1, isActive: 1 });
flashDealSchema.index({ status: 1 });

const FlashDeal = mongoose.model('FlashDeal', flashDealSchema);

module.exports = FlashDeal;

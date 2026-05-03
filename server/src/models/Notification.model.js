'use strict';

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'order_update', 'price_drop', 'back_in_stock', 'new_message',
        'review_response', 'payout', 'promo', 'system', 'flash_deal',
        'low_stock', 'new_review', 'seller_approved', 'seller_rejected',
        'referral_reward', 'loyalty_tier_upgrade',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    channel: {
      type: String,
      enum: ['email', 'push', 'sms', 'in_app'],
      default: 'in_app',
    },
    link: { type: String, default: null },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

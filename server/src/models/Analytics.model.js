'use strict';

const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'product_view', 'search', 'search_click', 'add_to_cart',
        'remove_from_cart', 'cart_abandon', 'checkout_start',
        'checkout_complete', 'purchase', 'coupon_use', 'flash_deal_view',
        'page_view', 'banner_click', 'banner_impression',
      ],
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: String, default: null },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    searchQuery: { type: String, default: null },
    searchResultCount: { type: Number, default: null },
    referrer: { type: String, default: null },
    device: {
      type: { type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' },
      browser: String,
      os: String,
    },
    ip: { type: String, default: null },
    country: { type: String, default: null },
    value: { type: Number, default: null }, // Monetary value if applicable
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

analyticsEventSchema.index({ type: 1, createdAt: -1 });
analyticsEventSchema.index({ user: 1, type: 1 });
analyticsEventSchema.index({ product: 1, type: 1 });
analyticsEventSchema.index({ seller: 1, type: 1 });
analyticsEventSchema.index({ createdAt: -1 });

// TTL: keep analytics for 2 years
analyticsEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 }
);

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent;

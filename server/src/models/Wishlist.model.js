'use strict';

const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        addedAt: { type: Date, default: Date.now },
        priceAtAdd: { type: Number, default: null },
        priceAlertEnabled: { type: Boolean, default: false },
        priceAlertThreshold: { type: Number, default: null },
        note: { type: String, default: null },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

wishlistSchema.virtual('itemCount').get(function () {
  return this.items.length;
});

wishlistSchema.index({ user: 1 }, { unique: true });
wishlistSchema.index({ 'items.product': 1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;

'use strict';

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantKey: { type: String, default: 'default' },
    variantLabel: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true }, // Price at time of adding
    title: String,
    image: String,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      sparse: true,
    },
    sessionId: {
      type: String,
      default: null,
      sparse: true,
    },
    items: [cartItemSchema],
    coupon: {
      code: String,
      type: { type: String, enum: ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'] },
      value: Number,
      discountAmount: Number,
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

cartSchema.virtual('total').get(function () {
  const discount = this.coupon?.discountAmount || 0;
  return Math.max(0, this.subtotal - discount);
});

cartSchema.index({ user: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

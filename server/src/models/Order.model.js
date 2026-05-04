'use strict';

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    variantKey: { type: String, default: 'default' },
    variantLabel: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // Price at time of purchase
    title: { type: String, required: true },
    image: String,
    sku: String,
    status: {
      type: String,
      enum: [
        'pending', 'confirmed', 'processing', 'packed',
        'shipped', 'out_for_delivery', 'delivered',
        'cancelled', 'return_requested', 'return_approved', 'returned', 'refunded',
      ],
      default: 'pending',
    },
    trackingNumber: String,
    shippingCarrier: String,
    shippedAt: Date,
    deliveredAt: Date,
    sellerCommission: Number,
    platformFee: Number,
    sellerEarnings: Number,
  },
  { _id: true }
);

const addressEmbedSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    company: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    countryCode: String,
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    actor: { type: String, default: 'system' }, // 'system', 'seller', 'admin', 'customer'
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    guestEmail: { type: String, default: null }, // For guest orders
    items: [orderItemSchema],
    shippingAddress: { type: addressEmbedSchema, required: true },
    billingAddress: { type: addressEmbedSchema },
    paymentMethod: {
      type: { type: String, enum: ['card', 'apple_pay', 'google_pay', 'saved_card'] },
      last4: String,
      brand: String,
      stripePaymentIntentId: String,
      stripeChargeId: String,
      stripeCustomerId: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: [
        'pending', 'confirmed', 'processing', 'packed',
        'shipped', 'out_for_delivery', 'delivered',
        'cancelled', 'return_requested', 'return_approved', 'returned', 'refunded',
      ],
      default: 'pending',
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    couponDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD', uppercase: true },
    timeline: [timelineSchema],
    notes: { type: String, default: null },
    adminNotes: { type: String, default: null },
    isGift: { type: Boolean, default: false },
    giftMessage: { type: String, default: null },
    estimatedDelivery: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: null },
    returnReason: { type: String, default: null },
    returnImages: [String],
    refundAmount: { type: Number, default: 0 },
    refundedAt: { type: Date, default: null },
    stripeRefundId: { type: String, default: null },
    loyaltyPointsEarned: { type: Number, default: 0 },
    loyaltyPointsRedeemed: { type: Number, default: 0 },
    ipAddress: String,
    userAgent: String,
    shippingMethod: {
      name: String,
      carrier: String,
      estimatedDays: Number,
      cost: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.seller': 1, createdAt: -1 });
orderSchema.index({ 'paymentMethod.stripePaymentIntentId': 1 }, { sparse: true });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

orderSchema.virtual('canBeCancelled').get(function () {
  return ['pending', 'confirmed'].includes(this.orderStatus);
});

orderSchema.virtual('canBeReturned').get(function () {
  if (this.orderStatus !== 'delivered') return false;
  const returnWindow = 30 * 24 * 60 * 60 * 1000; // 30 days
  return this.deliveredAt && Date.now() - this.deliveredAt.getTime() < returnWindow;
});

// ─── Static methods ───────────────────────────────────────────────────────────

/**
 * Generates a unique order number in format NX-YYYY-NNNNNN.
 * @returns {Promise<string>}
 */
orderSchema.statics.generateOrderNumber = async function () {
  const year = new Date().getFullYear();
  const prefix = `NX-${year}-`;

  // Find the highest order number for this year
  const lastOrder = await this.findOne(
    { orderNumber: { $regex: `^${prefix}` } },
    { orderNumber: 1 },
    { sort: { orderNumber: -1 } }
  );

  let sequence = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderNumber.split('-')[2], 10);
    sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(6, '0')}`;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

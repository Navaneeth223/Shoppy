'use strict';

const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    method: {
      type: String,
      enum: ['stripe', 'bank_transfer', 'paypal'],
      required: true,
    },
    stripePayoutId: { type: String, default: null },
    stripeTransferId: { type: String, default: null },
    bankReference: { type: String, default: null },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    notes: { type: String },
    processedAt: { type: Date, default: null },
    failureReason: { type: String, default: null },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

payoutSchema.index({ seller: 1, createdAt: -1 });
payoutSchema.index({ status: 1 });

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;

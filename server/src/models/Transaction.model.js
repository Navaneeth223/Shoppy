'use strict';

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['sale', 'refund', 'commission', 'payout', 'adjustment'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    commissionRate: { type: Number },
    commissionAmount: { type: Number },
    netAmount: { type: Number }, // Amount after commission
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'reversed'],
      default: 'pending',
    },
    stripeTransferId: { type: String, default: null },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

transactionSchema.index({ seller: 1, createdAt: -1 });
transactionSchema.index({ order: 1 });
transactionSchema.index({ type: 1, status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

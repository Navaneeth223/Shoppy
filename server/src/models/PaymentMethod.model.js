'use strict';

const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stripePaymentMethodId: { type: String, required: true },
    type: {
      type: String,
      enum: ['card', 'us_bank_account', 'paypal'],
      default: 'card',
    },
    card: {
      brand: String, // visa, mastercard, amex, etc.
      last4: String,
      expMonth: Number,
      expYear: Number,
      country: String,
      funding: String, // credit, debit, prepaid
    },
    isDefault: { type: Boolean, default: false },
    billingDetails: {
      name: String,
      email: String,
      phone: String,
      address: {
        line1: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
      },
    },
  },
  { timestamps: true }
);

paymentMethodSchema.index({ user: 1 });
paymentMethodSchema.index({ stripePaymentMethodId: 1 }, { unique: true });

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

module.exports = PaymentMethod;

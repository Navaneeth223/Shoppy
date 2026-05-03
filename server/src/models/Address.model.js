'use strict';

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    label: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'US' },
    countryCode: { type: String, trim: true, uppercase: true, default: 'US' },
    isDefault: { type: Boolean, default: false },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

addressSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

addressSchema.virtual('formattedAddress').get(function () {
  const parts = [
    this.addressLine1,
    this.addressLine2,
    this.city,
    this.state,
    this.postalCode,
    this.country,
  ].filter(Boolean);
  return parts.join(', ');
});

addressSchema.index({ user: 1 });
addressSchema.index({ user: 1, isDefault: 1 });

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;

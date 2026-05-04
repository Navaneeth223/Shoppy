'use strict';

const mongoose = require('mongoose');

const shippingRateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    carrier: { type: String, required: true },
    minWeight: { type: Number, default: 0 },
    maxWeight: { type: Number, default: null },
    minOrderAmount: { type: Number, default: 0 },
    baseRate: { type: Number, required: true },
    perKgRate: { type: Number, default: 0 },
    estimatedDaysMin: { type: Number, default: 3 },
    estimatedDaysMax: { type: Number, default: 7 },
    isFreeShipping: { type: Boolean, default: false },
    freeShippingThreshold: { type: Number, default: null },
  },
  { _id: true }
);

const shippingZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    countries: [{ type: String, uppercase: true }],
    states: [{ type: String }],
    postalCodes: [{ type: String }],
    isActive: { type: Boolean, default: true },
    rates: [shippingRateSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

shippingZoneSchema.index({ countries: 1 });
shippingZoneSchema.index({ isActive: 1 });

const ShippingZone = mongoose.model('ShippingZone', shippingZoneSchema);

module.exports = ShippingZone;

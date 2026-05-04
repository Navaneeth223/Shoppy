'use strict';

const ShippingZone = require('../models/ShippingZone.model');
const logger = require('../utils/logger');

/**
 * Calculates available shipping options for a given address and cart.
 * @param {object} address - Shipping address
 * @param {Array} items - Cart items
 * @param {number} subtotal - Cart subtotal
 * @returns {Promise<Array>} Available shipping rates
 */
async function calculateShippingRates(address, items, subtotal) {
  try {
    // Find applicable shipping zones
    const zones = await ShippingZone.find({
      isActive: true,
      $or: [
        { countries: address.countryCode || address.country },
        { countries: { $size: 0 } }, // Global zones
      ],
    });

    if (zones.length === 0) {
      // Return default rates if no zones configured
      return getDefaultRates(subtotal);
    }

    // Calculate total weight
    const totalWeight = items.reduce((sum, item) => {
      return sum + (item.product?.weight || 500) * item.quantity;
    }, 0);

    const availableRates = [];

    for (const zone of zones) {
      for (const rate of zone.rates) {
        // Check weight limits
        if (rate.maxWeight && totalWeight > rate.maxWeight) continue;
        if (totalWeight < rate.minWeight) continue;

        // Check minimum order amount
        if (subtotal < rate.minOrderAmount) continue;

        // Calculate rate
        let cost = rate.baseRate + (totalWeight / 1000) * rate.perKgRate;

        // Apply free shipping threshold
        if (rate.isFreeShipping || (rate.freeShippingThreshold && subtotal >= rate.freeShippingThreshold)) {
          cost = 0;
        }

        availableRates.push({
          id: rate._id.toString(),
          name: rate.name,
          carrier: rate.carrier,
          cost: Math.round(cost * 100) / 100,
          estimatedDays: `${rate.estimatedDaysMin}-${rate.estimatedDaysMax} business days`,
          estimatedDaysMin: rate.estimatedDaysMin,
          estimatedDaysMax: rate.estimatedDaysMax,
          isFree: cost === 0,
        });
      }
    }

    return availableRates.length > 0 ? availableRates : getDefaultRates(subtotal);
  } catch (err) {
    logger.error('[Shipping] Error calculating rates:', err.message);
    return getDefaultRates(subtotal);
  }
}

/**
 * Returns default shipping rates when no zones are configured.
 * @param {number} subtotal
 * @returns {Array}
 */
function getDefaultRates(subtotal) {
  const FREE_THRESHOLD = 75;
  const isFreeEligible = subtotal >= FREE_THRESHOLD;

  return [
    {
      id: 'standard',
      name: 'Standard Shipping',
      carrier: 'USPS',
      cost: isFreeEligible ? 0 : 5.99,
      estimatedDays: '5-7 business days',
      estimatedDaysMin: 5,
      estimatedDaysMax: 7,
      isFree: isFreeEligible,
    },
    {
      id: 'express',
      name: 'Express Shipping',
      carrier: 'FedEx',
      cost: 12.99,
      estimatedDays: '2-3 business days',
      estimatedDaysMin: 2,
      estimatedDaysMax: 3,
      isFree: false,
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      carrier: 'UPS',
      cost: 24.99,
      estimatedDays: '1 business day',
      estimatedDaysMin: 1,
      estimatedDaysMax: 1,
      isFree: false,
    },
  ];
}

module.exports = { calculateShippingRates, getDefaultRates };

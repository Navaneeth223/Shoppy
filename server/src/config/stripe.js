'use strict';

const Stripe = require('stripe');
const env = require('./env');
const logger = require('../utils/logger');

let stripeInstance = null;

/**
 * Returns the configured Stripe instance (singleton).
 * @returns {import('stripe').Stripe}
 */
function getStripe() {
  if (!stripeInstance) {
    if (!env.STRIPE_SECRET_KEY) {
      logger.warn('[Stripe] Secret key not configured. Payment features will fail.');
      return null;
    }

    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
      appInfo: {
        name: 'Nexus Commerce',
        version: '1.0.0',
      },
      maxNetworkRetries: 3,
    });

    logger.info('[Stripe] Configured successfully.');
  }

  return stripeInstance;
}

module.exports = { getStripe };

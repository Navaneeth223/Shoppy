'use strict';

const Bull = require('bull');
const env = require('../config/env');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

// Create email queue backed by Redis
const emailQueue = new Bull('email', {
  redis: env.REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// ─── Job processors ───────────────────────────────────────────────────────────

emailQueue.process('welcome', async (job) => {
  const { user } = job.data;
  await emailService.sendWelcomeEmail(user);
  logger.info(`[EmailQueue] Welcome email sent to ${user.email}`);
});

emailQueue.process('verification', async (job) => {
  const { user, verificationUrl } = job.data;
  await emailService.sendEmailVerification(user, verificationUrl);
  logger.info(`[EmailQueue] Verification email sent to ${user.email}`);
});

emailQueue.process('password-reset', async (job) => {
  const { user, resetUrl } = job.data;
  await emailService.sendPasswordResetEmail(user, resetUrl);
  logger.info(`[EmailQueue] Password reset email sent to ${user.email}`);
});

emailQueue.process('order-confirmation', async (job) => {
  const { user, order } = job.data;
  await emailService.sendOrderConfirmation(user, order);
  logger.info(`[EmailQueue] Order confirmation sent for ${order.orderNumber}`);
});

emailQueue.process('order-shipped', async (job) => {
  const { user, order, trackingInfo } = job.data;
  await emailService.sendOrderShipped(user, order, trackingInfo);
  logger.info(`[EmailQueue] Shipping notification sent for ${order.orderNumber}`);
});

emailQueue.process('order-delivered', async (job) => {
  const { user, order } = job.data;
  await emailService.sendOrderDelivered(user, order);
  logger.info(`[EmailQueue] Delivery notification sent for ${order.orderNumber}`);
});

emailQueue.process('order-cancelled', async (job) => {
  const { user, order } = job.data;
  await emailService.sendOrderCancelled(user, order);
  logger.info(`[EmailQueue] Cancellation email sent for ${order.orderNumber}`);
});

emailQueue.process('refund-processed', async (job) => {
  const { user, order, refundAmount } = job.data;
  await emailService.sendRefundProcessed(user, order, refundAmount);
  logger.info(`[EmailQueue] Refund email sent for ${order.orderNumber}`);
});

emailQueue.process('price-drop', async (job) => {
  const { user, product, oldPrice, newPrice } = job.data;
  await emailService.sendPriceDropAlert(user, product, oldPrice, newPrice);
  logger.info(`[EmailQueue] Price drop alert sent to ${user.email}`);
});

// ─── Event handlers ───────────────────────────────────────────────────────────

emailQueue.on('completed', (job) => {
  logger.debug(`[EmailQueue] Job ${job.id} (${job.name}) completed`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`[EmailQueue] Job ${job.id} (${job.name}) failed:`, err.message);
});

emailQueue.on('error', (err) => {
  logger.error('[EmailQueue] Queue error:', err.message);
});

// ─── Helper functions ─────────────────────────────────────────────────────────

/**
 * Adds an email job to the queue.
 * @param {string} type - Job type
 * @param {object} data - Job data
 * @param {object} [options] - Bull job options
 */
async function queueEmail(type, data, options = {}) {
  try {
    await emailQueue.add(type, data, options);
  } catch (err) {
    logger.error(`[EmailQueue] Failed to queue ${type} email:`, err.message);
    // Fallback: send directly if queue fails
    try {
      switch (type) {
        case 'order-confirmation':
          await emailService.sendOrderConfirmation(data.user, data.order);
          break;
        case 'order-shipped':
          await emailService.sendOrderShipped(data.user, data.order, data.trackingInfo);
          break;
      }
    } catch (fallbackErr) {
      logger.error('[EmailQueue] Fallback email also failed:', fallbackErr.message);
    }
  }
}

module.exports = { emailQueue, queueEmail };

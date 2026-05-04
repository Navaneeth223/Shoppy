'use strict';

const cron = require('node-cron');
const Seller = require('../models/Seller.model');
const Order = require('../models/Order.model');
const Transaction = require('../models/Transaction.model');
const Payout = require('../models/Payout.model');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Processes monthly payouts for sellers on the 1st of each month at 2 AM.
 */
cron.schedule('0 2 1 * *', async () => {
  logger.info('[Payout] Starting monthly payout processing...');

  try {
    const sellers = await Seller.find({
      isVerified: true,
      verificationStatus: 'approved',
      isActive: true,
      pendingPayout: { $gte: env.MINIMUM_PAYOUT_AMOUNT },
    });

    logger.info(`[Payout] Processing payouts for ${sellers.length} sellers.`);

    for (const seller of sellers) {
      try {
        await processSinglePayout(seller);
      } catch (err) {
        logger.error(`[Payout] Failed for seller ${seller._id}:`, err.message);
      }
    }

    logger.info('[Payout] Monthly payout processing complete.');
  } catch (err) {
    logger.error('[Payout] Payout processor error:', err.message);
  }
});

/**
 * Processes a payout for a single seller.
 * @param {object} seller - Seller document
 */
async function processSinglePayout(seller) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Get all completed transactions for this period
  const transactions = await Transaction.find({
    seller: seller.user,
    type: 'sale',
    status: 'completed',
    createdAt: { $gte: periodStart, $lte: periodEnd },
  });

  if (transactions.length === 0) return;

  const totalAmount = transactions.reduce((sum, t) => sum + (t.netAmount || 0), 0);

  if (totalAmount < env.MINIMUM_PAYOUT_AMOUNT) {
    logger.info(`[Payout] Seller ${seller._id} below minimum payout threshold ($${totalAmount.toFixed(2)}).`);
    return;
  }

  // Create payout record
  const payout = await Payout.create({
    seller: seller.user,
    amount: totalAmount,
    currency: 'USD',
    status: 'pending',
    method: seller.stripeAccountId ? 'stripe' : 'bank_transfer',
    periodStart,
    periodEnd,
    transactions: transactions.map((t) => t._id),
    requestedBy: seller.user,
  });

  // Attempt Stripe payout if connected
  if (seller.stripeAccountId) {
    try {
      const { getStripe } = require('../config/stripe');
      const stripe = getStripe();

      if (stripe) {
        const transfer = await stripe.transfers.create({
          amount: Math.round(totalAmount * 100),
          currency: 'usd',
          destination: seller.stripeAccountId,
          metadata: {
            payoutId: payout._id.toString(),
            sellerId: seller._id.toString(),
            period: `${periodStart.toISOString().slice(0, 10)} to ${periodEnd.toISOString().slice(0, 10)}`,
          },
        });

        payout.status = 'completed';
        payout.stripeTransferId = transfer.id;
        payout.processedAt = new Date();
        await payout.save();

        // Update seller totals
        await Seller.findByIdAndUpdate(seller._id, {
          $inc: { totalPayout: totalAmount, pendingPayout: -totalAmount },
        });

        // Notify seller
        await notificationService.createNotification({
          userId: seller.user,
          type: 'payout',
          title: 'Payout Processed',
          body: `Your payout of $${totalAmount.toFixed(2)} has been processed and will arrive in 2-3 business days.`,
          link: '/seller-dashboard/finance',
          data: { payoutId: payout._id, amount: totalAmount },
          priority: 'high',
        });

        logger.info(`[Payout] Processed $${totalAmount.toFixed(2)} for seller ${seller._id}.`);
      }
    } catch (stripeErr) {
      payout.status = 'failed';
      payout.failureReason = stripeErr.message;
      await payout.save();
      logger.error(`[Payout] Stripe transfer failed for seller ${seller._id}:`, stripeErr.message);
    }
  } else {
    // Manual payout — mark as pending for admin review
    payout.status = 'pending';
    await payout.save();
    logger.info(`[Payout] Manual payout of $${totalAmount.toFixed(2)} queued for seller ${seller._id}.`);
  }
}

logger.info('[Jobs] Payout processor scheduled (1st of each month at 2 AM).');

module.exports = { processSinglePayout };

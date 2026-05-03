'use strict';

const cron = require('node-cron');
const FlashDeal = require('../models/FlashDeal.model');
const Product = require('../models/Product.model');
const logger = require('../utils/logger');

// Run every minute to check flash deal expiry
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Activate scheduled deals
    const toActivate = await FlashDeal.find({
      status: 'scheduled',
      startTime: { $lte: now },
      endTime: { $gt: now },
      isActive: true,
    });

    for (const deal of toActivate) {
      deal.status = 'active';
      await deal.save();

      await Product.findByIdAndUpdate(deal.product, {
        isFlashDeal: true,
        flashDealPrice: deal.dealPrice,
        flashDealExpiry: deal.endTime,
      });

      logger.info(`[FlashDeal] Activated deal for product ${deal.product}`);
    }

    // Expire ended deals
    const toExpire = await FlashDeal.find({
      status: 'active',
      endTime: { $lte: now },
    });

    for (const deal of toExpire) {
      deal.status = 'ended';
      await deal.save();

      await Product.findByIdAndUpdate(deal.product, {
        isFlashDeal: false,
        flashDealPrice: null,
        flashDealExpiry: null,
      });

      logger.info(`[FlashDeal] Expired deal for product ${deal.product}`);
    }
  } catch (err) {
    logger.error('[FlashDeal] Cron job error:', err.message);
  }
});

logger.info('[Jobs] Flash deal expiry job scheduled.');

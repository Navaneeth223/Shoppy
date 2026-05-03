'use strict';

const cron = require('node-cron');
const Inventory = require('../models/Inventory.model');
const Product = require('../models/Product.model');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');

// Run every hour to check inventory levels
cron.schedule('0 * * * *', async () => {
  try {
    // Find low stock items
    const lowStockItems = await Inventory.find({
      $expr: {
        $and: [
          { $lte: [{ $subtract: ['$stock', '$reservedStock'] }, '$lowStockThreshold'] },
          { $gt: [{ $subtract: ['$stock', '$reservedStock'] }, 0] },
        ],
      },
    }).populate('product', 'title seller');

    for (const item of lowStockItems) {
      if (!item.product) continue;

      await notificationService.createNotification({
        userId: item.product.seller,
        type: 'low_stock',
        title: 'Low Stock Alert',
        body: `"${item.product.title}" (${item.variantLabel}) has only ${item.availableStock} units left.`,
        link: '/seller-dashboard/inventory',
        data: { productId: item.product._id },
        priority: 'high',
      });
    }

    if (lowStockItems.length > 0) {
      logger.info(`[Inventory] Sent ${lowStockItems.length} low stock alerts.`);
    }
  } catch (err) {
    logger.error('[Inventory] Check job error:', err.message);
  }
});

logger.info('[Jobs] Inventory check job scheduled.');

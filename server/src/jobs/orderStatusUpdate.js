'use strict';

const cron = require('node-cron');
const Order = require('../models/Order.model');
const notificationService = require('../services/notification.service');
const inventoryService = require('../services/inventory.service');
const logger = require('../utils/logger');

/**
 * Auto-confirms orders that have been in 'pending' state for more than 30 minutes
 * after payment capture (handles webhook delays).
 */
cron.schedule('*/15 * * * *', async () => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const pendingOrders = await Order.find({
      orderStatus: 'pending',
      paymentStatus: 'captured',
      createdAt: { $lt: fifteenMinutesAgo },
    }).limit(50);

    for (const order of pendingOrders) {
      order.orderStatus = 'confirmed';
      order.timeline.push({
        status: 'confirmed',
        message: 'Order confirmed automatically after payment verification.',
        actor: 'system',
      });
      await order.save();

      await notificationService.createNotification({
        userId: order.user,
        type: 'order_update',
        title: 'Order Confirmed',
        body: `Your order ${order.orderNumber} has been confirmed.`,
        link: `/profile/orders/${order._id}`,
        data: { orderId: order._id, orderNumber: order.orderNumber },
      });
    }

    if (pendingOrders.length > 0) {
      logger.info(`[OrderStatus] Auto-confirmed ${pendingOrders.length} orders.`);
    }
  } catch (err) {
    logger.error('[OrderStatus] Auto-confirm job error:', err.message);
  }
});

/**
 * Marks orders as delivered if they've been in 'shipped' state for 14+ days
 * and no tracking update has been received.
 */
cron.schedule('0 2 * * *', async () => {
  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const shippedOrders = await Order.find({
      orderStatus: 'shipped',
      updatedAt: { $lt: fourteenDaysAgo },
    }).limit(100);

    for (const order of shippedOrders) {
      order.orderStatus = 'delivered';
      order.deliveredAt = new Date();
      order.timeline.push({
        status: 'delivered',
        message: 'Order marked as delivered (auto-update after 14 days in transit).',
        actor: 'system',
      });
      await order.save();

      // Deduct inventory
      await inventoryService.deductInventory(order);

      // Notify customer
      await notificationService.createNotification({
        userId: order.user,
        type: 'order_update',
        title: 'Order Delivered',
        body: `Your order ${order.orderNumber} has been marked as delivered. How was it?`,
        link: `/profile/orders/${order._id}`,
        data: { orderId: order._id, orderNumber: order.orderNumber },
        priority: 'normal',
      });
    }

    if (shippedOrders.length > 0) {
      logger.info(`[OrderStatus] Auto-delivered ${shippedOrders.length} orders.`);
    }
  } catch (err) {
    logger.error('[OrderStatus] Auto-deliver job error:', err.message);
  }
});

logger.info('[Jobs] Order status update jobs scheduled.');

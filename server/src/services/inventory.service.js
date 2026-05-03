'use strict';

const Inventory = require('../models/Inventory.model');
const Product = require('../models/Product.model');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');

/**
 * Reserves inventory for all items in an order.
 * Uses atomic operations to prevent overselling.
 * @param {object} order - Order document with items
 */
async function reserveInventory(order) {
  for (const item of order.items) {
    const result = await Inventory.findOneAndUpdate(
      {
        product: item.product,
        variantKey: item.variantKey || 'default',
        $expr: { $gte: [{ $subtract: ['$stock', '$reservedStock'] }, item.quantity] },
      },
      {
        $inc: { reservedStock: item.quantity },
        $push: {
          history: {
            type: 'reservation',
            quantity: item.quantity,
            note: `Reserved for order ${order.orderNumber}`,
            orderId: order._id,
          },
        },
      },
      { new: true }
    );

    if (!result) {
      logger.warn(`[Inventory] Could not reserve ${item.quantity} units of product ${item.product} (variant: ${item.variantKey})`);
      // Don't throw — payment already succeeded, handle manually
    }
  }
}

/**
 * Releases reserved inventory (on cancellation or payment failure).
 * @param {object} order
 */
async function releaseInventory(order) {
  for (const item of order.items) {
    await Inventory.findOneAndUpdate(
      {
        product: item.product,
        variantKey: item.variantKey || 'default',
      },
      {
        $inc: { reservedStock: -item.quantity },
        $push: {
          history: {
            type: 'release',
            quantity: item.quantity,
            note: `Released from order ${order.orderNumber}`,
            orderId: order._id,
          },
        },
      }
    );
  }
}

/**
 * Deducts inventory after order delivery (converts reserved to sold).
 * @param {object} order
 */
async function deductInventory(order) {
  for (const item of order.items) {
    const inventory = await Inventory.findOneAndUpdate(
      {
        product: item.product,
        variantKey: item.variantKey || 'default',
      },
      {
        $inc: {
          stock: -item.quantity,
          reservedStock: -item.quantity,
          soldStock: item.quantity,
        },
        $push: {
          history: {
            type: 'sale',
            quantity: item.quantity,
            note: `Sold via order ${order.orderNumber}`,
            orderId: order._id,
          },
        },
      },
      { new: true }
    );

    if (inventory) {
      // Update product stock
      await Product.findByIdAndUpdate(item.product, { stock: inventory.stock });

      // Check for low stock
      if (inventory.isLowStock) {
        await notifyLowStock(inventory);
      }

      // Check for out of stock
      if (inventory.isOutOfStock) {
        await Product.findByIdAndUpdate(item.product, { status: 'inactive' });
      }
    }
  }
}

/**
 * Updates stock for a specific product variant.
 * @param {string} productId
 * @param {string} variantKey
 * @param {number} quantity - New stock quantity
 * @param {string} performedBy - User ID
 */
async function updateStock(productId, variantKey, quantity, performedBy) {
  const inventory = await Inventory.findOne({ product: productId, variantKey });

  if (!inventory) {
    throw ApiError.notFound('Inventory record not found.');
  }

  const previousStock = inventory.stock;
  inventory.stock = quantity;
  inventory.history.push({
    type: 'adjustment',
    quantity: quantity - previousStock,
    previousStock,
    newStock: quantity,
    note: 'Manual stock adjustment',
    performedBy,
  });

  await inventory.save();

  // Update product stock
  const totalStock = await Inventory.aggregate([
    { $match: { product: inventory.product } },
    { $group: { _id: null, total: { $sum: { $subtract: ['$stock', '$reservedStock'] } } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    stock: totalStock[0]?.total || 0,
  });

  return inventory;
}

/**
 * Notifies seller of low stock.
 */
async function notifyLowStock(inventory) {
  try {
    const product = await Product.findById(inventory.product).select('title seller');
    if (!product) return;

    await notificationService.createNotification({
      userId: product.seller,
      type: 'low_stock',
      title: 'Low Stock Alert',
      body: `"${product.title}" (${inventory.variantLabel}) is running low. Only ${inventory.availableStock} units remaining.`,
      link: `/seller-dashboard/inventory`,
      data: { productId: product._id, variantKey: inventory.variantKey },
      priority: 'high',
    });
  } catch (err) {
    logger.error('[Inventory] Failed to send low stock notification:', err.message);
  }
}

/**
 * Checks if all items in a cart are available.
 * @param {Array} items - Cart items
 * @returns {Promise<{available: boolean, unavailableItems: Array}>}
 */
async function checkAvailability(items) {
  const unavailableItems = [];

  for (const item of items) {
    const inventory = await Inventory.findOne({
      product: item.product,
      variantKey: item.variantKey || 'default',
    });

    if (!inventory || inventory.availableStock < item.quantity) {
      unavailableItems.push({
        product: item.product,
        variantKey: item.variantKey,
        requested: item.quantity,
        available: inventory?.availableStock || 0,
      });
    }
  }

  return {
    available: unavailableItems.length === 0,
    unavailableItems,
  };
}

module.exports = {
  reserveInventory,
  releaseInventory,
  deductInventory,
  updateStock,
  checkAvailability,
};

'use strict';

const AnalyticsEvent = require('../models/Analytics.model');
const logger = require('../utils/logger');

/**
 * Tracks an analytics event asynchronously (fire-and-forget).
 * @param {object} eventData
 */
async function trackEvent(eventData) {
  try {
    await AnalyticsEvent.create(eventData);
  } catch (err) {
    // Analytics failures should never break the main flow
    logger.warn('[Analytics] Failed to track event:', err.message);
  }
}

/**
 * Gets revenue analytics for a seller over a time period.
 * @param {string} sellerId
 * @param {string} [period='monthly'] - 'daily' | 'weekly' | 'monthly'
 * @param {number} [year]
 * @returns {Promise<Array>}
 */
async function getSellerRevenue(sellerId, period = 'monthly', year = new Date().getFullYear()) {
  const Order = require('../models/Order.model');

  let groupBy;
  if (period === 'daily') {
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' },
    };
  } else if (period === 'weekly') {
    groupBy = {
      year: { $year: '$createdAt' },
      week: { $week: '$createdAt' },
    };
  } else {
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
    };
  }

  return Order.aggregate([
    {
      $match: {
        'items.seller': require('mongoose').Types.ObjectId.createFromHexString(sellerId.toString()),
        paymentStatus: 'captured',
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    { $unwind: '$items' },
    {
      $match: {
        'items.seller': require('mongoose').Types.ObjectId.createFromHexString(sellerId.toString()),
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $addToSet: '$_id' },
        units: { $sum: '$items.quantity' },
      },
    },
    {
      $project: {
        _id: 1,
        revenue: 1,
        orders: { $size: '$orders' },
        units: 1,
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);
}

/**
 * Gets top products for a seller.
 * @param {string} sellerId
 * @param {number} [limit=10]
 * @returns {Promise<Array>}
 */
async function getTopProducts(sellerId, limit = 10) {
  const Order = require('../models/Order.model');

  return Order.aggregate([
    {
      $match: {
        'items.seller': require('mongoose').Types.ObjectId.createFromHexString(sellerId.toString()),
        paymentStatus: 'captured',
      },
    },
    { $unwind: '$items' },
    {
      $match: {
        'items.seller': require('mongoose').Types.ObjectId.createFromHexString(sellerId.toString()),
      },
    },
    {
      $group: {
        _id: '$items.product',
        title: { $first: '$items.title' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        units: { $sum: '$items.quantity' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
  ]);
}

/**
 * Gets platform-wide revenue analytics (admin).
 * @param {string} [period='monthly']
 * @param {number} [year]
 * @returns {Promise<Array>}
 */
async function getPlatformRevenue(period = 'monthly', year = new Date().getFullYear()) {
  const Order = require('../models/Order.model');

  let groupBy;
  if (period === 'daily') {
    groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
  } else if (period === 'weekly') {
    groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
  } else {
    groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
  }

  return Order.aggregate([
    {
      $match: {
        paymentStatus: 'captured',
        createdAt: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);
}

module.exports = {
  trackEvent,
  getSellerRevenue,
  getTopProducts,
  getPlatformRevenue,
};

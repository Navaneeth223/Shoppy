'use strict';

const express = require('express');
const router = express.Router();

const sellerController = require('../../controllers/seller.controller');
const { protect } = require('../../middleware/auth.middleware');
const { isSeller } = require('../../middleware/role.middleware');

// Public routes
router.get('/:slug', sellerController.getPublicStore);
router.get('/:slug/products', sellerController.getStoreProducts);

// Authenticated seller routes
router.post('/apply', protect, sellerController.applyAsSeller);
router.get('/me', protect, isSeller, sellerController.getMySellerProfile);
router.put('/me', protect, isSeller, sellerController.updateSellerProfile);
router.get('/me/products', protect, isSeller, sellerController.getSellerProducts);
router.get('/me/orders', protect, isSeller, sellerController.getSellerOrders);
router.put('/me/orders/:orderId/items/:itemId/status', protect, isSeller, sellerController.updateOrderItemStatus);
router.get('/me/analytics/overview', protect, isSeller, sellerController.getAnalyticsOverview);

module.exports = router;

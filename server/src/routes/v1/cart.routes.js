'use strict';

const express = require('express');
const router = express.Router();

const cartController = require('../../controllers/cart.controller');
const { optionalAuth } = require('../../middleware/auth.middleware');
const { protect } = require('../../middleware/auth.middleware');

router.get('/', optionalAuth, cartController.getCart);
router.post('/items', optionalAuth, cartController.addToCart);
router.put('/items/:itemId', optionalAuth, cartController.updateCartItem);
router.delete('/items/:itemId', optionalAuth, cartController.removeCartItem);
router.delete('/', optionalAuth, cartController.clearCart);
router.post('/merge', protect, cartController.mergeCart);
router.post('/apply-coupon', optionalAuth, cartController.applyCoupon);
router.delete('/coupon', optionalAuth, cartController.removeCoupon);

module.exports = router;

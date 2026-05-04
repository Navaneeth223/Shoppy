'use strict';

const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/coupon.controller');
const { protect } = require('../../middleware/auth.middleware');
const { isSeller, isAdmin } = require('../../middleware/role.middleware');

// Public — validate a coupon code
router.post('/validate', protect, couponController.validateCoupon);

// Authenticated routes
router.get('/', protect, isSeller, couponController.getCoupons);
router.get('/:id', protect, isSeller, couponController.getCoupon);
router.post('/', protect, isSeller, couponController.createCoupon);
router.put('/:id', protect, isSeller, couponController.updateCoupon);
router.delete('/:id', protect, isSeller, couponController.deleteCoupon);

module.exports = router;

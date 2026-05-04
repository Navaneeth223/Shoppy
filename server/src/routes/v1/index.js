'use strict';

const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/products', require('./product.routes'));
router.use('/categories', require('./category.routes'));
router.use('/brands', require('./brand.routes'));
router.use('/cart', require('./cart.routes'));
router.use('/orders', require('./order.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/sellers', require('./seller.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/search', require('./search.routes'));
router.use('/upload', require('./upload.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/addresses', require('./address.routes'));
router.use('/coupons', require('./coupon.routes'));
router.use('/flash-deals', require('./flashdeal.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/wishlist', require('./wishlist.routes'));

module.exports = router;

'use strict';

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const userController = require('../../controllers/user.controller');
const orderController = require('../../controllers/order.controller');
const { protect } = require('../../middleware/auth.middleware');
const { uploadAvatar } = require('../../middleware/upload.middleware');
const validate = require('../../middleware/validate.middleware');

// All user routes require authentication
router.use(protect);

// Profile
router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.put('/me/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  validate,
], userController.changePassword);
router.put('/me/avatar', uploadAvatar, userController.uploadAvatar);
router.delete('/me', userController.deactivateAccount);

// Orders
router.get('/me/orders', orderController.getUserOrders);
router.get('/me/orders/:id', orderController.getOrder);
router.post('/me/orders/:id/cancel', orderController.cancelOrder);
router.post('/me/orders/:id/return', orderController.requestReturn);

// Addresses
router.get('/me/addresses', userController.getAddresses);
router.post('/me/addresses', userController.addAddress);
router.put('/me/addresses/:id', userController.updateAddress);
router.delete('/me/addresses/:id', userController.deleteAddress);
router.put('/me/addresses/:id/default', userController.setDefaultAddress);

// Wishlist
router.get('/me/wishlist', userController.getWishlist);
router.post('/me/wishlist/:productId', userController.addToWishlist);
router.delete('/me/wishlist/:productId', userController.removeFromWishlist);

// Notifications
router.get('/me/notifications', userController.getNotifications);
router.put('/me/notifications/read-all', userController.markAllNotificationsRead);
router.put('/me/notifications/:id/read', userController.markNotificationRead);

// Reviews
router.get('/me/reviews', userController.getMyReviews);

// Loyalty
router.get('/me/loyalty', userController.getLoyaltyInfo);

module.exports = router;

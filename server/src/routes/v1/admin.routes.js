'use strict';

const express = require('express');
const router = express.Router();

const adminController = require('../../controllers/admin.controller');
const { protect } = require('../../middleware/auth.middleware');
const { isAdmin } = require('../../middleware/role.middleware');

// All admin routes require admin role
router.use(protect, isAdmin);

router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/role', adminController.changeUserRole);

// Sellers
router.get('/sellers', adminController.getSellers);
router.put('/sellers/:id/approve', adminController.approveSeller);

// Products
router.get('/products', adminController.getAdminProducts);
router.put('/products/:id/feature', adminController.featureProduct);

// Orders
router.get('/orders', adminController.getAdminOrders);

// Reviews
router.get('/reviews', adminController.getAdminReviews);
router.put('/reviews/:id/approve', adminController.approveReview);

// Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Banners
router.get('/banners', adminController.getBanners);
router.post('/banners', adminController.createBanner);
router.put('/banners/:id', adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);

// Analytics
router.get('/analytics/revenue', adminController.getRevenueAnalytics);

module.exports = router;

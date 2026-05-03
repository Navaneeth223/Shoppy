'use strict';

const express = require('express');
const router = express.Router();

const productController = require('../../controllers/product.controller');
const reviewController = require('../../controllers/review.controller');
const { protect, optionalAuth } = require('../../middleware/auth.middleware');
const { isSeller, isAdmin } = require('../../middleware/role.middleware');
const { uploadMultipleImages } = require('../../middleware/upload.middleware');
const cache = require('../../middleware/cache.middleware');
const { searchLimiter } = require('../../middleware/rateLimit.middleware');

// Public routes
router.get('/', optionalAuth, productController.getProducts);
router.get('/featured', cache.short, productController.getFeaturedProducts);
router.get('/trending', cache.short, productController.getTrendingProducts);
router.get('/new-arrivals', cache.short, productController.getNewArrivals);
router.get('/flash-deals', cache.flashDeal, productController.getFlashDeals);
router.get('/search', searchLimiter, productController.searchProducts);
router.get('/:slug', optionalAuth, productController.getProduct);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:id/reviews', optionalAuth, reviewController.getProductReviews);

// Authenticated routes
router.post('/:id/view', optionalAuth, productController.incrementViewCount);
router.post('/:id/reviews', protect, reviewController.createReview);
router.post('/:reviewId/reviews/:reviewId/vote', protect, reviewController.voteReview);

// Seller routes
router.post('/', protect, isSeller, productController.createProduct);
router.put('/:id', protect, isSeller, productController.updateProduct);
router.delete('/:id', protect, isSeller, productController.deleteProduct);
router.post('/:id/images', protect, isSeller, uploadMultipleImages, productController.uploadProductImages);
router.delete('/:id/images/:imageId', protect, isSeller, productController.deleteProductImage);

// Admin routes
router.put('/:id/status', protect, isAdmin, productController.updateProductStatus);

module.exports = router;

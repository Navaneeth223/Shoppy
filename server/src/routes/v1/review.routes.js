'use strict';

const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/review.controller');
const { protect } = require('../../middleware/auth.middleware');
const { isAdmin } = require('../../middleware/role.middleware');
const { uploadMultipleImages } = require('../../middleware/upload.middleware');

// Seller reply to a review
router.post('/:reviewId/reply', protect, reviewController.replyToReview);

// Vote on a review
router.post('/:reviewId/vote', protect, reviewController.voteReview);

// Admin moderation
router.put('/:reviewId/moderate', protect, isAdmin, reviewController.moderateReview);

module.exports = router;

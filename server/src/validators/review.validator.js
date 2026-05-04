'use strict';

const { body } = require('express-validator');

const createReviewRules = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('body')
    .trim()
    .isLength({ min: 10 }).withMessage('Review must be at least 10 characters')
    .isLength({ max: 5000 }).withMessage('Review cannot exceed 5000 characters'),
  body('orderId')
    .notEmpty().withMessage('Order ID is required')
    .isMongoId().withMessage('Invalid order ID'),
];

module.exports = { createReviewRules };

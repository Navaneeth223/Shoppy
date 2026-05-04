'use strict';

const { body } = require('express-validator');

const createProductRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Product title is required')
    .isLength({ max: 300 }).withMessage('Title cannot exceed 300 characters'),
  body('description')
    .notEmpty().withMessage('Product description is required'),
  body('basePrice')
    .isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  body('salePrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
];

const updateProductRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Title cannot exceed 300 characters'),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('salePrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
];

module.exports = { createProductRules, updateProductRules };

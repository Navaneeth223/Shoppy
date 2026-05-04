'use strict';

const { body } = require('express-validator');

const applySellerRules = [
  body('storeName')
    .trim()
    .notEmpty().withMessage('Store name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Store name must be 3-100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('contactEmail')
    .optional()
    .isEmail().withMessage('Valid contact email required'),
];

module.exports = { applySellerRules };

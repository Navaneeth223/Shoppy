'use strict';

const express = require('express');
const router = express.Router();

const brandController = require('../../controllers/brand.controller');
const { protect } = require('../../middleware/auth.middleware');
const { isAdmin } = require('../../middleware/role.middleware');
const cache = require('../../middleware/cache.middleware');

router.get('/', cache.medium, brandController.getBrands);
router.get('/:slug', brandController.getBrand);
router.post('/', protect, isAdmin, brandController.createBrand);
router.put('/:id', protect, isAdmin, brandController.updateBrand);

module.exports = router;

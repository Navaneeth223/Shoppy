'use strict';

const express = require('express');
const router = express.Router();

const categoryController = require('../../controllers/category.controller');
const cache = require('../../middleware/cache.middleware');

router.get('/', cache.long, categoryController.getCategories);
router.get('/:slug', categoryController.getCategory);

module.exports = router;

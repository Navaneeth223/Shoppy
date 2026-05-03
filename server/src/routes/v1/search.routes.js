'use strict';

const express = require('express');
const router = express.Router();

const searchController = require('../../controllers/search.controller');
const { searchLimiter } = require('../../middleware/rateLimit.middleware');

router.get('/', searchLimiter, searchController.search);
router.get('/autocomplete', searchController.autocomplete);
router.get('/popular', searchController.popularSearches);

module.exports = router;

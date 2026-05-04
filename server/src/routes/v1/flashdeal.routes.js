'use strict';

const express = require('express');
const router = express.Router();
const flashDealController = require('../../controllers/flashdeal.controller');
const { protect } = require('../../middleware/auth.middleware');
const { isSeller, isAdmin } = require('../../middleware/role.middleware');
const cache = require('../../middleware/cache.middleware');

// Public
router.get('/active', cache.flashDeal, flashDealController.getActiveFlashDeals);

// Admin/seller
router.get('/', protect, isAdmin, flashDealController.getFlashDeals);
router.post('/', protect, isSeller, flashDealController.createFlashDeal);
router.put('/:id', protect, isSeller, flashDealController.updateFlashDeal);
router.delete('/:id', protect, isSeller, flashDealController.cancelFlashDeal);

module.exports = router;

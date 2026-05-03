'use strict';

const express = require('express');
const router = express.Router();

const orderController = require('../../controllers/order.controller');
const { protect, optionalAuth } = require('../../middleware/auth.middleware');

router.post('/', optionalAuth, orderController.createOrder);
router.get('/track/:orderNumber', orderController.trackOrder);
router.get('/:id', protect, orderController.getOrder);

module.exports = router;

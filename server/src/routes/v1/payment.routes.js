'use strict';

const express = require('express');
const router = express.Router();

const paymentController = require('../../controllers/payment.controller');
const { protect, isAdmin } = require('../../middleware/auth.middleware');

router.post('/create-payment-intent', protect, paymentController.createPaymentIntent);
router.post('/save-payment-method', protect, paymentController.savePaymentMethod);
router.get('/payment-methods', protect, paymentController.getPaymentMethods);
router.post('/refund/:orderId', protect, paymentController.processRefund);

// Webhook — raw body required (configured in app.js)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;

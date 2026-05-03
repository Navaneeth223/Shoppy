'use strict';

const paymentService = require('../services/payment.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const Order = require('../models/Order.model');

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found.');

  if (order.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Access denied.');
  }

  const { clientSecret, paymentIntentId } = await paymentService.createPaymentIntent({
    order,
    user: req.user,
  });

  ApiResponse.ok(res, 'Payment intent created.', { clientSecret, paymentIntentId });
});

const savePaymentMethod = asyncHandler(async (req, res) => {
  const { stripePaymentMethodId } = req.body;

  const paymentMethod = await paymentService.savePaymentMethod(req.user, stripePaymentMethodId);

  ApiResponse.created(res, 'Payment method saved.', paymentMethod);
});

const getPaymentMethods = asyncHandler(async (req, res) => {
  const PaymentMethod = require('../models/PaymentMethod.model');
  const methods = await PaymentMethod.find({ user: req.user._id }).lean();
  ApiResponse.ok(res, 'Payment methods fetched.', methods);
});

const processRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  const refund = await paymentService.processRefund(req.params.orderId, amount, reason);
  ApiResponse.ok(res, 'Refund processed.', refund);
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    throw ApiError.badRequest('Missing Stripe signature.');
  }

  const result = await paymentService.handleWebhook(req.body, signature);
  ApiResponse.ok(res, 'Webhook processed.', result);
});

module.exports = {
  createPaymentIntent,
  savePaymentMethod,
  getPaymentMethods,
  processRefund,
  handleWebhook,
};

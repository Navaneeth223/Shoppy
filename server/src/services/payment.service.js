'use strict';

const { getStripe } = require('../config/stripe');
const Order = require('../models/Order.model');
const User = require('../models/User.model');
const PaymentMethod = require('../models/PaymentMethod.model');
const Transaction = require('../models/Transaction.model');
const ApiError = require('../utils/ApiError');
const { toStripeAmount, fromStripeAmount } = require('../utils/currency');
const emailService = require('./email.service');
const notificationService = require('./notification.service');
const inventoryService = require('./inventory.service');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Creates or retrieves a Stripe Customer for a user.
 * @param {object} user - User document
 * @returns {Promise<string>} Stripe customer ID
 */
async function getOrCreateStripeCustomer(user) {
  const stripe = getStripe();
  if (!stripe) throw ApiError.serviceUnavailable('Payment service unavailable.');

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.fullName,
    metadata: { userId: user._id.toString() },
  });

  await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });

  return customer.id;
}

/**
 * Creates a Stripe PaymentIntent for an order.
 * @param {object} params
 * @returns {Promise<{clientSecret: string, paymentIntentId: string}>}
 */
async function createPaymentIntent({ order, user, currency = 'USD' }) {
  const stripe = getStripe();
  if (!stripe) throw ApiError.serviceUnavailable('Payment service unavailable.');

  const customerId = await getOrCreateStripeCustomer(user);
  const amountInCents = toStripeAmount(order.totalAmount, currency);

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amountInCents,
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: user._id.toString(),
      },
      description: `Nexus Commerce Order ${order.orderNumber}`,
      receipt_email: user.email,
      automatic_payment_methods: { enabled: true },
    },
    {
      idempotencyKey: `pi_${order._id.toString()}`,
    }
  );

  // Update order with payment intent ID
  await Order.findByIdAndUpdate(order._id, {
    'paymentMethod.stripePaymentIntentId': paymentIntent.id,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Handles Stripe webhook events.
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe-Signature header
 */
async function handleWebhook(payload, signature) {
  const stripe = getStripe();
  if (!stripe) throw ApiError.serviceUnavailable('Payment service unavailable.');

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('[Payment] Webhook signature verification failed:', err.message);
    throw ApiError.badRequest(`Webhook signature verification failed: ${err.message}`);
  }

  logger.info(`[Payment] Webhook received: ${event.type}`);

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    case 'charge.refunded':
      await handleChargeRefunded(event.data.object);
      break;

    case 'charge.dispute.created':
      await handleDisputeCreated(event.data.object);
      break;

    default:
      logger.info(`[Payment] Unhandled webhook event: ${event.type}`);
  }

  return { received: true };
}

async function handlePaymentSuccess(paymentIntent) {
  const order = await Order.findOne({
    'paymentMethod.stripePaymentIntentId': paymentIntent.id,
  }).populate('user');

  if (!order) {
    logger.warn(`[Payment] Order not found for PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  // Update order status
  order.paymentStatus = 'captured';
  order.orderStatus = 'confirmed';
  order.paymentMethod.stripeChargeId = paymentIntent.latest_charge;
  order.timeline.push({
    status: 'confirmed',
    message: 'Payment confirmed. Order is being processed.',
    actor: 'system',
  });

  await order.save();

  // Reserve inventory
  try {
    await inventoryService.reserveInventory(order);
  } catch (err) {
    logger.error('[Payment] Failed to reserve inventory:', err.message);
  }

  // Award loyalty points (1 point per $1 spent)
  const pointsEarned = Math.floor(order.totalAmount);
  await User.findByIdAndUpdate(order.user._id, {
    $inc: { loyaltyPoints: pointsEarned, totalOrders: 1, totalSpent: order.totalAmount },
  });

  order.loyaltyPointsEarned = pointsEarned;
  await order.save();

  // Send confirmation email
  try {
    await emailService.sendOrderConfirmation(order.user, order);
  } catch (err) {
    logger.error('[Payment] Failed to send order confirmation email:', err.message);
  }

  // Send in-app notification
  await notificationService.createNotification({
    userId: order.user._id,
    type: 'order_update',
    title: 'Order Confirmed!',
    body: `Your order ${order.orderNumber} has been confirmed and is being processed.`,
    link: `/profile/orders/${order._id}`,
    data: { orderId: order._id, orderNumber: order.orderNumber },
  });

  logger.info(`[Payment] Order ${order.orderNumber} confirmed.`);
}

async function handlePaymentFailed(paymentIntent) {
  const order = await Order.findOne({
    'paymentMethod.stripePaymentIntentId': paymentIntent.id,
  });

  if (!order) return;

  order.paymentStatus = 'failed';
  order.orderStatus = 'cancelled';
  order.timeline.push({
    status: 'cancelled',
    message: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
    actor: 'system',
  });

  await order.save();

  // Release any reserved inventory
  await inventoryService.releaseInventory(order);

  logger.warn(`[Payment] Payment failed for order ${order.orderNumber}`);
}

async function handleChargeRefunded(charge) {
  const order = await Order.findOne({
    'paymentMethod.stripeChargeId': charge.id,
  }).populate('user');

  if (!order) return;

  const refundAmount = fromStripeAmount(charge.amount_refunded, charge.currency);
  const isFullRefund = charge.refunded;

  order.paymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';
  order.refundAmount = refundAmount;
  order.refundedAt = new Date();
  order.stripeRefundId = charge.refunds?.data?.[0]?.id;

  if (isFullRefund) {
    order.orderStatus = 'refunded';
  }

  order.timeline.push({
    status: 'refunded',
    message: `Refund of $${refundAmount.toFixed(2)} processed.`,
    actor: 'system',
  });

  await order.save();

  // Send refund email
  try {
    await emailService.sendRefundProcessed(order.user, order, refundAmount);
  } catch (err) {
    logger.error('[Payment] Failed to send refund email:', err.message);
  }
}

async function handleDisputeCreated(charge) {
  logger.warn(`[Payment] Dispute created for charge: ${charge.id}`);
  // TODO: Notify admin and flag order
}

/**
 * Processes a refund for an order.
 * @param {string} orderId
 * @param {number} [amount] - Partial refund amount (full refund if not specified)
 * @param {string} reason
 */
async function processRefund(orderId, amount, reason = 'requested_by_customer') {
  const stripe = getStripe();
  if (!stripe) throw ApiError.serviceUnavailable('Payment service unavailable.');

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found.');

  if (!order.paymentMethod?.stripePaymentIntentId) {
    throw ApiError.badRequest('No payment found for this order.');
  }

  const refundAmount = amount ? toStripeAmount(amount) : undefined;

  const refund = await stripe.refunds.create(
    {
      payment_intent: order.paymentMethod.stripePaymentIntentId,
      amount: refundAmount,
      reason,
      metadata: { orderId: orderId.toString(), orderNumber: order.orderNumber },
    },
    {
      idempotencyKey: `refund_${orderId}_${Date.now()}`,
    }
  );

  return refund;
}

/**
 * Saves a payment method for a user.
 */
async function savePaymentMethod(user, stripePaymentMethodId) {
  const stripe = getStripe();
  if (!stripe) throw ApiError.serviceUnavailable('Payment service unavailable.');

  const customerId = await getOrCreateStripeCustomer(user);

  // Attach to customer
  await stripe.paymentMethods.attach(stripePaymentMethodId, { customer: customerId });

  // Get payment method details
  const pm = await stripe.paymentMethods.retrieve(stripePaymentMethodId);

  // Save to database
  const paymentMethod = await PaymentMethod.create({
    user: user._id,
    stripePaymentMethodId,
    type: pm.type,
    card: pm.card ? {
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
      country: pm.card.country,
      funding: pm.card.funding,
    } : undefined,
    billingDetails: pm.billing_details,
  });

  return paymentMethod;
}

module.exports = {
  getOrCreateStripeCustomer,
  createPaymentIntent,
  handleWebhook,
  processRefund,
  savePaymentMethod,
};

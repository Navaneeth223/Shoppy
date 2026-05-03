'use strict';

const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const Coupon = require('../models/Coupon.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');
const paymentService = require('../services/payment.service');
const inventoryService = require('../services/inventory.service');
const notificationService = require('../services/notification.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

// ─── Create Order ─────────────────────────────────────────────────────────────

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, shippingMethod, guestEmail } = req.body;

  const userId = req.user?._id;
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

  // Get cart
  const cartQuery = userId ? { user: userId } : { sessionId };
  const cart = await Cart.findOne(cartQuery).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty.');
  }

  // Validate inventory availability
  const { available, unavailableItems } = await inventoryService.checkAvailability(
    cart.items.map((item) => ({
      product: item.product._id,
      variantKey: item.variantKey,
      quantity: item.quantity,
    }))
  );

  if (!available) {
    throw ApiError.badRequest('Some items in your cart are no longer available.', unavailableItems);
  }

  // Calculate totals
  const subtotal = cart.subtotal;
  const shippingCost = shippingMethod?.cost || 0;
  const taxRate = 0.08; // 8% tax — in production, calculate by region
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const couponDiscount = cart.coupon?.discountAmount || 0;
  const shippingDiscount = cart.coupon?.type === 'free_shipping' ? shippingCost : 0;
  const discountAmount = couponDiscount + shippingDiscount;
  const totalAmount = Math.max(0, subtotal + shippingCost + taxAmount - discountAmount);

  // Generate order number
  const orderNumber = await Order.generateOrderNumber();

  // Build order items
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    seller: item.product.seller,
    variantKey: item.variantKey,
    variantLabel: item.variantLabel,
    quantity: item.quantity,
    price: item.price,
    title: item.product.title,
    image: item.product.primaryImage?.url,
    sku: item.product.sku,
    status: 'pending',
  }));

  // Create order
  const order = await Order.create({
    orderNumber,
    user: userId || req.user?._id,
    guestEmail: !userId ? guestEmail : undefined,
    items: orderItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    subtotal,
    shippingCost,
    taxAmount,
    discountAmount,
    couponCode: cart.coupon?.code,
    couponDiscount,
    totalAmount,
    currency: 'USD',
    shippingMethod,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    timeline: [
      {
        status: 'pending',
        message: 'Order placed. Awaiting payment.',
        actor: 'system',
      },
    ],
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Create Stripe PaymentIntent
  const user = req.user || { _id: order._id, email: guestEmail, fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}` };
  const { clientSecret, paymentIntentId } = await paymentService.createPaymentIntent({
    order,
    user,
  });

  // Mark coupon as used (will be confirmed on payment success)
  if (cart.coupon?.couponId) {
    await Coupon.findByIdAndUpdate(cart.coupon.couponId, {
      $inc: { usedCount: 1 },
    });
  }

  ApiResponse.created(res, 'Order created. Complete payment to confirm.', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    totalAmount: order.totalAmount,
    clientSecret,
    paymentIntentId,
  });
});

// ─── Get Order ────────────────────────────────────────────────────────────────

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'title slug images')
    .populate('items.seller', 'firstName lastName')
    .populate('user', 'firstName lastName email');

  if (!order) throw ApiError.notFound('Order not found.');

  // Check ownership
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !['admin', 'superadmin'].includes(req.user.role)
  ) {
    throw ApiError.forbidden('Access denied.');
  }

  ApiResponse.ok(res, 'Order fetched.', order);
});

// ─── Track Order (Public) ─────────────────────────────────────────────────────

const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({ orderNumber })
    .select('orderNumber orderStatus paymentStatus timeline shippingAddress estimatedDelivery items')
    .populate('items.product', 'title images');

  if (!order) throw ApiError.notFound('Order not found.');

  ApiResponse.ok(res, 'Order tracking info fetched.', {
    orderNumber: order.orderNumber,
    status: order.orderStatus,
    paymentStatus: order.paymentStatus,
    timeline: order.timeline,
    estimatedDelivery: order.estimatedDelivery,
    items: order.items.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      image: item.image,
      status: item.status,
      trackingNumber: item.trackingNumber,
      shippingCarrier: item.shippingCarrier,
    })),
  });
});

// ─── Cancel Order ─────────────────────────────────────────────────────────────

const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found.');

  if (order.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Access denied.');
  }

  if (!order.canBeCancelled) {
    throw ApiError.badRequest('This order cannot be cancelled at its current stage.');
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = reason || 'Cancelled by customer';
  order.timeline.push({
    status: 'cancelled',
    message: `Order cancelled by customer. Reason: ${reason || 'Not specified'}`,
    actor: 'customer',
    actorId: req.user._id,
  });

  await order.save();

  // Release inventory
  await inventoryService.releaseInventory(order);

  // Process refund if payment was captured
  if (order.paymentStatus === 'captured') {
    try {
      await paymentService.processRefund(order._id, null, 'requested_by_customer');
    } catch (err) {
      logger.error('[Order] Refund failed during cancellation:', err.message);
    }
  }

  // Send cancellation email
  try {
    await emailService.sendOrderCancelled(req.user, order);
  } catch (err) {
    logger.error('[Order] Failed to send cancellation email:', err.message);
  }

  ApiResponse.ok(res, 'Order cancelled successfully.', order);
});

// ─── Return Request ───────────────────────────────────────────────────────────

const requestReturn = asyncHandler(async (req, res) => {
  const { reason, items } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found.');

  if (order.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Access denied.');
  }

  if (!order.canBeReturned) {
    throw ApiError.badRequest('This order is not eligible for return.');
  }

  order.orderStatus = 'return_requested';
  order.returnReason = reason;
  order.timeline.push({
    status: 'return_requested',
    message: `Return requested. Reason: ${reason}`,
    actor: 'customer',
    actorId: req.user._id,
  });

  await order.save();

  // Notify seller(s)
  const sellerIds = [...new Set(order.items.map((item) => item.seller.toString()))];
  for (const sellerId of sellerIds) {
    await notificationService.createNotification({
      userId: sellerId,
      type: 'order_update',
      title: 'Return Request',
      body: `Customer has requested a return for order ${order.orderNumber}.`,
      link: `/seller-dashboard/orders/${order._id}`,
      data: { orderId: order._id },
      priority: 'high',
    });
  }

  ApiResponse.ok(res, 'Return request submitted.', order);
});

// ─── Get User Orders ──────────────────────────────────────────────────────────

const getUserOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status } = req.query;

  const filter = { user: req.user._id };
  if (status) filter.orderStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'title images slug')
      .lean(),
    Order.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Orders fetched.', orders, { page, limit, total });
});

module.exports = {
  createOrder,
  getOrder,
  trackOrder,
  cancelOrder,
  requestReturn,
  getUserOrders,
};

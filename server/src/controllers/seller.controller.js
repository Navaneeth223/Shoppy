'use strict';

const Seller = require('../models/Seller.model');
const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const Inventory = require('../models/Inventory.model');
const Transaction = require('../models/Transaction.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');
const { createSlug } = require('../utils/slugify');
const { uploadToCloudinary } = require('../config/cloudinary');
const emailService = require('../services/email.service');
const notificationService = require('../services/notification.service');

// ─── Apply to Become Seller ───────────────────────────────────────────────────

const applyAsSeller = asyncHandler(async (req, res) => {
  const existingSeller = await Seller.findOne({ user: req.user._id });
  if (existingSeller) {
    throw ApiError.conflict('You have already submitted a seller application.');
  }

  const { storeName, description, contactEmail, contactPhone, address } = req.body;

  const storeSlug = createSlug(storeName);

  // Check slug uniqueness
  const slugExists = await Seller.findOne({ storeSlug });
  if (slugExists) {
    throw ApiError.conflict('A store with this name already exists. Please choose a different name.');
  }

  const seller = await Seller.create({
    user: req.user._id,
    storeName,
    storeSlug,
    description,
    contactEmail: contactEmail || req.user.email,
    contactPhone,
    address,
    verificationStatus: 'pending',
  });

  ApiResponse.created(res, 'Seller application submitted. We will review it within 2-3 business days.', seller);
});

// ─── Get Own Seller Profile ───────────────────────────────────────────────────

const getMySellerProfile = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id }).populate('user', 'firstName lastName email avatar');
  if (!seller) throw ApiError.notFound('Seller profile not found.');

  ApiResponse.ok(res, 'Seller profile fetched.', seller);
});

// ─── Update Seller Profile ────────────────────────────────────────────────────

const updateSellerProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'storeName', 'description', 'contactEmail', 'contactPhone',
    'address', 'socialLinks', 'policies', 'payoutSchedule',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const seller = await Seller.findOneAndUpdate(
    { user: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!seller) throw ApiError.notFound('Seller profile not found.');

  ApiResponse.ok(res, 'Seller profile updated.', seller);
});

// ─── Get Seller Products ──────────────────────────────────────────────────────

const getSellerProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, sort = 'newest' } = req.query;

  const filter = { seller: req.user._id };
  if (status) filter.status = status;

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { basePrice: 1 },
    price_desc: { basePrice: -1 },
    bestseller: { soldCount: -1 },
  };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name')
      .populate('brand', 'name')
      .lean(),
    Product.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Products fetched.', products, { page, limit, total });
});

// ─── Get Seller Orders ────────────────────────────────────────────────────────

const getSellerOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status } = req.query;

  const filter = { 'items.seller': req.user._id };
  if (status) filter['items.status'] = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email')
      .lean(),
    Order.countDocuments(filter),
  ]);

  // Filter items to only show this seller's items
  const filteredOrders = orders.map((order) => ({
    ...order,
    items: order.items.filter((item) => item.seller.toString() === req.user._id.toString()),
  }));

  ApiResponse.paginated(res, 'Orders fetched.', filteredOrders, { page, limit, total });
});

// ─── Update Order Item Status ─────────────────────────────────────────────────

const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, shippingCarrier } = req.body;
  const { orderId, itemId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found.');

  const item = order.items.id(itemId);
  if (!item) throw ApiError.notFound('Order item not found.');

  if (item.seller.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only update your own order items.');
  }

  item.status = status;
  if (trackingNumber) item.trackingNumber = trackingNumber;
  if (shippingCarrier) item.shippingCarrier = shippingCarrier;
  if (status === 'shipped') item.shippedAt = new Date();
  if (status === 'delivered') item.deliveredAt = new Date();

  // Update overall order status based on items
  const allStatuses = order.items.map((i) => i.status);
  if (allStatuses.every((s) => s === 'delivered')) {
    order.orderStatus = 'delivered';
    order.deliveredAt = new Date();
  } else if (allStatuses.some((s) => s === 'shipped')) {
    order.orderStatus = 'shipped';
  }

  order.timeline.push({
    status,
    message: `Item "${item.title}" status updated to ${status}${trackingNumber ? `. Tracking: ${trackingNumber}` : ''}.`,
    actor: 'seller',
    actorId: req.user._id,
  });

  await order.save();

  // Notify customer
  await notificationService.createNotification({
    userId: order.user,
    type: 'order_update',
    title: `Order Update: ${status.replace(/_/g, ' ')}`,
    body: `Your item "${item.title}" has been ${status.replace(/_/g, ' ')}.`,
    link: `/profile/orders/${order._id}`,
    data: { orderId: order._id, orderNumber: order.orderNumber },
  });

  ApiResponse.ok(res, 'Order item status updated.', order);
});

// ─── Seller Analytics Overview ────────────────────────────────────────────────

const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

  const [
    currentPeriodOrders,
    previousPeriodOrders,
    totalProducts,
    outOfStockProducts,
    seller,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { 'items.seller': sellerId, createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'captured' } },
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      { $group: { _id: null, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, orders: { $addToSet: '$_id' } } },
    ]),
    Order.aggregate([
      { $match: { 'items.seller': sellerId, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, paymentStatus: 'captured' } },
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      { $group: { _id: null, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, orders: { $addToSet: '$_id' } } },
    ]),
    Product.countDocuments({ seller: sellerId, status: 'active' }),
    Product.countDocuments({ seller: sellerId, status: 'active', stock: 0 }),
    Seller.findOne({ user: sellerId }).select('rating totalRevenue pendingPayout'),
  ]);

  const current = currentPeriodOrders[0] || { revenue: 0, orders: [] };
  const previous = previousPeriodOrders[0] || { revenue: 0, orders: [] };

  const revenueChange = previous.revenue > 0
    ? ((current.revenue - previous.revenue) / previous.revenue) * 100
    : 0;

  const ordersChange = previous.orders.length > 0
    ? ((current.orders.length - previous.orders.length) / previous.orders.length) * 100
    : 0;

  ApiResponse.ok(res, 'Analytics overview fetched.', {
    revenue: {
      current: current.revenue,
      previous: previous.revenue,
      change: Math.round(revenueChange * 10) / 10,
    },
    orders: {
      current: current.orders.length,
      previous: previous.orders.length,
      change: Math.round(ordersChange * 10) / 10,
    },
    products: {
      total: totalProducts,
      outOfStock: outOfStockProducts,
    },
    rating: seller?.rating || { average: 0, count: 0 },
    totalRevenue: seller?.totalRevenue || 0,
    pendingPayout: seller?.pendingPayout || 0,
  });
});

// ─── Get Public Store Page ────────────────────────────────────────────────────

const getPublicStore = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({
    storeSlug: req.params.slug,
    verificationStatus: 'approved',
    isActive: true,
  }).populate('user', 'firstName lastName avatar createdAt');

  if (!seller) throw ApiError.notFound('Store not found.');

  ApiResponse.ok(res, 'Store fetched.', seller);
});

// ─── Get Store Products (Public) ──────────────────────────────────────────────

const getStoreProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const seller = await Seller.findOne({ storeSlug: req.params.slug }).select('user');
  if (!seller) throw ApiError.notFound('Store not found.');

  const [products, total] = await Promise.all([
    Product.find({ seller: seller.user, status: 'active', isPublished: true })
      .sort({ soldCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .lean(),
    Product.countDocuments({ seller: seller.user, status: 'active', isPublished: true }),
  ]);

  ApiResponse.paginated(res, 'Store products fetched.', products, { page, limit, total });
});

module.exports = {
  applyAsSeller,
  getMySellerProfile,
  updateSellerProfile,
  getSellerProducts,
  getSellerOrders,
  updateOrderItemStatus,
  getAnalyticsOverview,
  getPublicStore,
  getStoreProducts,
};

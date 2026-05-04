'use strict';

const FlashDeal = require('../models/FlashDeal.model');
const Product = require('../models/Product.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');
const notificationService = require('../services/notification.service');
const Wishlist = require('../models/Wishlist.model');

const getFlashDeals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const [deals, total] = await Promise.all([
    FlashDeal.find(filter)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('product', 'title slug images basePrice')
      .populate('seller', 'firstName lastName')
      .lean(),
    FlashDeal.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Flash deals fetched.', deals, { page, limit, total });
});

const getActiveFlashDeals = asyncHandler(async (req, res) => {
  const now = new Date();
  const deals = await FlashDeal.find({
    status: 'active',
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gt: now },
  })
    .sort({ endTime: 1 })
    .populate('product', 'title slug images basePrice stock')
    .lean();

  ApiResponse.ok(res, 'Active flash deals fetched.', deals);
});

const createFlashDeal = asyncHandler(async (req, res) => {
  const { productId, dealPrice, startTime, endTime, totalStock } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found.');

  // Check ownership
  if (
    product.seller.toString() !== req.user._id.toString() &&
    !['admin', 'superadmin'].includes(req.user.role)
  ) {
    throw ApiError.forbidden('You can only create flash deals for your own products.');
  }

  const discountPercentage = Math.round(((product.basePrice - dealPrice) / product.basePrice) * 100);

  const deal = await FlashDeal.create({
    title: `Flash Deal: ${product.title}`,
    product: productId,
    seller: product.seller,
    originalPrice: product.basePrice,
    dealPrice,
    discountPercentage,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    totalStock,
    isActive: true,
    status: new Date(startTime) <= new Date() ? 'active' : 'scheduled',
    createdBy: req.user._id,
  });

  // If starting now, update product
  if (deal.status === 'active') {
    await Product.findByIdAndUpdate(productId, {
      isFlashDeal: true,
      flashDealPrice: dealPrice,
      flashDealExpiry: new Date(endTime),
    });
  }

  // Notify users who wishlisted this product
  const wishlists = await Wishlist.find({ 'items.product': productId }).select('user').lean();
  if (wishlists.length > 0) {
    const userIds = wishlists.map((w) => w.user);
    await notificationService.createBulkNotifications(userIds, {
      type: 'flash_deal',
      title: `Flash Deal Alert! ${discountPercentage}% off`,
      body: `"${product.title}" is now on flash sale for $${dealPrice.toFixed(2)}!`,
      link: `/product/${product.slug}`,
      data: { productId, dealId: deal._id },
      priority: 'high',
    });
  }

  ApiResponse.created(res, 'Flash deal created.', deal);
});

const updateFlashDeal = asyncHandler(async (req, res) => {
  const deal = await FlashDeal.findById(req.params.id);
  if (!deal) throw ApiError.notFound('Flash deal not found.');

  if (
    deal.seller.toString() !== req.user._id.toString() &&
    !['admin', 'superadmin'].includes(req.user.role)
  ) {
    throw ApiError.forbidden('Permission denied.');
  }

  Object.assign(deal, req.body);
  await deal.save();

  ApiResponse.ok(res, 'Flash deal updated.', deal);
});

const cancelFlashDeal = asyncHandler(async (req, res) => {
  const deal = await FlashDeal.findById(req.params.id);
  if (!deal) throw ApiError.notFound('Flash deal not found.');

  deal.status = 'cancelled';
  deal.isActive = false;
  await deal.save();

  // Remove flash deal from product
  await Product.findByIdAndUpdate(deal.product, {
    isFlashDeal: false,
    flashDealPrice: null,
    flashDealExpiry: null,
  });

  ApiResponse.ok(res, 'Flash deal cancelled.');
});

module.exports = {
  getFlashDeals,
  getActiveFlashDeals,
  createFlashDeal,
  updateFlashDeal,
  cancelFlashDeal,
};

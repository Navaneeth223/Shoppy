'use strict';

const User = require('../models/User.model');
const Seller = require('../models/Seller.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const Review = require('../models/Review.model');
const Category = require('../models/Category.model');
const Banner = require('../models/Banner.model');
const Coupon = require('../models/Coupon.model');
const FlashDeal = require('../models/FlashDeal.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');
const emailService = require('../services/email.service');
const notificationService = require('../services/notification.service');
const { safeDelPattern } = require('../config/redis');

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    totalOrders,
    recentOrders,
    totalRevenue,
    recentRevenue,
    totalProducts,
    pendingReviews,
    pendingSellers,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: thirtyDaysAgo } }),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Order.aggregate([
      { $match: { paymentStatus: 'captured' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'captured', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Product.countDocuments({ status: 'active' }),
    Review.countDocuments({ status: 'pending' }),
    Seller.countDocuments({ verificationStatus: 'pending' }),
  ]);

  ApiResponse.ok(res, 'Dashboard data fetched.', {
    users: { total: totalUsers, new: newUsers },
    orders: { total: totalOrders, recent: recentOrders },
    revenue: {
      total: totalRevenue[0]?.total || 0,
      recent: recentRevenue[0]?.total || 0,
    },
    products: { total: totalProducts },
    pendingReviews,
    pendingSellers,
  });
});

// ─── Users ────────────────────────────────────────────────────────────────────

const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { role, isBanned, search } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Users fetched.', users, { page, limit, total });
});

const banUser = asyncHandler(async (req, res) => {
  const { isBanned, banReason } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned, banReason: isBanned ? banReason : null },
    { new: true }
  );

  if (!user) throw ApiError.notFound('User not found.');

  ApiResponse.ok(res, `User ${isBanned ? 'banned' : 'unbanned'} successfully.`, user);
});

const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['customer', 'seller', 'admin'].includes(role)) {
    throw ApiError.badRequest('Invalid role. Allowed: customer, seller, admin.');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw ApiError.notFound('User not found.');

  ApiResponse.ok(res, 'User role updated.', user);
});

// ─── Sellers ──────────────────────────────────────────────────────────────────

const getSellers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status } = req.query;

  const filter = {};
  if (status) filter.verificationStatus = status;

  const [sellers, total] = await Promise.all([
    Seller.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email avatar createdAt')
      .lean(),
    Seller.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Sellers fetched.', sellers, { page, limit, total });
});

const approveSeller = asyncHandler(async (req, res) => {
  const { status, reason } = req.body; // 'approved' or 'rejected'

  const seller = await Seller.findByIdAndUpdate(
    req.params.id,
    {
      verificationStatus: status,
      isVerified: status === 'approved',
      rejectionReason: status === 'rejected' ? reason : null,
    },
    { new: true }
  ).populate('user');

  if (!seller) throw ApiError.notFound('Seller not found.');

  // Update user role if approved
  if (status === 'approved') {
    await User.findByIdAndUpdate(seller.user._id, { role: 'seller' });
  }

  // Send notification
  try {
    await emailService.sendSellerStatusUpdate(seller.user, status, reason);
    await notificationService.createNotification({
      userId: seller.user._id,
      type: status === 'approved' ? 'seller_approved' : 'seller_rejected',
      title: `Seller Application ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      body: status === 'approved'
        ? 'Congratulations! Your seller application has been approved.'
        : `Your seller application was not approved. ${reason || ''}`,
      link: status === 'approved' ? '/seller-dashboard' : '/contact',
    });
  } catch (err) {
    // Non-critical
  }

  ApiResponse.ok(res, `Seller ${status}.`, seller);
});

// ─── Products ─────────────────────────────────────────────────────────────────

const getAdminProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, seller, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (seller) filter.seller = seller;
  if (search) filter.$text = { $search: search };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('seller', 'firstName lastName email')
      .populate('category', 'name')
      .lean(),
    Product.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Products fetched.', products, { page, limit, total });
});

const featureProduct = asyncHandler(async (req, res) => {
  const { isFeatured, isTrending, isNewArrival } = req.body;

  const update = {};
  if (isFeatured !== undefined) update.isFeatured = isFeatured;
  if (isTrending !== undefined) update.isTrending = isTrending;
  if (isNewArrival !== undefined) update.isNewArrival = isNewArrival;

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) throw ApiError.notFound('Product not found.');

  await safeDelPattern('cache:/api/v1/products*');

  ApiResponse.ok(res, 'Product updated.', product);
});

// ─── Orders ───────────────────────────────────────────────────────────────────

const getAdminOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, paymentStatus } = req.query;

  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email')
      .lean(),
    Order.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Orders fetched.', orders, { page, limit, total });
});

// ─── Reviews ──────────────────────────────────────────────────────────────────

const getAdminReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email')
      .populate('product', 'title slug')
      .lean(),
    Review.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Reviews fetched.', reviews, { page, limit, total });
});

const approveReview = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status, adminNote },
    { new: true }
  );

  if (!review) throw ApiError.notFound('Review not found.');

  ApiResponse.ok(res, `Review ${status}.`, review);
});

// ─── Categories ───────────────────────────────────────────────────────────────

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ level: 1, order: 1 }).lean();
  ApiResponse.ok(res, 'Categories fetched.', categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const { createSlug: makeSlug } = require('../utils/slugify');
  const categoryData = {
    ...req.body,
    slug: req.body.slug || makeSlug(req.body.name),
  };

  const category = await Category.create(categoryData);
  await safeDelPattern('cache:/api/v1/categories*');

  ApiResponse.created(res, 'Category created.', category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) throw ApiError.notFound('Category not found.');

  await safeDelPattern('cache:/api/v1/categories*');

  ApiResponse.ok(res, 'Category updated.', category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    throw ApiError.badRequest(`Cannot delete category with ${productCount} products. Reassign products first.`);
  }

  await Category.findByIdAndDelete(req.params.id);
  await safeDelPattern('cache:/api/v1/categories*');

  ApiResponse.noContent(res);
});

// ─── Banners ──────────────────────────────────────────────────────────────────

const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 }).lean();
  ApiResponse.ok(res, 'Banners fetched.', banners);
});

const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create({ ...req.body, createdBy: req.user._id });
  ApiResponse.created(res, 'Banner created.', banner);
});

const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) throw ApiError.notFound('Banner not found.');
  ApiResponse.ok(res, 'Banner updated.', banner);
});

const deleteBanner = asyncHandler(async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  ApiResponse.noContent(res);
});

// ─── Platform Analytics ───────────────────────────────────────────────────────

const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = 'monthly', year = new Date().getFullYear() } = req.query;

  let groupBy;
  if (period === 'daily') {
    groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
  } else if (period === 'weekly') {
    groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
  } else {
    groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
  }

  const revenue = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'captured',
        createdAt: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  ApiResponse.ok(res, 'Revenue analytics fetched.', revenue);
});

module.exports = {
  getDashboard,
  getUsers,
  banUser,
  changeUserRole,
  getSellers,
  approveSeller,
  getAdminProducts,
  featureProduct,
  getAdminOrders,
  getAdminReviews,
  approveReview,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getRevenueAnalytics,
};

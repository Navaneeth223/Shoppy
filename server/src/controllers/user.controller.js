'use strict';

const User = require('../models/User.model');
const Address = require('../models/Address.model');
const Wishlist = require('../models/Wishlist.model');
const Notification = require('../models/Notification.model');
const Review = require('../models/Review.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// ─── Get Current User ─────────────────────────────────────────────────────────

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('defaultAddress')
    .lean();

  ApiResponse.ok(res, 'Profile fetched.', user);
});

// ─── Update Profile ───────────────────────────────────────────────────────────

const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'preferences'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.ok(res, 'Profile updated.', user);
});

// ─── Change Password ──────────────────────────────────────────────────────────

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    throw ApiError.unauthorized('Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  ApiResponse.ok(res, 'Password changed successfully.');
});

// ─── Upload Avatar ────────────────────────────────────────────────────────────

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image provided.');

  const user = await User.findById(req.user._id);

  // Delete old avatar from Cloudinary
  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'nexus-commerce/avatars',
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' },
    ],
  });

  user.avatar = { url: result.secure_url, publicId: result.public_id };
  await user.save({ validateBeforeSave: false });

  ApiResponse.ok(res, 'Avatar updated.', { avatar: user.avatar });
});

// ─── Deactivate Account ───────────────────────────────────────────────────────

const deactivateAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  res.clearCookie('refreshToken');
  ApiResponse.ok(res, 'Account deactivated. Contact support to reactivate.');
});

// ─── Addresses ────────────────────────────────────────────────────────────────

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  ApiResponse.ok(res, 'Addresses fetched.', addresses);
});

const addAddress = asyncHandler(async (req, res) => {
  const addressData = { ...req.body, user: req.user._id };

  // If this is the first address or marked as default, unset other defaults
  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create(addressData);

  // Set as default address on user if first address
  const addressCount = await Address.countDocuments({ user: req.user._id });
  if (addressCount === 1) {
    await User.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
  }

  ApiResponse.created(res, 'Address added.', address);
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound('Address not found.');

  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  Object.assign(address, req.body);
  await address.save();

  ApiResponse.ok(res, 'Address updated.', address);
});

const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound('Address not found.');

  // If deleted address was default, set another as default
  if (address.isDefault) {
    const nextAddress = await Address.findOne({ user: req.user._id });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
      await User.findByIdAndUpdate(req.user._id, { defaultAddress: nextAddress._id });
    } else {
      await User.findByIdAndUpdate(req.user._id, { defaultAddress: null });
    }
  }

  ApiResponse.noContent(res);
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound('Address not found.');

  await Address.updateMany({ user: req.user._id }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  await User.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });

  ApiResponse.ok(res, 'Default address updated.', address);
});

// ─── Wishlist ─────────────────────────────────────────────────────────────────

const getWishlist = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    return ApiResponse.ok(res, 'Wishlist fetched.', { items: [], itemCount: 0 });
  }

  await wishlist.populate({
    path: 'items.product',
    select: 'title slug images basePrice salePrice stock status ratings brand',
    populate: { path: 'brand', select: 'name' },
    options: { skip, limit },
  });

  ApiResponse.ok(res, 'Wishlist fetched.', {
    items: wishlist.items,
    itemCount: wishlist.itemCount,
  });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, items: [] });
  }

  const alreadyExists = wishlist.items.some(
    (item) => item.product.toString() === productId
  );

  if (alreadyExists) {
    return ApiResponse.ok(res, 'Product already in wishlist.');
  }

  const product = await require('../models/Product.model').findById(productId).select('basePrice');
  wishlist.items.push({
    product: productId,
    priceAtAdd: product?.basePrice,
  });

  await wishlist.save();

  // Increment product wishlist count
  await require('../models/Product.model').findByIdAndUpdate(productId, {
    $inc: { wishlistCount: 1 },
  });

  ApiResponse.ok(res, 'Added to wishlist.', { itemCount: wishlist.itemCount });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return ApiResponse.ok(res, 'Item removed from wishlist.');

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId
  );

  await wishlist.save();

  await require('../models/Product.model').findByIdAndUpdate(productId, {
    $inc: { wishlistCount: -1 },
  });

  ApiResponse.ok(res, 'Removed from wishlist.', { itemCount: wishlist.itemCount });
});

// ─── Notifications ────────────────────────────────────────────────────────────

const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { limit: 20 });

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  ApiResponse.paginated(res, 'Notifications fetched.', { notifications, unreadCount }, { page, limit, total });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: new Date() }
  );
  ApiResponse.ok(res, 'Notification marked as read.');
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  ApiResponse.ok(res, 'All notifications marked as read.');
});

// ─── Loyalty Points ───────────────────────────────────────────────────────────

const getLoyaltyInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('loyaltyPoints membershipTier totalOrders totalSpent');

  const tierBenefits = {
    bronze: { earnRate: 1, freeShippingThreshold: 100, discount: 0 },
    silver: { earnRate: 1.25, freeShippingThreshold: 75, discount: 5 },
    gold: { earnRate: 1.5, freeShippingThreshold: 50, discount: 10 },
    platinum: { earnRate: 2, freeShippingThreshold: 0, discount: 15 },
  };

  const nextTierThresholds = { bronze: 500, silver: 2000, gold: 5000, platinum: null };

  ApiResponse.ok(res, 'Loyalty info fetched.', {
    points: user.loyaltyPoints,
    tier: user.membershipTier,
    benefits: tierBenefits[user.membershipTier],
    nextTierPoints: nextTierThresholds[user.membershipTier],
    totalOrders: user.totalOrders,
    totalSpent: user.totalSpent,
  });
});

// ─── Reviews Written ──────────────────────────────────────────────────────────

const getMyReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const [reviews, total] = await Promise.all([
    Review.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('product', 'title slug images'),
    Review.countDocuments({ user: req.user._id }),
  ]);

  ApiResponse.paginated(res, 'Reviews fetched.', reviews, { page, limit, total });
});

module.exports = {
  getMe,
  updateMe,
  changePassword,
  uploadAvatar,
  deactivateAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getLoyaltyInfo,
  getMyReviews,
};

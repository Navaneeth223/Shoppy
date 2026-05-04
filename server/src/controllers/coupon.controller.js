'use strict';

const Coupon = require('../models/Coupon.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');

const getCoupons = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};

  // Sellers see only their own coupons; admins see all
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    filter.createdBy = req.user._id;
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Coupons fetched.', coupons, { page, limit, total });
});

const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found.');
  ApiResponse.ok(res, 'Coupon fetched.', coupon);
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
  ApiResponse.created(res, 'Coupon created.', coupon);
});

const updateCoupon = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    filter.createdBy = req.user._id;
  }

  const coupon = await Coupon.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
  if (!coupon) throw ApiError.notFound('Coupon not found.');

  ApiResponse.ok(res, 'Coupon updated.', coupon);
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    filter.createdBy = req.user._id;
  }

  const coupon = await Coupon.findOneAndDelete(filter);
  if (!coupon) throw ApiError.notFound('Coupon not found.');

  ApiResponse.noContent(res);
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  if (!coupon) throw ApiError.badRequest('Invalid or expired coupon code.');

  if (coupon.totalUsageLimit !== null && coupon.usedCount >= coupon.totalUsageLimit) {
    throw ApiError.badRequest('This coupon has reached its usage limit.');
  }

  if (orderAmount && orderAmount < coupon.minOrderAmount) {
    throw ApiError.badRequest(`Minimum order amount of $${coupon.minOrderAmount} required.`);
  }

  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = (orderAmount * coupon.value) / 100;
    if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
  } else if (coupon.type === 'fixed_amount') {
    discountAmount = Math.min(coupon.value, orderAmount || coupon.value);
  }

  ApiResponse.ok(res, 'Coupon is valid.', {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount,
    description: coupon.description,
  });
});

module.exports = { getCoupons, getCoupon, createCoupon, updateCoupon, deleteCoupon, validateCoupon };

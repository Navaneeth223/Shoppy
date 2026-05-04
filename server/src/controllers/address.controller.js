'use strict';

const Address = require('../models/Address.model');
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  ApiResponse.ok(res, 'Addresses fetched.', addresses);
});

const addAddress = asyncHandler(async (req, res) => {
  const { isDefault } = req.body;

  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create({ ...req.body, user: req.user._id });

  // Set as default if first address
  const count = await Address.countDocuments({ user: req.user._id });
  if (count === 1) {
    address.isDefault = true;
    await address.save();
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

  if (address.isDefault) {
    const next = await Address.findOne({ user: req.user._id });
    if (next) {
      next.isDefault = true;
      await next.save();
      await User.findByIdAndUpdate(req.user._id, { defaultAddress: next._id });
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

  ApiResponse.ok(res, 'Default address set.', address);
});

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };

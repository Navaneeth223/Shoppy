'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const Wishlist = require('../../models/Wishlist.model');
const Product = require('../../models/Product.model');

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'title slug images basePrice salePrice stock status ratings brand',
      populate: { path: 'brand', select: 'name' },
    });

  if (!wishlist) {
    return ApiResponse.ok(res, 'Wishlist fetched.', { items: [], itemCount: 0 });
  }

  ApiResponse.ok(res, 'Wishlist fetched.', {
    items: wishlist.items,
    itemCount: wishlist.itemCount,
  });
}));

router.post('/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, items: [] });
  }

  const exists = wishlist.items.some((item) => item.product.toString() === productId);
  if (!exists) {
    const product = await Product.findById(productId).select('basePrice');
    wishlist.items.push({ product: productId, priceAtAdd: product?.basePrice });
    await wishlist.save();
    await Product.findByIdAndUpdate(productId, { $inc: { wishlistCount: 1 } });
  }

  ApiResponse.ok(res, 'Added to wishlist.', { itemCount: wishlist.itemCount });
}));

router.delete('/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.items = wishlist.items.filter((item) => item.product.toString() !== productId);
    await wishlist.save();
    await Product.findByIdAndUpdate(productId, { $inc: { wishlistCount: -1 } });
  }

  ApiResponse.ok(res, 'Removed from wishlist.');
}));

module.exports = router;

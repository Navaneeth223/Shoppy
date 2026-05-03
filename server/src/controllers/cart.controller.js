'use strict';

const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const Coupon = require('../models/Coupon.model');
const Inventory = require('../models/Inventory.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Gets or creates a cart for the current user/session.
 */
async function getOrCreateCart(req) {
  const userId = req.user?._id;
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

  let cart;

  if (userId) {
    cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
  } else if (sessionId) {
    cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = await Cart.create({ sessionId, items: [] });
    }
  } else {
    throw ApiError.badRequest('Session ID required for guest cart.');
  }

  return cart;
}

// ─── Get Cart ─────────────────────────────────────────────────────────────────

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req);

  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'title slug images basePrice salePrice stock status seller brand',
    populate: { path: 'brand', select: 'name' },
  });

  // Validate items (remove deleted/inactive products)
  const validItems = cart.items.filter(
    (item) => item.product && item.product.status === 'active'
  );

  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  ApiResponse.ok(res, 'Cart fetched successfully.', {
    items: cart.items,
    coupon: cart.coupon,
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    total: cart.total,
  });
});

// ─── Add Item to Cart ─────────────────────────────────────────────────────────

const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantKey = 'default', variantLabel = '', quantity = 1 } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product || product.status !== 'active' || !product.isPublished) {
    throw ApiError.notFound('Product not found or unavailable.');
  }

  // Check inventory
  const inventory = await Inventory.findOne({ product: productId, variantKey });
  if (inventory && inventory.availableStock < quantity) {
    throw ApiError.badRequest(
      `Only ${inventory.availableStock} units available for this variant.`
    );
  }

  const cart = await getOrCreateCart(req);

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.variantKey === variantKey
  );

  const price = product.effectivePrice || product.basePrice;

  if (existingItemIndex > -1) {
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    // Check inventory for new total quantity
    if (inventory && inventory.availableStock < newQuantity) {
      throw ApiError.badRequest(
        `Cannot add more. Only ${inventory.availableStock} units available.`
      );
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = price; // Update price
  } else {
    cart.items.push({
      product: productId,
      variantKey,
      variantLabel,
      quantity,
      price,
      title: product.title,
      image: product.primaryImage?.url,
      seller: product.seller,
    });
  }

  await cart.save();

  ApiResponse.ok(res, 'Item added to cart.', {
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    total: cart.total,
  });
});

// ─── Update Cart Item ─────────────────────────────────────────────────────────

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  if (quantity < 1) {
    throw ApiError.badRequest('Quantity must be at least 1.');
  }

  const cart = await getOrCreateCart(req);
  const item = cart.items.id(itemId);

  if (!item) throw ApiError.notFound('Cart item not found.');

  // Check inventory
  const inventory = await Inventory.findOne({
    product: item.product,
    variantKey: item.variantKey,
  });

  if (inventory && inventory.availableStock < quantity) {
    throw ApiError.badRequest(
      `Only ${inventory.availableStock} units available.`
    );
  }

  item.quantity = quantity;
  await cart.save();

  ApiResponse.ok(res, 'Cart updated.', {
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    total: cart.total,
  });
});

// ─── Remove Cart Item ─────────────────────────────────────────────────────────

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req);
  cart.items.pull(req.params.itemId);
  await cart.save();

  ApiResponse.ok(res, 'Item removed from cart.', {
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    total: cart.total,
  });
});

// ─── Clear Cart ───────────────────────────────────────────────────────────────

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req);
  cart.items = [];
  cart.coupon = undefined;
  await cart.save();

  ApiResponse.ok(res, 'Cart cleared.');
});

// ─── Apply Coupon ─────────────────────────────────────────────────────────────

const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const cart = await getOrCreateCart(req);

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  if (!coupon) {
    throw ApiError.badRequest('Invalid or expired coupon code.');
  }

  // Check total usage limit
  if (coupon.totalUsageLimit !== null && coupon.usedCount >= coupon.totalUsageLimit) {
    throw ApiError.badRequest('This coupon has reached its usage limit.');
  }

  // Check per-user usage
  if (req.user) {
    const userUsage = coupon.usedBy.filter(
      (u) => u.user.toString() === req.user._id.toString()
    ).length;

    if (userUsage >= coupon.usageLimitPerUser) {
      throw ApiError.badRequest('You have already used this coupon the maximum number of times.');
    }

    // Check first-time only
    if (coupon.isFirstTimeOnly) {
      const Order = require('../models/Order.model');
      const hasOrders = await Order.exists({ user: req.user._id, paymentStatus: 'captured' });
      if (hasOrders) {
        throw ApiError.badRequest('This coupon is only valid for first-time orders.');
      }
    }
  }

  // Check minimum order amount
  if (cart.subtotal < coupon.minOrderAmount) {
    throw ApiError.badRequest(
      `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required for this coupon.`
    );
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = (cart.subtotal * coupon.value) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else if (coupon.type === 'fixed_amount') {
    discountAmount = Math.min(coupon.value, cart.subtotal);
  } else if (coupon.type === 'free_shipping') {
    discountAmount = 0; // Applied at checkout
  }

  cart.coupon = {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount,
    couponId: coupon._id,
  };

  await cart.save();

  ApiResponse.ok(res, 'Coupon applied successfully.', {
    coupon: cart.coupon,
    subtotal: cart.subtotal,
    discount: discountAmount,
    total: cart.total,
  });
});

// ─── Remove Coupon ────────────────────────────────────────────────────────────

const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req);
  cart.coupon = undefined;
  await cart.save();

  ApiResponse.ok(res, 'Coupon removed.', {
    subtotal: cart.subtotal,
    total: cart.total,
  });
});

// ─── Merge Guest Cart ─────────────────────────────────────────────────────────

const mergeCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId || !req.user) {
    throw ApiError.badRequest('Session ID and authentication required.');
  }

  const guestCart = await Cart.findOne({ sessionId });
  if (!guestCart || guestCart.items.length === 0) {
    return ApiResponse.ok(res, 'No guest cart to merge.');
  }

  let userCart = await Cart.findOne({ user: req.user._id });
  if (!userCart) {
    userCart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Merge items
  for (const guestItem of guestCart.items) {
    const existingIndex = userCart.items.findIndex(
      (item) =>
        item.product.toString() === guestItem.product.toString() &&
        item.variantKey === guestItem.variantKey
    );

    if (existingIndex > -1) {
      userCart.items[existingIndex].quantity += guestItem.quantity;
    } else {
      userCart.items.push(guestItem);
    }
  }

  await userCart.save();

  // Delete guest cart
  await Cart.deleteOne({ sessionId });

  ApiResponse.ok(res, 'Cart merged successfully.', {
    itemCount: userCart.itemCount,
    subtotal: userCart.subtotal,
    total: userCart.total,
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  mergeCart,
};

'use strict';

const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'packed',
  'shipped', 'out_for_delivery', 'delivered',
  'cancelled', 'return_requested', 'return_approved', 'returned', 'refunded',
];

const PAYMENT_STATUSES = ['pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'];

const USER_ROLES = ['customer', 'seller', 'admin', 'superadmin'];

const MEMBERSHIP_TIERS = ['bronze', 'silver', 'gold', 'platinum'];

const TIER_THRESHOLDS = { bronze: 0, silver: 500, gold: 2000, platinum: 5000 };

const LOYALTY_POINTS_PER_DOLLAR = 1;

const FREE_SHIPPING_THRESHOLD = 75;

const DEFAULT_COMMISSION_RATE = 0.10;

const MAX_CART_ITEMS = 50;

const MAX_WISHLIST_ITEMS = 200;

const MAX_PRODUCT_IMAGES = 10;

const MAX_REVIEW_IMAGES = 5;

const RETURN_WINDOW_DAYS = 30;

const COUPON_TYPES = ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'];

module.exports = {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  USER_ROLES,
  MEMBERSHIP_TIERS,
  TIER_THRESHOLDS,
  LOYALTY_POINTS_PER_DOLLAR,
  FREE_SHIPPING_THRESHOLD,
  DEFAULT_COMMISSION_RATE,
  MAX_CART_ITEMS,
  MAX_WISHLIST_ITEMS,
  MAX_PRODUCT_IMAGES,
  MAX_REVIEW_IMAGES,
  RETURN_WINDOW_DAYS,
  COUPON_TYPES,
};

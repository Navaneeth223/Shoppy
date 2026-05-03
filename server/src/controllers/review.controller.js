'use strict';

const Review = require('../models/Review.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');
const { uploadToCloudinary } = require('../config/cloudinary');

// ─── Get Product Reviews ──────────────────────────────────────────────────────

const getProductReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { rating, sort = 'newest', hasMedia } = req.query;

  const filter = {
    product: req.params.id,
    status: 'approved',
  };

  if (rating) filter.rating = parseInt(rating);
  if (hasMedia === 'true') filter['images.0'] = { $exists: true };

  let sortQuery = {};
  switch (sort) {
    case 'helpful': sortQuery = { helpfulVotes: -1 }; break;
    case 'rating_high': sortQuery = { rating: -1 }; break;
    case 'rating_low': sortQuery = { rating: 1 }; break;
    case 'newest':
    default: sortQuery = { createdAt: -1 };
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName avatar membershipTier')
      .lean(),
    Review.countDocuments(filter),
  ]);

  // Add helpful vote status for authenticated users
  const reviewsWithVoteStatus = reviews.map((review) => ({
    ...review,
    userVote: req.user
      ? review.helpfulVotes?.includes(req.user._id.toString())
        ? 'helpful'
        : review.unhelpfulVotes?.includes(req.user._id.toString())
        ? 'unhelpful'
        : null
      : null,
    helpfulCount: review.helpfulVotes?.length || 0,
    unhelpfulCount: review.unhelpfulVotes?.length || 0,
  }));

  ApiResponse.paginated(res, 'Reviews fetched.', reviewsWithVoteStatus, { page, limit, total });
});

// ─── Create Review ────────────────────────────────────────────────────────────

const createReview = asyncHandler(async (req, res) => {
  const { rating, title, body, orderId } = req.body;
  const productId = req.params.id;

  // Verify the user has purchased this product
  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    'items.product': productId,
    orderStatus: 'delivered',
  });

  if (!order) {
    throw ApiError.forbidden('You can only review products you have purchased and received.');
  }

  // Check if review already exists
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id,
    order: orderId,
  });

  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this product for this order.');
  }

  // Upload review images if provided
  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, {
        folder: 'nexus-commerce/reviews',
        transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }],
      });
      images.push({ url: result.secure_url, publicId: result.public_id });
    }
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: orderId,
    rating,
    title,
    body,
    images,
    isVerifiedPurchase: true,
    status: 'pending', // Requires moderation
  });

  ApiResponse.created(res, 'Review submitted. It will be visible after moderation.', review);
});

// ─── Vote on Review ───────────────────────────────────────────────────────────

const voteReview = asyncHandler(async (req, res) => {
  const { vote } = req.body; // 'helpful' or 'unhelpful'
  const review = await Review.findById(req.params.reviewId);

  if (!review) throw ApiError.notFound('Review not found.');

  const userId = req.user._id;

  // Remove existing votes
  review.helpfulVotes = review.helpfulVotes.filter((id) => id.toString() !== userId.toString());
  review.unhelpfulVotes = review.unhelpfulVotes.filter((id) => id.toString() !== userId.toString());

  // Add new vote
  if (vote === 'helpful') {
    review.helpfulVotes.push(userId);
  } else if (vote === 'unhelpful') {
    review.unhelpfulVotes.push(userId);
  }

  await review.save();

  ApiResponse.ok(res, 'Vote recorded.', {
    helpfulCount: review.helpfulVotes.length,
    unhelpfulCount: review.unhelpfulVotes.length,
  });
});

// ─── Seller Reply ─────────────────────────────────────────────────────────────

const replyToReview = asyncHandler(async (req, res) => {
  const { body } = req.body;
  const review = await Review.findById(req.params.reviewId).populate('product', 'seller');

  if (!review) throw ApiError.notFound('Review not found.');

  if (review.product.seller.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the product seller can reply to reviews.');
  }

  review.sellerReply = { body, createdAt: new Date() };
  await review.save();

  ApiResponse.ok(res, 'Reply added.', review.sellerReply);
});

// ─── Moderate Review (Admin) ──────────────────────────────────────────────────

const moderateReview = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;

  const review = await Review.findByIdAndUpdate(
    req.params.reviewId,
    { status, adminNote },
    { new: true }
  );

  if (!review) throw ApiError.notFound('Review not found.');

  ApiResponse.ok(res, `Review ${status}.`, review);
});

module.exports = {
  getProductReviews,
  createReview,
  voteReview,
  replyToReview,
  moderateReview,
};

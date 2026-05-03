'use strict';

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Review title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Review body is required'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [5000, 'Review cannot exceed 5000 characters'],
    },
    images: [
      {
        url: String,
        publicId: String,
        alt: String,
      },
    ],
    videos: [
      {
        url: String,
        publicId: String,
        thumbnail: String,
      },
    ],
    isVerifiedPurchase: { type: Boolean, default: true },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    unhelpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending',
    },
    sellerReply: {
      body: String,
      createdAt: Date,
    },
    adminNote: { type: String, default: null },
    flagReason: { type: String, default: null },
    variantPurchased: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.virtual('helpfulCount').get(function () {
  return this.helpfulVotes ? this.helpfulVotes.length : 0;
});

reviewSchema.virtual('unhelpfulCount').get(function () {
  return this.unhelpfulVotes ? this.unhelpfulVotes.length : 0;
});

// One review per user per product per order
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1, status: 1, rating: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });

// ─── Post-save: update product ratings ───────────────────────────────────────

reviewSchema.post('save', async function () {
  await updateProductRatings(this.product);
});

reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await updateProductRatings(doc.product);
});

async function updateProductRatings(productId) {
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
        dist1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        dist2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        dist3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        dist4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        dist5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);

  if (stats.length > 0) {
    const s = stats[0];
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(s.average * 10) / 10,
      'ratings.count': s.count,
      'ratings.distribution.1': s.dist1,
      'ratings.distribution.2': s.dist2,
      'ratings.distribution.3': s.dist3,
      'ratings.distribution.4': s.dist4,
      'ratings.distribution.5': s.dist5,
      reviewCount: s.count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0,
      'ratings.distribution.1': 0,
      'ratings.distribution.2': 0,
      'ratings.distribution.3': 0,
      'ratings.distribution.4': 0,
      'ratings.distribution.5': 0,
      reviewCount: 0,
    });
  }
}

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

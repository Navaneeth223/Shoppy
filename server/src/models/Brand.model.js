'use strict';

const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    logo: {
      url: String,
      publicId: String,
      alt: String,
    },
    banner: {
      url: String,
      publicId: String,
    },
    website: { type: String, trim: true },
    country: { type: String, trim: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    productCount: { type: Number, default: 0 },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    socialLinks: {
      instagram: String,
      twitter: String,
      facebook: String,
      youtube: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

brandSchema.index({ slug: 1 }, { unique: true });
brandSchema.index({ isActive: 1, isFeatured: 1 });
brandSchema.index({ name: 'text' });

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;

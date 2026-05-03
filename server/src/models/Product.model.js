'use strict';

const mongoose = require('mongoose');
const { createSlug } = require('../utils/slugify');

const variantOptionSchema = new mongoose.Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
    colorHex: String,
    image: String,
    priceModifier: { type: Number, default: 0 },
    stockModifier: { type: Number, default: 0 },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Color", "Size"
    options: [variantOptionSchema],
  },
  { _id: false }
);

const specificationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
    unit: String,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    barcode: { type: String, trim: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        isPrimary: { type: Boolean, default: false },
        alt: String,
        order: { type: Number, default: 0 },
      },
    ],
    videos: [
      {
        url: String,
        publicId: String,
        thumbnail: String,
        title: String,
      },
    ],
    variants: [variantSchema],
    specifications: [specificationSchema],
    tags: [{ type: String, trim: true, lowercase: true }],
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      default: null,
    },
    salePriceStartDate: { type: Date, default: null },
    salePriceEndDate: { type: Date, default: null },
    taxClass: {
      type: String,
      enum: ['standard', 'reduced', 'zero', 'exempt'],
      default: 'standard',
    },
    taxRate: { type: Number, default: 0 },
    weight: { type: Number, default: 0 }, // grams
    dimensions: {
      length: { type: Number, default: 0 }, // cm
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'freight', 'digital'],
      default: 'standard',
    },
    stock: { type: Number, default: 0 }, // Calculated from inventory
    lowStockThreshold: { type: Number, default: 5 },
    isTrackingInventory: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive', 'deleted', 'pending_review'],
      default: 'draft',
    },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isFlashDeal: { type: Boolean, default: false },
    flashDealExpiry: { type: Date, default: null },
    flashDealPrice: { type: Number, default: null },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    returnPolicy: { type: String, default: null },
    warrantyInfo: { type: String, default: null },
    shippingInfo: { type: String, default: null },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ isTrending: 1, status: 1 });
productSchema.index({ isNewArrival: 1, status: 1 });
productSchema.index({ isFlashDeal: 1, flashDealExpiry: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ tags: 1 });
productSchema.index(
  { title: 'text', description: 'text', tags: 'text', shortDescription: 'text' },
  {
    weights: { title: 10, tags: 5, shortDescription: 3, description: 1 },
    name: 'product_text_index',
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

productSchema.virtual('isInStock').get(function () {
  return this.stock > 0;
});

productSchema.virtual('effectivePrice').get(function () {
  const now = new Date();
  if (this.isFlashDeal && this.flashDealPrice && this.flashDealExpiry > now) {
    return this.flashDealPrice;
  }
  if (this.salePrice !== null && this.salePrice !== undefined) {
    if (this.salePriceStartDate && this.salePriceEndDate) {
      if (now >= this.salePriceStartDate && now <= this.salePriceEndDate) {
        return this.salePrice;
      }
    } else {
      return this.salePrice;
    }
  }
  return this.basePrice;
});

productSchema.virtual('discountPercentage').get(function () {
  const effective = this.effectivePrice;
  if (effective < this.basePrice) {
    return Math.round(((this.basePrice - effective) / this.basePrice) * 100);
  }
  return 0;
});

productSchema.virtual('primaryImage').get(function () {
  if (!this.images || this.images.length === 0) return null;
  return this.images.find((img) => img.isPrimary) || this.images[0];
});

// ─── Pre-save hooks ───────────────────────────────────────────────────────────

productSchema.pre('save', async function (next) {
  if (this.isModified('title') && !this.slug) {
    const baseSlug = createSlug(this.title);
    let slug = baseSlug;
    let counter = 1;
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }

  // Ensure exactly one primary image
  if (this.isModified('images') && this.images.length > 0) {
    const hasPrimary = this.images.some((img) => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }

  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

'use strict';

const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['enum', 'range', 'boolean', 'text', 'color', 'size'],
      required: true,
    },
    options: [
      {
        value: String,
        label: String,
        colorHex: String,
      },
    ],
    unit: String,
    isFilterable: { type: Boolean, default: true },
    isRequired: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    image: {
      url: String,
      publicId: String,
      alt: String,
    },
    icon: { type: String }, // Icon name or SVG string
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    ancestors: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        name: String,
        slug: String,
      },
    ],
    level: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    attributes: [attributeSchema],
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    productCount: { type: Number, default: 0 },
    commissionRate: { type: Number, default: null }, // Override platform default
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1, isFeatured: 1 });
categorySchema.index({ order: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// ─── Pre-save hooks ───────────────────────────────────────────────────────────

categorySchema.pre('save', async function (next) {
  if (this.isModified('parent') && this.parent) {
    const parent = await this.constructor.findById(this.parent).select('ancestors name slug level');
    if (parent) {
      this.ancestors = [
        ...parent.ancestors,
        { _id: parent._id, name: parent.name, slug: parent.slug },
      ];
      this.level = parent.level + 1;
    }
  } else if (!this.parent) {
    this.ancestors = [];
    this.level = 0;
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

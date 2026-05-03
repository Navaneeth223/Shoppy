'use strict';

const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    image: {
      url: { type: String, required: true },
      publicId: String,
      alt: String,
    },
    mobileImage: {
      url: String,
      publicId: String,
    },
    link: { type: String, trim: true },
    buttonText: { type: String, trim: true },
    position: {
      type: String,
      enum: ['hero', 'homepage_top', 'homepage_mid', 'category', 'sidebar', 'popup'],
      default: 'homepage_top',
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    targetCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    backgroundColor: { type: String, default: null },
    textColor: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clickCount: { type: Number, default: 0 },
    impressionCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bannerSchema.virtual('isCurrentlyActive').get(function () {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
});

bannerSchema.index({ position: 1, isActive: 1, order: 1 });

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;

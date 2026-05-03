'use strict';

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Variant combination key (e.g. "Color:Red,Size:M")
    variantKey: {
      type: String,
      default: 'default',
    },
    variantLabel: {
      type: String,
      default: 'Default',
    },
    sku: { type: String, trim: true, uppercase: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reservedStock: { type: Number, default: 0 }, // Reserved for pending orders
    soldStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    warehouse: { type: String, default: 'main' },
    location: { type: String }, // Bin/shelf location
    costPrice: { type: Number, default: 0 },
    history: [
      {
        type: {
          type: String,
          enum: ['restock', 'sale', 'return', 'adjustment', 'reservation', 'release'],
          required: true,
        },
        quantity: { type: Number, required: true },
        previousStock: Number,
        newStock: Number,
        note: String,
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

inventorySchema.virtual('availableStock').get(function () {
  return Math.max(0, this.stock - this.reservedStock);
});

inventorySchema.virtual('isLowStock').get(function () {
  return this.availableStock <= this.lowStockThreshold && this.availableStock > 0;
});

inventorySchema.virtual('isOutOfStock').get(function () {
  return this.availableStock <= 0;
});

inventorySchema.index({ product: 1, variantKey: 1 }, { unique: true });
inventorySchema.index({ seller: 1 });
inventorySchema.index({ stock: 1 });
inventorySchema.index({ sku: 1 }, { sparse: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;

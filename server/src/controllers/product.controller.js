'use strict';

const Product = require('../models/Product.model');
const Inventory = require('../models/Inventory.model');
const Category = require('../models/Category.model');
const Brand = require('../models/Brand.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, parseSort } = require('../utils/pagination');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { safeDelPattern } = require('../config/redis');
const searchService = require('../services/search.service');
const logger = require('../utils/logger');

// ─── List Products ────────────────────────────────────────────────────────────

const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort);

  const filter = { status: 'active', isPublished: true };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.subcategory) filter.subcategory = req.query.subcategory;
  if (req.query.brand) filter.brand = { $in: req.query.brand.split(',') };
  if (req.query.seller) filter.seller = req.query.seller;
  if (req.query.isFeatured === 'true') filter.isFeatured = true;
  if (req.query.isTrending === 'true') filter.isTrending = true;
  if (req.query.isNewArrival === 'true') filter.isNewArrival = true;
  if (req.query.inStock === 'true') filter.stock = { $gt: 0 };
  if (req.query.minPrice || req.query.maxPrice) {
    filter.basePrice = {};
    if (req.query.minPrice) filter.basePrice.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.basePrice.$lte = parseFloat(req.query.maxPrice);
  }
  if (req.query.rating) filter['ratings.average'] = { $gte: parseFloat(req.query.rating) };
  if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };

  // Full-text search
  if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }

  const [products, total] = await Promise.all([
    Product.find(filter, req.query.q ? { score: { $meta: 'textScore' } } : {})
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .populate('seller', 'firstName lastName')
      .lean(),
    Product.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Products fetched successfully.', products, { page, limit, total });
});

// ─── Get Single Product ───────────────────────────────────────────────────────

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    status: 'active',
    isPublished: true,
  })
    .populate('category', 'name slug ancestors')
    .populate('subcategory', 'name slug')
    .populate('brand', 'name slug logo website')
    .populate('seller', 'firstName lastName avatar')
    .lean();

  if (!product) {
    throw ApiError.notFound('Product not found.');
  }

  // Get inventory per variant
  const inventory = await Inventory.find({ product: product._id }).lean();

  ApiResponse.ok(res, 'Product fetched successfully.', { ...product, inventory });
});

// ─── Create Product ───────────────────────────────────────────────────────────

const createProduct = asyncHandler(async (req, res) => {
  const productData = {
    ...req.body,
    seller: req.user._id,
    status: req.user.role === 'admin' || req.user.role === 'superadmin' ? 'active' : 'pending_review',
  };

  const product = await Product.create(productData);

  // Create inventory records for each variant combination
  if (req.body.inventoryData && Array.isArray(req.body.inventoryData)) {
    const inventoryDocs = req.body.inventoryData.map((inv) => ({
      product: product._id,
      seller: req.user._id,
      variantKey: inv.variantKey || 'default',
      variantLabel: inv.variantLabel || 'Default',
      sku: inv.sku,
      stock: inv.stock || 0,
      lowStockThreshold: inv.lowStockThreshold || 5,
      costPrice: inv.costPrice || 0,
    }));

    await Inventory.insertMany(inventoryDocs);

    // Update product stock
    const totalStock = inventoryDocs.reduce((sum, inv) => sum + inv.stock, 0);
    product.stock = totalStock;
    await product.save();
  }

  // Invalidate product cache
  await safeDelPattern('cache:/api/v1/products*');

  ApiResponse.created(res, 'Product created successfully.', product);
});

// ─── Update Product ───────────────────────────────────────────────────────────

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) throw ApiError.notFound('Product not found.');

  // Check ownership
  if (
    product.seller.toString() !== req.user._id.toString() &&
    !['admin', 'superadmin'].includes(req.user.role)
  ) {
    throw ApiError.forbidden('You do not have permission to update this product.');
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  // Invalidate cache
  await safeDelPattern(`cache:/api/v1/products*`);

  ApiResponse.ok(res, 'Product updated successfully.', updatedProduct);
});

// ─── Delete Product ───────────────────────────────────────────────────────────

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) throw ApiError.notFound('Product not found.');

  if (
    product.seller.toString() !== req.user._id.toString() &&
    !['admin', 'superadmin'].includes(req.user.role)
  ) {
    throw ApiError.forbidden('You do not have permission to delete this product.');
  }

  // Soft delete
  await Product.findByIdAndUpdate(req.params.id, {
    status: 'deleted',
    isPublished: false,
    deletedAt: new Date(),
  });

  await safeDelPattern('cache:/api/v1/products*');

  ApiResponse.noContent(res);
});

// ─── Upload Product Images ────────────────────────────────────────────────────

const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found.');

  if (
    product.seller.toString() !== req.user._id.toString() &&
    !['admin', 'superadmin'].includes(req.user.role)
  ) {
    throw ApiError.forbidden('Permission denied.');
  }

  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No images provided.');
  }

  const uploadedImages = [];

  for (const file of req.files) {
    const result = await uploadToCloudinary(file.buffer, {
      folder: `nexus-commerce/products/${product._id}`,
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ],
    });

    uploadedImages.push({
      url: result.secure_url,
      publicId: result.public_id,
      isPrimary: product.images.length === 0 && uploadedImages.length === 0,
      alt: product.title,
      order: product.images.length + uploadedImages.length,
    });
  }

  product.images.push(...uploadedImages);
  await product.save();

  ApiResponse.ok(res, 'Images uploaded successfully.', product.images);
});

// ─── Delete Product Image ─────────────────────────────────────────────────────

const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found.');

  if (
    product.seller.toString() !== req.user._id.toString() &&
    !['admin', 'superadmin'].includes(req.user.role)
  ) {
    throw ApiError.forbidden('Permission denied.');
  }

  const image = product.images.id(req.params.imageId);
  if (!image) throw ApiError.notFound('Image not found.');

  // Delete from Cloudinary
  if (image.publicId) {
    await deleteFromCloudinary(image.publicId);
  }

  product.images.pull(req.params.imageId);

  // Ensure there's still a primary image
  if (product.images.length > 0 && !product.images.some((img) => img.isPrimary)) {
    product.images[0].isPrimary = true;
  }

  await product.save();

  ApiResponse.ok(res, 'Image deleted successfully.', product.images);
});

// ─── Featured Products ────────────────────────────────────────────────────────

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 12 } = req.query;

  const products = await Product.find({ status: 'active', isPublished: true, isFeatured: true })
    .sort({ soldCount: -1 })
    .limit(parseInt(limit))
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .lean();

  ApiResponse.ok(res, 'Featured products fetched.', products);
});

// ─── Trending Products ────────────────────────────────────────────────────────

const getTrendingProducts = asyncHandler(async (req, res) => {
  const { limit = 12 } = req.query;

  const products = await Product.find({ status: 'active', isPublished: true, isTrending: true })
    .sort({ viewCount: -1, soldCount: -1 })
    .limit(parseInt(limit))
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .lean();

  ApiResponse.ok(res, 'Trending products fetched.', products);
});

// ─── New Arrivals ─────────────────────────────────────────────────────────────

const getNewArrivals = asyncHandler(async (req, res) => {
  const { limit = 12 } = req.query;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const products = await Product.find({
    status: 'active',
    isPublished: true,
    createdAt: { $gte: thirtyDaysAgo },
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .lean();

  ApiResponse.ok(res, 'New arrivals fetched.', products);
});

// ─── Flash Deals ──────────────────────────────────────────────────────────────

const getFlashDeals = asyncHandler(async (req, res) => {
  const now = new Date();

  const products = await Product.find({
    status: 'active',
    isPublished: true,
    isFlashDeal: true,
    flashDealExpiry: { $gt: now },
  })
    .sort({ flashDealExpiry: 1 })
    .limit(20)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .lean();

  ApiResponse.ok(res, 'Flash deals fetched.', products);
});

// ─── Related Products ─────────────────────────────────────────────────────────

const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('category brand tags');
  if (!product) throw ApiError.notFound('Product not found.');

  const related = await Product.find({
    _id: { $ne: product._id },
    status: 'active',
    isPublished: true,
    $or: [
      { category: product.category },
      { brand: product.brand },
      { tags: { $in: product.tags } },
    ],
  })
    .sort({ soldCount: -1, 'ratings.average': -1 })
    .limit(8)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .lean();

  ApiResponse.ok(res, 'Related products fetched.', related);
});

// ─── Increment View Count ─────────────────────────────────────────────────────

const incrementViewCount = asyncHandler(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
  ApiResponse.ok(res, 'View count updated.');
});

// ─── Update Product Status (Admin) ───────────────────────────────────────────

const updateProductStatus = asyncHandler(async (req, res) => {
  const { status, isFeatured, isTrending } = req.body;

  const update = {};
  if (status) update.status = status;
  if (isFeatured !== undefined) update.isFeatured = isFeatured;
  if (isTrending !== undefined) update.isTrending = isTrending;

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) throw ApiError.notFound('Product not found.');

  await safeDelPattern('cache:/api/v1/products*');

  ApiResponse.ok(res, 'Product status updated.', product);
});

// ─── Search ───────────────────────────────────────────────────────────────────

const searchProducts = asyncHandler(async (req, res) => {
  const results = await searchService.searchProducts(req.query);

  ApiResponse.ok(res, 'Search results fetched.', results, {
    page: results.page,
    limit: results.limit,
    total: results.total,
    totalPages: results.totalPages,
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  getFeaturedProducts,
  getTrendingProducts,
  getNewArrivals,
  getFlashDeals,
  getRelatedProducts,
  incrementViewCount,
  updateProductStatus,
  searchProducts,
};

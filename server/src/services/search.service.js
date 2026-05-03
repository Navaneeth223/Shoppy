'use strict';

const Product = require('../models/Product.model');
const { safeGet, safeSet } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Performs a full-text product search with faceted aggregation.
 * @param {object} params - Search parameters
 * @returns {Promise<{products, facets, total, suggestions}>}
 */
async function searchProducts(params) {
  const {
    q,
    page = 1,
    limit = 20,
    sort = 'relevance',
    category,
    subcategory,
    brand,
    minPrice,
    maxPrice,
    rating,
    color,
    size,
    inStock,
    isFeatured,
    isTrending,
    isNewArrival,
    seller,
    tags,
  } = params;

  const skip = (page - 1) * limit;

  // Build base match query
  const matchQuery = {
    status: 'active',
    isPublished: true,
  };

  // Full-text search
  if (q) {
    matchQuery.$text = { $search: q };
  }

  // Category filter
  if (category) {
    matchQuery.category = require('mongoose').Types.ObjectId.isValid(category)
      ? require('mongoose').Types.ObjectId.createFromHexString(category)
      : category;
  }

  if (subcategory) {
    matchQuery.subcategory = require('mongoose').Types.ObjectId.isValid(subcategory)
      ? require('mongoose').Types.ObjectId.createFromHexString(subcategory)
      : subcategory;
  }

  // Brand filter (comma-separated)
  if (brand) {
    const brandIds = brand.split(',').filter(Boolean);
    matchQuery.brand = { $in: brandIds };
  }

  // Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    matchQuery.basePrice = {};
    if (minPrice !== undefined) matchQuery.basePrice.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) matchQuery.basePrice.$lte = parseFloat(maxPrice);
  }

  // Rating filter
  if (rating) {
    matchQuery['ratings.average'] = { $gte: parseFloat(rating) };
  }

  // Stock filter
  if (inStock === 'true' || inStock === true) {
    matchQuery.stock = { $gt: 0 };
  }

  // Boolean flags
  if (isFeatured === 'true') matchQuery.isFeatured = true;
  if (isTrending === 'true') matchQuery.isTrending = true;
  if (isNewArrival === 'true') matchQuery.isNewArrival = true;

  // Seller filter
  if (seller) matchQuery.seller = seller;

  // Tags filter
  if (tags) {
    const tagList = tags.split(',').filter(Boolean);
    matchQuery.tags = { $in: tagList };
  }

  // Build sort
  let sortQuery = {};
  switch (sort) {
    case 'price_asc': sortQuery = { basePrice: 1 }; break;
    case 'price_desc': sortQuery = { basePrice: -1 }; break;
    case 'newest': sortQuery = { createdAt: -1 }; break;
    case 'rating': sortQuery = { 'ratings.average': -1 }; break;
    case 'bestseller': sortQuery = { soldCount: -1 }; break;
    case 'most_reviewed': sortQuery = { reviewCount: -1 }; break;
    case 'relevance':
    default:
      if (q) {
        sortQuery = { score: { $meta: 'textScore' }, soldCount: -1 };
      } else {
        sortQuery = { soldCount: -1, 'ratings.average': -1 };
      }
  }

  // Execute search + facets in parallel
  const [productsResult, facetsResult] = await Promise.all([
    // Products query
    Product.find(matchQuery, q ? { score: { $meta: 'textScore' } } : {})
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .populate('seller', 'firstName lastName')
      .lean(),

    // Facets aggregation
    Product.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          categories: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
            {
              $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category',
              },
            },
            { $unwind: '$category' },
            {
              $project: {
                _id: '$category._id',
                name: '$category.name',
                slug: '$category.slug',
                count: 1,
              },
            },
          ],
          brands: [
            { $match: { brand: { $ne: null } } },
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
            {
              $lookup: {
                from: 'brands',
                localField: '_id',
                foreignField: '_id',
                as: 'brand',
              },
            },
            { $unwind: '$brand' },
            {
              $project: {
                _id: '$brand._id',
                name: '$brand.name',
                slug: '$brand.slug',
                logo: '$brand.logo',
                count: 1,
              },
            },
          ],
          priceRange: [
            {
              $group: {
                _id: null,
                min: { $min: '$basePrice' },
                max: { $max: '$basePrice' },
              },
            },
          ],
          ratings: [
            {
              $group: {
                _id: { $floor: '$ratings.average' },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: -1 } },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ]),
  ]);

  const facets = facetsResult[0] || {};
  const total = facets.totalCount?.[0]?.count || 0;

  return {
    products: productsResult,
    facets: {
      categories: facets.categories || [],
      brands: facets.brands || [],
      priceRange: facets.priceRange?.[0] || { min: 0, max: 10000 },
      ratings: facets.ratings || [],
    },
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Gets autocomplete suggestions for a search query.
 * Results are cached in Redis for 30 minutes.
 * @param {string} query
 * @returns {Promise<string[]>}
 */
async function getAutocompleteSuggestions(query) {
  if (!query || query.length < 2) return [];

  const cacheKey = `autocomplete:${query.toLowerCase().trim()}`;

  // Check cache
  const cached = await safeGet(cacheKey);
  if (cached) return JSON.parse(cached);

  const products = await Product.find(
    {
      status: 'active',
      isPublished: true,
      $text: { $search: query },
    },
    { score: { $meta: 'textScore' }, title: 1, category: 1 }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(8)
    .select('title')
    .lean();

  const suggestions = [...new Set(products.map((p) => p.title))].slice(0, 8);

  // Cache for 30 minutes
  await safeSet(cacheKey, JSON.stringify(suggestions), 30 * 60);

  return suggestions;
}

/**
 * Gets popular search terms.
 * @returns {Promise<string[]>}
 */
async function getPopularSearches() {
  const cacheKey = 'popular:searches';
  const cached = await safeGet(cacheKey);
  if (cached) return JSON.parse(cached);

  // In production, this would query the analytics collection
  const popular = [
    'wireless headphones', 'running shoes', 'laptop', 'smartphone',
    'coffee maker', 'yoga mat', 'backpack', 'sunglasses',
    'watch', 'skincare', 'gaming chair', 'air fryer',
  ];

  await safeSet(cacheKey, JSON.stringify(popular), 15 * 60);
  return popular;
}

module.exports = {
  searchProducts,
  getAutocompleteSuggestions,
  getPopularSearches,
};

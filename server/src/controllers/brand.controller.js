'use strict';

const Brand = require('../models/Brand.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');

const getBrands = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { featured, category } = req.query;

  const filter = { isActive: true };
  if (featured === 'true') filter.isFeatured = true;
  if (category) filter.categories = category;

  const [brands, total] = await Promise.all([
    Brand.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Brand.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Brands fetched.', brands, { page, limit, total });
});

const getBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!brand) throw ApiError.notFound('Brand not found.');
  ApiResponse.ok(res, 'Brand fetched.', brand);
});

const createBrand = asyncHandler(async (req, res) => {
  const { createSlug } = require('../utils/slugify');
  const brand = await Brand.create({
    ...req.body,
    slug: req.body.slug || createSlug(req.body.name),
  });
  ApiResponse.created(res, 'Brand created.', brand);
});

const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!brand) throw ApiError.notFound('Brand not found.');
  ApiResponse.ok(res, 'Brand updated.', brand);
});

module.exports = { getBrands, getBrand, createBrand, updateBrand };

'use strict';

const Category = require('../models/Category.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getCategories = asyncHandler(async (req, res) => {
  const { tree, active } = req.query;

  const filter = {};
  if (active !== 'false') filter.isActive = true;

  const categories = await Category.find(filter)
    .sort({ level: 1, order: 1 })
    .lean();

  if (tree === 'true') {
    // Build tree structure
    const categoryMap = {};
    const roots = [];

    categories.forEach((cat) => {
      categoryMap[cat._id.toString()] = { ...cat, children: [] };
    });

    categories.forEach((cat) => {
      if (cat.parent) {
        const parent = categoryMap[cat.parent.toString()];
        if (parent) parent.children.push(categoryMap[cat._id.toString()]);
      } else {
        roots.push(categoryMap[cat._id.toString()]);
      }
    });

    return ApiResponse.ok(res, 'Category tree fetched.', roots);
  }

  ApiResponse.ok(res, 'Categories fetched.', categories);
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true })
    .populate('parent', 'name slug')
    .lean();

  if (!category) throw ApiError.notFound('Category not found.');

  ApiResponse.ok(res, 'Category fetched.', category);
});

module.exports = { getCategories, getCategory };

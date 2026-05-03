'use strict';

const searchService = require('../services/search.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const search = asyncHandler(async (req, res) => {
  const results = await searchService.searchProducts(req.query);
  ApiResponse.ok(res, 'Search results.', results, {
    page: results.page,
    limit: results.limit,
    total: results.total,
    totalPages: results.totalPages,
  });
});

const autocomplete = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const suggestions = await searchService.getAutocompleteSuggestions(q);
  ApiResponse.ok(res, 'Suggestions fetched.', suggestions);
});

const popularSearches = asyncHandler(async (req, res) => {
  const popular = await searchService.getPopularSearches();
  ApiResponse.ok(res, 'Popular searches fetched.', popular);
});

module.exports = { search, autocomplete, popularSearches };

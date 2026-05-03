'use strict';

const AnalyticsEvent = require('../models/Analytics.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const trackEvent = asyncHandler(async (req, res) => {
  const { type, productId, categoryId, searchQuery, searchResultCount, value, metadata } = req.body;

  const UAParser = require('ua-parser-js');
  const parser = new UAParser(req.headers['user-agent']);
  const ua = parser.getResult();

  await AnalyticsEvent.create({
    type,
    user: req.user?._id || null,
    sessionId: req.cookies?.sessionId || req.headers['x-session-id'],
    product: productId || null,
    category: categoryId || null,
    searchQuery: searchQuery || null,
    searchResultCount: searchResultCount || null,
    referrer: req.headers.referer || null,
    device: {
      type: ua.device.type || 'desktop',
      browser: ua.browser.name,
      os: ua.os.name,
    },
    ip: req.ip,
    value: value || null,
    metadata: metadata || {},
  });

  ApiResponse.ok(res, 'Event tracked.');
});

module.exports = { trackEvent };

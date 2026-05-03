'use strict';

const express = require('express');
const router = express.Router();

const analyticsController = require('../../controllers/analytics.controller');
const { optionalAuth } = require('../../middleware/auth.middleware');

router.post('/track', optionalAuth, analyticsController.trackEvent);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();

const uploadController = require('../../controllers/upload.controller');
const { protect } = require('../../middleware/auth.middleware');
const { uploadSingleImage, uploadMultipleImages } = require('../../middleware/upload.middleware');
const { uploadLimiter } = require('../../middleware/rateLimit.middleware');

router.post('/image', protect, uploadLimiter, uploadSingleImage, uploadController.uploadImage);
router.post('/images', protect, uploadLimiter, uploadMultipleImages, uploadController.uploadMultiple);

module.exports = router;

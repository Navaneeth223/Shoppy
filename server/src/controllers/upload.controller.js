'use strict';

const { uploadToCloudinary } = require('../config/cloudinary');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file provided.');

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: `nexus-commerce/${req.query.folder || 'general'}`,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });

  ApiResponse.ok(res, 'Image uploaded.', {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  });
});

const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw ApiError.badRequest('No files provided.');

  const results = await Promise.all(
    req.files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder: `nexus-commerce/${req.query.folder || 'general'}`,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      })
    )
  );

  ApiResponse.ok(res, 'Images uploaded.', results.map((r) => ({
    url: r.secure_url,
    publicId: r.public_id,
  })));
});

module.exports = { uploadImage, uploadMultiple };

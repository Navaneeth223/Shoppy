'use strict';

const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOCUMENT_TYPES = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

// Use memory storage — files are processed and uploaded to Cloudinary
const storage = multer.memoryStorage();

/**
 * File filter factory.
 * @param {string[]} allowedTypes - Array of allowed MIME types
 */
function createFileFilter(allowedTypes) {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          400,
          `Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`
        ),
        false
      );
    }
  };
}

/**
 * Single image upload middleware.
 * Field name: 'image'
 * Max size: 5MB
 */
const uploadSingleImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES),
}).single('image');

/**
 * Multiple image upload middleware.
 * Field name: 'images'
 * Max: 10 images, 5MB each
 */
const uploadMultipleImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES),
}).array('images', 10);

/**
 * Avatar upload middleware.
 * Field name: 'avatar'
 * Max size: 2MB
 */
const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES),
}).single('avatar');

/**
 * Product media upload (images + videos).
 */
const uploadProductMedia = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024, files: 13 }, // 100MB for videos
  fileFilter: (req, file, cb) => {
    const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `Invalid file type: ${file.mimetype}`), false);
    }
  },
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 },
]);

/**
 * CSV upload for bulk operations.
 */
const uploadCSV = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: createFileFilter(ALLOWED_DOCUMENT_TYPES),
}).single('file');

/**
 * Wraps multer middleware to handle errors properly.
 * @param {Function} multerMiddleware
 */
function handleUpload(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'File size exceeds the allowed limit.'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new ApiError(400, 'Too many files uploaded.'));
        }
        return next(new ApiError(400, err.message));
      }
      if (err) return next(err);
      next();
    });
  };
}

module.exports = {
  uploadSingleImage: handleUpload(uploadSingleImage),
  uploadMultipleImages: handleUpload(uploadMultipleImages),
  uploadAvatar: handleUpload(uploadAvatar),
  uploadProductMedia: handleUpload(uploadProductMedia),
  uploadCSV: handleUpload(uploadCSV),
};

'use strict';

const cloudinary = require('cloudinary').v2;
const env = require('./env');
const logger = require('../utils/logger');

/**
 * Configures the Cloudinary SDK.
 * Called once during app startup.
 */
function configureCloudinary() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    logger.warn('[Cloudinary] Credentials not configured. Image uploads will fail.');
    return;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  logger.info('[Cloudinary] Configured successfully.');
}

/**
 * Uploads a file buffer to Cloudinary with transformation options.
 * @param {Buffer} buffer - File buffer
 * @param {object} options - Upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
async function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'nexus-commerce',
      resource_type: options.resourceType || 'image',
      transformation: options.transformation || [],
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    uploadStream.end(buffer);
  });
}

/**
 * Deletes a file from Cloudinary by public_id.
 * @param {string} publicId
 * @param {string} [resourceType='image']
 */
async function deleteFromCloudinary(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Generates a Cloudinary URL with on-the-fly transformations.
 * @param {string} publicId
 * @param {object} transformations
 * @returns {string}
 */
function getCloudinaryUrl(publicId, transformations = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations,
  });
}

module.exports = {
  configureCloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl,
  cloudinary,
};

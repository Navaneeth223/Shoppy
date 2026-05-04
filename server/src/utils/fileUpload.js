'use strict';

const sharp = require('sharp');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const logger = require('../utils/logger');

/**
 * Processes and uploads an image to Cloudinary with multiple size variants.
 * @param {Buffer} buffer - Image buffer
 * @param {object} options
 * @param {string} options.folder - Cloudinary folder
 * @param {string} [options.publicId] - Optional public ID
 * @returns {Promise<object>} Upload result with all variant URLs
 */
async function uploadProductImage(buffer, options = {}) {
  const folder = options.folder || 'nexus-commerce/products';

  // Convert to WebP and optimize
  const optimizedBuffer = await sharp(buffer)
    .webp({ quality: 85 })
    .toBuffer();

  const result = await uploadToCloudinary(optimizedBuffer, {
    folder,
    resource_type: 'image',
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
    ],
    ...options,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    // Generate on-the-fly transformation URLs
    thumbnailUrl: result.secure_url.replace('/upload/', '/upload/w_150,h_150,c_fill,q_auto/'),
    mediumUrl: result.secure_url.replace('/upload/', '/upload/w_400,h_400,c_limit,q_auto/'),
    largeUrl: result.secure_url.replace('/upload/', '/upload/w_800,h_800,c_limit,q_auto/'),
  };
}

/**
 * Processes and uploads an avatar image.
 * @param {Buffer} buffer
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function uploadAvatar(buffer, userId) {
  const optimizedBuffer = await sharp(buffer)
    .resize(200, 200, { fit: 'cover', position: 'face' })
    .webp({ quality: 90 })
    .toBuffer();

  const result = await uploadToCloudinary(optimizedBuffer, {
    folder: 'nexus-commerce/avatars',
    public_id: `avatar_${userId}`,
    overwrite: true,
    resource_type: 'image',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Deletes an image from Cloudinary.
 * @param {string} publicId
 * @returns {Promise<void>}
 */
async function deleteImage(publicId) {
  if (!publicId) return;
  try {
    await deleteFromCloudinary(publicId);
  } catch (err) {
    logger.warn(`[FileUpload] Failed to delete image ${publicId}:`, err.message);
  }
}

/**
 * Validates that a buffer is a valid image.
 * @param {Buffer} buffer
 * @returns {Promise<boolean>}
 */
async function isValidImage(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(metadata.format);
  } catch {
    return false;
  }
}

module.exports = { uploadProductImage, uploadAvatar, deleteImage, isValidImage };

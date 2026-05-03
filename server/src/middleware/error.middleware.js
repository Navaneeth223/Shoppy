'use strict';

const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Converts known error types to ApiError instances.
 * @param {Error} err
 * @returns {ApiError}
 */
function normalizeError(err) {
  // Already an ApiError
  if (err instanceof ApiError) return err;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return new ApiError(422, 'Validation failed', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return new ApiError(409, `${field} '${value}' already exists.`);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return new ApiError(401, 'Invalid token. Please log in again.');
  }

  if (err.name === 'TokenExpiredError') {
    return new ApiError(401, 'Your session has expired. Please log in again.');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new ApiError(400, 'File size exceeds the allowed limit.');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return new ApiError(400, 'Too many files uploaded at once.');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ApiError(400, 'Unexpected file field.');
  }

  // Default: internal server error
  return new ApiError(500, env.isProduction ? 'Something went wrong. Please try again.' : err.message);
}

/**
 * Global error handling middleware.
 * Must be registered last in the Express app.
 */
function errorHandler(err, req, res, next) {
  const apiError = normalizeError(err);

  // Log non-operational errors (programming bugs) at error level
  if (!apiError.isOperational || apiError.statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?._id,
      statusCode: apiError.statusCode,
    });
  }

  const response = {
    success: false,
    message: apiError.message,
    statusCode: apiError.statusCode,
  };

  if (apiError.errors && apiError.errors.length > 0) {
    response.errors = apiError.errors;
  }

  // Include stack trace in development
  if (env.isDevelopment && err.stack) {
    response.stack = err.stack;
  }

  res.status(apiError.statusCode).json(response);
}

/**
 * Handles 404 Not Found for unmatched routes.
 */
function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found.`));
}

module.exports = { errorHandler, notFoundHandler };

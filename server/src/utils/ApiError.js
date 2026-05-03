'use strict';

/**
 * Custom API error class that extends the native Error.
 * Used throughout the application for consistent error handling.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable error message
   * @param {Array} [errors=[]] - Array of field-level validation errors
   * @param {string} [stack=''] - Optional stack trace override
   */
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = true; // Distinguishes operational errors from programming errors

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ─── Static factory methods ───────────────────────────────────────────────

  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static unprocessable(message = 'Unprocessable Entity', errors = []) {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return new ApiError(503, message);
  }
}

module.exports = ApiError;

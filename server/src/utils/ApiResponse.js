'use strict';

/**
 * Standardized API response helper.
 * All API responses follow a consistent shape.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable message
   * @param {*} [data=null] - Response payload
   * @param {object} [meta=null] - Pagination or extra metadata
   */
  constructor(statusCode, message, data = null, meta = null) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
  }

  /**
   * Sends the response via Express res object.
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json(this);
  }

  // ─── Static factory methods ───────────────────────────────────────────────

  static ok(res, message, data, meta) {
    return new ApiResponse(200, message, data, meta).send(res);
  }

  static created(res, message, data) {
    return new ApiResponse(201, message, data).send(res);
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static paginated(res, message, data, { page, limit, total }) {
    const totalPages = Math.ceil(total / limit);
    const meta = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
    return new ApiResponse(200, message, data, meta).send(res);
  }
}

module.exports = ApiResponse;

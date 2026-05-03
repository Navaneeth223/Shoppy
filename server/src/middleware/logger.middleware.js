'use strict';

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Assigns a unique request ID to each incoming request.
 * The ID is attached to req.requestId and the response header.
 */
function requestId(req, res, next) {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

/**
 * Logs incoming requests and outgoing responses with timing.
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log request
  logger.info({
    message: `→ ${req.method} ${req.originalUrl}`,
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?._id,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]({
      message: `← ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`,
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userId: req.user?._id,
    });
  });

  next();
}

module.exports = { requestId, requestLogger };

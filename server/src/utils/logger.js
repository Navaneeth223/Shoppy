'use strict';

const winston = require('winston');
const path = require('path');

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const isDevelopment = process.env.NODE_ENV !== 'production';

// Custom format for development console output
const devFormat = printf(({ level, message, timestamp: ts, requestId, ...meta }) => {
  const reqId = requestId ? ` [${requestId}]` : '';
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts}${reqId} [${level}]: ${message}${metaStr}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  defaultMeta: { service: 'nexus-api' },
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: isDevelopment
        ? combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devFormat)
        : combine(timestamp(), json()),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devFormat),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devFormat),
    }),
  ],
});

// Add file transports in production
if (!isDevelopment) {
  logger.add(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    })
  );
}

module.exports = logger;

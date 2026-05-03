'use strict';

const { verifyAccessToken } = require('../utils/generateToken');
const logger = require('../utils/logger');

let io = null;

/**
 * Initializes Socket.IO with the HTTP server.
 * @param {import('http').Server} httpServer
 * @param {string[]} corsOrigins
 */
function initializeSocket(httpServer, corsOrigins) {
  const { Server } = require('socket.io');

  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (token) {
        const decoded = verifyAccessToken(token);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
      }
    } catch {
      // Allow unauthenticated connections (for public features)
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`[Socket] Client connected: ${socket.id} (user: ${socket.userId || 'guest'})`);

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join seller room
    if (socket.userRole === 'seller') {
      socket.join(`seller:${socket.userId}`);
    }

    // Join admin room
    if (['admin', 'superadmin'].includes(socket.userRole)) {
      socket.join('admin');
    }

    // Order tracking subscription
    socket.on('subscribe:order', (orderNumber) => {
      socket.join(`order:${orderNumber}`);
      logger.info(`[Socket] ${socket.id} subscribed to order: ${orderNumber}`);
    });

    socket.on('unsubscribe:order', (orderNumber) => {
      socket.leave(`order:${orderNumber}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`[Socket] Client disconnected: ${socket.id} (reason: ${reason})`);
    });

    socket.on('error', (err) => {
      logger.error(`[Socket] Error on ${socket.id}:`, err.message);
    });
  });

  logger.info('[Socket] Socket.IO initialized.');
  return io;
}

/**
 * Returns the Socket.IO instance.
 * @returns {import('socket.io').Server|null}
 */
function getIO() {
  return io;
}

/**
 * Emits an event to a specific user's room.
 * @param {string} userId
 * @param {string} event
 * @param {*} data
 */
function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emits an order status update to subscribers.
 * @param {string} orderNumber
 * @param {object} update
 */
function emitOrderUpdate(orderNumber, update) {
  if (io) {
    io.to(`order:${orderNumber}`).emit('order:update', update);
  }
}

/**
 * Emits to all admin clients.
 * @param {string} event
 * @param {*} data
 */
function emitToAdmins(event, data) {
  if (io) {
    io.to('admin').emit(event, data);
  }
}

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitOrderUpdate,
  emitToAdmins,
};

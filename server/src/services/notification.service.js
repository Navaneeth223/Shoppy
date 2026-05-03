'use strict';

const Notification = require('../models/Notification.model');
const logger = require('../utils/logger');

/**
 * Creates an in-app notification for a user.
 * @param {object} params
 * @returns {Promise<Notification>}
 */
async function createNotification({ userId, type, title, body, link, data, priority = 'normal' }) {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      body,
      link,
      data,
      priority,
      channel: 'in_app',
    });

    // Emit via Socket.IO if available
    try {
      const { getIO } = require('../sockets');
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('notification', {
          id: notification._id,
          type,
          title,
          body,
          link,
          data,
          createdAt: notification.createdAt,
        });
      }
    } catch {
      // Socket.IO not available — that's fine
    }

    return notification;
  } catch (err) {
    logger.error('[Notification] Failed to create notification:', err.message);
    // Don't throw — notifications are non-critical
  }
}

/**
 * Creates notifications for multiple users.
 * @param {string[]} userIds
 * @param {object} notificationData
 */
async function createBulkNotifications(userIds, notificationData) {
  const notifications = userIds.map((userId) => ({
    user: userId,
    ...notificationData,
    channel: 'in_app',
  }));

  try {
    await Notification.insertMany(notifications, { ordered: false });
  } catch (err) {
    logger.error('[Notification] Bulk notification failed:', err.message);
  }
}

/**
 * Gets unread notification count for a user.
 * @param {string} userId
 * @returns {Promise<number>}
 */
async function getUnreadCount(userId) {
  return Notification.countDocuments({ user: userId, isRead: false });
}

/**
 * Marks notifications as read.
 * @param {string} userId
 * @param {string[]} [notificationIds] - If not provided, marks all as read
 */
async function markAsRead(userId, notificationIds) {
  const filter = { user: userId };
  if (notificationIds && notificationIds.length > 0) {
    filter._id = { $in: notificationIds };
  }

  await Notification.updateMany(filter, {
    $set: { isRead: true, readAt: new Date() },
  });
}

module.exports = {
  createNotification,
  createBulkNotifications,
  getUnreadCount,
  markAsRead,
};

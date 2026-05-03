'use strict';

const Notification = require('../models/Notification.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/pagination');

const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { limit: 20 });
  const { type, isRead } = req.query;

  const filter = { user: req.user._id };
  if (type) filter.type = type;
  if (isRead !== undefined) filter.isRead = isRead === 'true';

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  ApiResponse.paginated(res, 'Notifications fetched.', { notifications, unreadCount }, { page, limit, total });
});

const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: new Date() }
  );
  ApiResponse.ok(res, 'Notification marked as read.');
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  ApiResponse.ok(res, 'All notifications marked as read.');
});

const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  ApiResponse.noContent(res);
});

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };

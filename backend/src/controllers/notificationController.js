import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { Notification } from '../models/Notification.js';

/**
 * GET /api/notifications
 * Retrieves notifications for the authenticated user
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userQuery = [];
    if (req.user?._id || req.user?.id) {
      userQuery.push({ recipientUserId: req.user._id || req.user.id });
    }
    if (req.user?.email) {
      userQuery.push({ recipientEmail: req.user.email.toLowerCase().trim() });
    }
    if (req.query.email) {
      userQuery.push({ recipientEmail: req.query.email.toLowerCase().trim() });
    }

    if (userQuery.length === 0) {
      return sendSuccess(res, 'Notifications retrieved', { notifications: [], unreadCount: 0 });
    }

    const notifications = await Notification.find({ $or: userQuery })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formatted = notifications.map((n) => ({
      ...n,
      id: n._id.toString(),
    }));

    const unreadCount = formatted.filter((n) => !n.read).length;

    return sendSuccess(res, 'Notifications retrieved', {
      notifications: formatted,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return sendError(res, 'Notification not found', null, 404);
    }

    return sendSuccess(res, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications for the user as read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userQuery = [];
    if (req.user?._id || req.user?.id) {
      userQuery.push({ recipientUserId: req.user._id || req.user.id });
    }
    if (req.user?.email) {
      userQuery.push({ recipientEmail: req.user.email.toLowerCase().trim() });
    }
    if (req.body?.email) {
      userQuery.push({ recipientEmail: req.body.email.toLowerCase().trim() });
    }

    if (userQuery.length > 0) {
      await Notification.updateMany({ $or: userQuery, read: false }, { read: true });
    }

    return sendSuccess(res, 'All notifications marked as read', { success: true });
  } catch (error) {
    next(error);
  }
};

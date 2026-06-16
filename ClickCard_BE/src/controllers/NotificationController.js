const NotificationService = require('../services/NotificationService');
const { responseHandler } = require('../utils/responseHandler');

class NotificationController {
  /** GET /api/notifications — my notifications. */
  static async list(req, res) {
    try {
      const items = await NotificationService.list(req.user.userId);
      const unread = await NotificationService.unreadCount(req.user.userId);
      return responseHandler(res, 200, true, { items, unread }, 'Notifications retrieved');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message || 'Failed to load notifications');
    }
  }

  /** GET /api/notifications/unread-count */
  static async unreadCount(req, res) {
    try {
      const count = await NotificationService.unreadCount(req.user.userId);
      return responseHandler(res, 200, true, { count }, 'Unread count');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message || 'Failed');
    }
  }

  /** PATCH /api/notifications/:id/read */
  static async markRead(req, res) {
    try {
      await NotificationService.markRead(req.user.userId, req.params.id);
      return responseHandler(res, 200, true, null, 'Marked as read');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message || 'Failed');
    }
  }

  /** PATCH /api/notifications/read-all */
  static async markAllRead(req, res) {
    try {
      await NotificationService.markAllRead(req.user.userId);
      return responseHandler(res, 200, true, null, 'All marked as read');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message || 'Failed');
    }
  }

  /** POST /api/notifications/announce — admin broadcasts a feature/announcement. */
  static async announce(req, res) {
    try {
      const { title, message, type = 'announcement', data = {} } = req.body;
      if (!title) return responseHandler(res, 400, false, null, 'title is required');
      const count = await NotificationService.broadcastToUsers({ type, title, message, data });
      return responseHandler(res, 201, true, { delivered: count }, 'Announcement sent');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message || 'Failed to announce');
    }
  }
}

module.exports = NotificationController;

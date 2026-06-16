const pool = require('../config/database');
const Notification = require('../models/Notification');
const socket = require('../utils/socket');

const EVENT = 'notification'; // socket event clients listen on

/**
 * Centralised notifications: persists to DB + pushes live over socket.
 * (Live push requires a persistent host — on Vercel serverless the row is still
 *  saved and the client picks it up on next fetch/poll.)
 */
const NotificationService = {
  EVENT,

  /** Notify a single user (referral reward, feature unlocked, etc.). */
  async notifyUser(userId, payload) {
    const row = await Notification.create({ userId, ...payload });
    socket.sendNotification(userId, EVENT, row);
    return row;
  },

  /** Notify every admin (new user, new lead, content flagged…). */
  async notifyAdmins(payload) {
    const { rows } = await pool.query(`SELECT id FROM users WHERE role = 'admin'`);
    const adminIds = rows.map((r) => r.id);
    const created = await Notification.createForMany(adminIds, payload);
    created.forEach((row) => socket.sendNotification(row.user_id, EVENT, row));
    return created;
  },

  /** Broadcast to all standard users (new feature / template / announcement). */
  async broadcastToUsers(payload) {
    const { rows } = await pool.query(`SELECT id FROM users WHERE role <> 'admin' AND is_blocked = FALSE`);
    const userIds = rows.map((r) => r.id);
    const created = await Notification.createForMany(userIds, payload);
    // One global emit; clients refetch on receipt (cheaper than N targeted emits).
    socket.broadcast(EVENT, { broadcast: true, ...payload });
    return created.length;
  },

  list: (userId) => Notification.listForUser(userId),
  unreadCount: (userId) => Notification.unreadCount(userId),
  markRead: (userId, id) => Notification.markRead(userId, id),
  markAllRead: (userId) => Notification.markAllRead(userId),
};

module.exports = NotificationService;

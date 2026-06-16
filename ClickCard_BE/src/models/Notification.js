const pool = require('../config/database');

const createNotificationTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(60) NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT,
      data JSONB DEFAULT '{}',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, is_read);
  `);
};

const Notification = {
  createNotificationTable,

  async create({ userId, type, title, message = null, data = {} }) {
    const { rows } = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, type, title, message, JSON.stringify(data)],
    );
    return rows[0];
  },

  /** Bulk-insert one notification per target user (fan-out for broadcasts). */
  async createForMany(userIds, { type, title, message = null, data = {} }) {
    if (!userIds.length) return [];
    const values = [];
    const params = [];
    userIds.forEach((uid, i) => {
      const b = i * 5;
      values.push(`($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5})`);
      params.push(uid, type, title, message, JSON.stringify(data));
    });
    const { rows } = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ${values.join(',')} RETURNING *`,
      params,
    );
    return rows;
  },

  async listForUser(userId, limit = 30) {
    const { rows } = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit],
    );
    return rows;
  },

  async unreadCount(userId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [userId],
    );
    return rows[0].count;
  },

  async markRead(userId, id) {
    await pool.query(`UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`, [id, userId]);
  },

  async markAllRead(userId) {
    await pool.query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`, [userId]);
  },
};

module.exports = Notification;

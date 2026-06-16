const pool = require('../config/database');

class SystemSettings {
  static async get(key) {
    const query = 'SELECT value FROM system_settings WHERE key = $1;';
    const result = await pool.query(query, [key]);
    return result.rows[0] ? result.rows[0].value : null;
  }

  static async getAll() {
    const query = 'SELECT key, value, updated_at FROM system_settings;';
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(key, value) {
    const query = `
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await pool.query(query, [key, JSON.stringify(value)]);
    return result.rows[0];
  }

  static async delete(key) {
    const query = 'DELETE FROM system_settings WHERE key = $1;';
    await pool.query(query, [key]);
    return true;
  }
}

module.exports = SystemSettings;

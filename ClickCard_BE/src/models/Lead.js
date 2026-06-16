const pool = require('../config/database');

class Lead {
  static async create(userId, leadData) {
    const { name, email, phone, message } = leadData;
    const query = `
      INSERT INTO leads (user_id, name, email, phone, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [userId, name, email, phone, message];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC;';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findAll() {
    const query = 'SELECT * FROM leads ORDER BY created_at DESC;';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getCount() {
    const query = 'SELECT COUNT(*) FROM leads;';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async getTodayCount() {
    const query = "SELECT COUNT(*) FROM leads WHERE created_at >= CURRENT_DATE;";
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Lead;

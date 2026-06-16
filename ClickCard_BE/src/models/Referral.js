const pool = require('../config/database');

class Referral {
  static async create(referrerId, referredId) {
    const query = `
      INSERT INTO referrals (referrer_id, referred_id, status)
      VALUES ($1, $2, 'signed_up')
      RETURNING *;
    `;
    const result = await pool.query(query, [referrerId, referredId]);
    return result.rows[0];
  }

  static async findByReferrer(referrerId) {
    const query = `
      SELECT r.*, u.email, u.first_name, u.username
      FROM referrals r
      JOIN users u ON r.referred_id = u.id
      WHERE r.referrer_id = $1
      ORDER BY r.created_at DESC;
    `;
    const result = await pool.query(query, [referrerId]);
    return result.rows;
  }

  static async getStats(referrerId) {
    const query = `
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'profile_completed' THEN 1 END) as completed_profiles
      FROM referrals
      WHERE referrer_id = $1;
    `;
    const result = await pool.query(query, [referrerId]);
    return result.rows[0];
  }

  static async updateStatus(referredId, status) {
    const query = `
      UPDATE referrals
      SET status = $1
      WHERE referred_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [status, referredId]);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT r.*, 
             u1.email as referrer_email, u1.username as referrer_username,
             u2.email as referred_email, u2.username as referred_username
      FROM referrals r
      JOIN users u1 ON r.referrer_id = u1.id
      JOIN users u2 ON r.referred_id = u2.id
      ORDER BY r.created_at DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Referral;

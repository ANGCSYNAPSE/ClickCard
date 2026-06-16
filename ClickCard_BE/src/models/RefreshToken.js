const pool = require('../config/database');

const RefreshToken = {
  // Store refresh token
  store: async (userId, token, expiresAt) => {
    const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token
    `;
    try {
      const result = await pool.query(query, [userId, token, expiresAt]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find refresh token
  findByToken: async (token) => {
    const query = `
      SELECT id, user_id, is_revoked, expires_at
      FROM refresh_tokens
      WHERE token = $1 AND is_revoked = FALSE
    `;
    try {
      const result = await pool.query(query, [token]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Revoke refresh token
  revoke: async (token) => {
    const query = `
      UPDATE refresh_tokens
      SET is_revoked = TRUE
      WHERE token = $1
    `;
    try {
      await pool.query(query, [token]);
    } catch (err) {
      throw err;
    }
  },

  // Revoke all user tokens (logout from all devices)
  revokeAllUserTokens: async (userId) => {
    const query = `
      UPDATE refresh_tokens
      SET is_revoked = TRUE
      WHERE user_id = $1
    `;
    try {
      await pool.query(query, [userId]);
    } catch (err) {
      throw err;
    }
  },
};

module.exports = RefreshToken;

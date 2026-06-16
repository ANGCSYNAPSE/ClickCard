const pool = require('../config/database');

const ShareLink = {
  // Create a new share link
  create: async (userId, { customSlug, shortCode, shareMethod = 'link', expiryDate = null }) => {
    const query = `
      INSERT INTO share_links (user_id, custom_slug, short_code, share_method, expiry_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, custom_slug, short_code, is_active, share_method, created_at
    `;
    try {
      const result = await pool.query(query, [userId, customSlug, shortCode, shareMethod, expiryDate]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find share link by ID
  findById: async (id) => {
    const query = `
      SELECT * FROM share_links
      WHERE id = $1
    `;
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find share link by custom slug
  findBySlug: async (slug) => {
    const query = `
      SELECT * FROM share_links
      WHERE custom_slug = $1 AND is_active = TRUE
    `;
    try {
      const result = await pool.query(query, [slug]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find share link by short code
  findByShortCode: async (shortCode) => {
    const query = `
      SELECT * FROM share_links
      WHERE short_code = $1 AND is_active = TRUE
    `;
    try {
      const result = await pool.query(query, [shortCode]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Check if custom slug is already taken
  isSlugTaken: async (slug, excludeId = null) => {
    let query = 'SELECT COUNT(*) FROM share_links WHERE custom_slug = $1';
    const params = [slug];

    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }

    try {
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count) > 0;
    } catch (err) {
      throw err;
    }
  },

  // Check if short code is already taken
  isShortCodeTaken: async (shortCode, excludeId = null) => {
    let query = 'SELECT COUNT(*) FROM share_links WHERE short_code = $1';
    const params = [shortCode];

    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }

    try {
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count) > 0;
    } catch (err) {
      throw err;
    }
  },

  // Get all share links for a user
  findByUserId: async (userId) => {
    const query = `
      SELECT id, user_id, custom_slug, short_code, is_active, expiry_date, 
             view_count, unique_visitors, last_viewed, created_at, updated_at
      FROM share_links
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (err) {
      throw err;
    }
  },

  // Update share link settings
  update: async (id, updates) => {
    const { customSlug, isActive, expiryDate, sharePassword, requiresPassword } = updates;

    const query = `
      UPDATE share_links
      SET 
        custom_slug = COALESCE($1, custom_slug),
        is_active = COALESCE($2, is_active),
        expiry_date = $3,
        is_password_protected = COALESCE($4, is_password_protected),
        share_password = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, custom_slug, short_code, is_active, expiry_date, is_password_protected, updated_at
    `;

    try {
      const result = await pool.query(query, [
        customSlug || null,
        isActive !== undefined ? isActive : null,
        expiryDate || null,
        requiresPassword !== undefined ? requiresPassword : null,
        sharePassword || null,
        id,
      ]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Increment view count
  incrementViewCount: async (id) => {
    const query = `
      UPDATE share_links
      SET 
        view_count = view_count + 1,
        last_viewed = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING view_count, last_viewed
    `;
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Increment unique visitor count
  incrementUniqueVisitors: async (id) => {
    const query = `
      UPDATE share_links
      SET 
        unique_visitors = unique_visitors + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING unique_visitors
    `;
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Delete share link (soft delete - set inactive or hard delete)
  delete: async (id) => {
    const query = `
      UPDATE share_links
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, is_active
    `;
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Regenerate short code
  regenerateShortCode: async (id, newShortCode) => {
    const query = `
      UPDATE share_links
      SET short_code = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, short_code, updated_at
    `;
    try {
      const result = await pool.query(query, [newShortCode, id]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Check if link is expired
  isExpired: async (id) => {
    const query = `
      SELECT 
        CASE 
          WHEN expiry_date IS NULL THEN FALSE
          WHEN expiry_date > CURRENT_TIMESTAMP THEN FALSE
          ELSE TRUE
        END as is_expired
      FROM share_links
      WHERE id = $1
    `;
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0]?.is_expired || false;
    } catch (err) {
      throw err;
    }
  },

  // Get total view count across all links
  getTotalViews: async () => {
    const query = 'SELECT SUM(view_count) FROM share_links;';
    const result = await pool.query(query);
    return parseInt(result.rows[0].sum) || 0;
  },

  // Get view count for today across all links
  // This requires looking at the analytics table since share_links only has a total
  getTodayViews: async () => {
    const query = 'SELECT COUNT(*) FROM share_link_analytics WHERE viewed_at >= CURRENT_DATE;';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count) || 0;
  },
};

module.exports = { ShareLink };

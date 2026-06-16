const pool = require('../config/database');

const ShareLinkAnalytics = {
  // Record a view
  recordView: async (shareLinkId, { visitorIp, visitorUserAgent, referrerSource, deviceType, platform }) => {
    const query = `
      INSERT INTO share_link_analytics (share_link_id, visitor_ip, visitor_user_agent, referrer_source, device_type, platform)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, share_link_id, viewed_at
    `;
    try {
      const result = await pool.query(query, [
        shareLinkId,
        visitorIp || null,
        visitorUserAgent || null,
        referrerSource || null,
        deviceType || null,
        platform || null,
      ]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Get analytics for a share link
  getAnalytics: async (shareLinkId, period = 'all') => {
    let dateFilter = '';

    if (period === '7days') {
      dateFilter = "AND viewed_at >= NOW() - INTERVAL '7 days'";
    } else if (period === '30days') {
      dateFilter = "AND viewed_at >= NOW() - INTERVAL '30 days'";
    }

    const query = `
      SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT visitor_ip) as unique_visitors,
        COUNT(DISTINCT CASE WHEN device_type = 'mobile' THEN visitor_ip END) as mobile_views,
        COUNT(DISTINCT CASE WHEN device_type = 'desktop' THEN visitor_ip END) as desktop_views,
        COUNT(DISTINCT CASE WHEN device_type = 'tablet' THEN visitor_ip END) as tablet_views
      FROM share_link_analytics
      WHERE share_link_id = $1 ${dateFilter}
    `;

    try {
      const result = await pool.query(query, [shareLinkId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Get views by date
  getViewsByDate: async (shareLinkId, period = '30days') => {
    let limit = 30;
    if (period === '7days') {
      limit = 7;
    } else if (period === 'all') {
      limit = 365;
    }

    const query = `
      SELECT 
        DATE(viewed_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_ip) as unique_visitors
      FROM share_link_analytics
      WHERE share_link_id = $1 AND viewed_at >= CURRENT_TIMESTAMP - INTERVAL '${limit} days'
      GROUP BY DATE(viewed_at)
      ORDER BY date DESC
    `;

    try {
      const result = await pool.query(query, [shareLinkId]);
      return result.rows;
    } catch (err) {
      throw err;
    }
  },

  // Get device breakdown
  getDeviceBreakdown: async (shareLinkId) => {
    const query = `
      SELECT 
        device_type,
        COUNT(*) as count,
        COUNT(DISTINCT visitor_ip) as unique_count
      FROM share_link_analytics
      WHERE share_link_id = $1 AND device_type IS NOT NULL
      GROUP BY device_type
    `;

    try {
      const result = await pool.query(query, [shareLinkId]);
      return result.rows;
    } catch (err) {
      throw err;
    }
  },

  // Get top referrers
  getTopReferrers: async (shareLinkId, limit = 10) => {
    const query = `
      SELECT 
        referrer_source,
        COUNT(*) as count
      FROM share_link_analytics
      WHERE share_link_id = $1 AND referrer_source IS NOT NULL
      GROUP BY referrer_source
      ORDER BY count DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [shareLinkId, limit]);
      return result.rows;
    } catch (err) {
      throw err;
    }
  },

  // Get recent visitors
  getRecentVisitors: async (shareLinkId, limit = 20) => {
    const query = `
      SELECT 
        visitor_ip,
        visitor_user_agent,
        referrer_source,
        device_type,
        platform,
        viewed_at
      FROM share_link_analytics
      WHERE share_link_id = $1
      ORDER BY viewed_at DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [shareLinkId, limit]);
      return result.rows;
    } catch (err) {
      throw err;
    }
  },

  // Check if IP has visited in last N seconds (for duplicate prevention)
  hasVisitedRecently: async (shareLinkId, visitorIp, secondsThreshold = 10) => {
    const query = `
      SELECT COUNT(*) FROM share_link_analytics
      WHERE share_link_id = $1 
        AND visitor_ip = $2 
        AND viewed_at > CURRENT_TIMESTAMP - INTERVAL '${secondsThreshold} seconds'
    `;

    try {
      const result = await pool.query(query, [shareLinkId, visitorIp]);
      return parseInt(result.rows[0].count) > 0;
    } catch (err) {
      throw err;
    }
  },

  // Clear old analytics (older than X days)
  clearOldAnalytics: async (daysThreshold = 90) => {
    const query = `
      DELETE FROM share_link_analytics
      WHERE viewed_at < CURRENT_TIMESTAMP - INTERVAL '${daysThreshold} days'
    `;

    try {
      const result = await pool.query(query);
      return result.rowCount;
    } catch (err) {
      throw err;
    }
  },
};

module.exports = { ShareLinkAnalytics };

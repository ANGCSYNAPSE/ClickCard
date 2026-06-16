const pool = require('../config/database');

const ALLOWED_TYPES = new Set([
  'profile_view',
  'link_tap',
  'pdf_download',
  'card_share',
]);

const createAnalyticsEventTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGSERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(40) NOT NULL,
      slug VARCHAR(100),
      link_key VARCHAR(100),
      visitor_ip VARCHAR(50),
      visitor_user_agent VARCHAR(500),
      referrer_source VARCHAR(255),
      device_type VARCHAR(40),
      platform VARCHAR(40),
      meta JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(type);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
  `;
  try {
    await pool.query(query);
    console.log('analytics_events table ready');
  } catch (err) {
    console.error('Error creating analytics_events:', err.message);
  }
};

const AnalyticsEvent = {
  ALLOWED_TYPES,

  record: async ({
    userId,
    type,
    slug = null,
    linkKey = null,
    visitorIp = null,
    visitorUserAgent = null,
    referrerSource = null,
    deviceType = null,
    platform = null,
    meta = {},
  }) => {
    if (!ALLOWED_TYPES.has(type)) throw new Error(`Invalid analytics event type: ${type}`);
    const q = `
      INSERT INTO analytics_events
        (user_id, type, slug, link_key, visitor_ip, visitor_user_agent, referrer_source, device_type, platform, meta)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id, created_at
    `;
    const result = await pool.query(q, [
      userId, type, slug, linkKey,
      visitorIp, visitorUserAgent, referrerSource, deviceType, platform,
      JSON.stringify(meta || {}),
    ]);
    return result.rows[0];
  },

  // Aggregate dashboard counts for a single user
  dashboardForUser: async (userId) => {
    const totalsQ = `
      SELECT
        COUNT(*) FILTER (WHERE type = 'profile_view')::int  AS profile_views,
        COUNT(*) FILTER (WHERE type = 'link_tap')::int      AS link_taps,
        COUNT(*) FILTER (WHERE type = 'pdf_download')::int  AS pdf_downloads,
        COUNT(*) FILTER (WHERE type = 'card_share')::int    AS card_shares
      FROM analytics_events
      WHERE user_id = $1
    `;
    const todayQ = `
      SELECT
        COUNT(*) FILTER (WHERE type = 'profile_view')::int  AS profile_views,
        COUNT(*) FILTER (WHERE type = 'link_tap')::int      AS link_taps,
        COUNT(*) FILTER (WHERE type = 'pdf_download')::int  AS pdf_downloads
      FROM analytics_events
      WHERE user_id = $1 AND created_at::date = CURRENT_DATE
    `;
    const trendQ = `
      SELECT TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
             COALESCE(COUNT(*) FILTER (WHERE e.type = 'profile_view'),0)::int AS profile_views,
             COALESCE(COUNT(*) FILTER (WHERE e.type = 'link_tap'),0)::int     AS link_taps,
             COALESCE(COUNT(*) FILTER (WHERE e.type = 'pdf_download'),0)::int AS pdf_downloads
      FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS d(day)
      LEFT JOIN analytics_events e
        ON e.user_id = $1 AND e.created_at::date = d.day
      GROUP BY d.day
      ORDER BY d.day
    `;
    const linksCountQ = `
      SELECT COUNT(*)::int AS active_links
      FROM share_links
      WHERE user_id = $1 AND is_active = TRUE
    `;

    const [totals, today, trend, links] = await Promise.all([
      pool.query(totalsQ, [userId]),
      pool.query(todayQ, [userId]),
      pool.query(trendQ, [userId]),
      pool.query(linksCountQ, [userId]),
    ]);

    return {
      totals: {
        profileViews: totals.rows[0].profile_views || 0,
        linkTaps: totals.rows[0].link_taps || 0,
        pdfDownloads: totals.rows[0].pdf_downloads || 0,
        cardShares: totals.rows[0].card_shares || 0,
        activeLinks: links.rows[0].active_links || 0,
      },
      today: {
        profileViews: today.rows[0].profile_views || 0,
        linkTaps: today.rows[0].link_taps || 0,
        pdfDownloads: today.rows[0].pdf_downloads || 0,
      },
      trend: trend.rows,
    };
  },

  recentForUser: async (userId, limit = 20) => {
    const q = `
      SELECT id, type, slug, link_key, device_type, platform, referrer_source, meta, created_at
      FROM analytics_events
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(q, [userId, limit]);
    return result.rows;
  },
};

module.exports = { AnalyticsEvent, createAnalyticsEventTable };

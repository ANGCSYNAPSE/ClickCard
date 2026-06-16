const pool = require('../config/database');

/**
 * Plans live in the DB so admins can edit them at runtime. We still seed from
 * `config/plans.js` on first run so the entitlement key list / verticals
 * remain the canonical source of truth for code. Admins can change pricing,
 * names and limits via the admin panel; entitlement bundles stay in code.
 */

const createPlanTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS plans (
      id VARCHAR(40) PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      tagline VARCHAR(200),
      price_monthly INT NOT NULL DEFAULT 0,
      price_yearly INT NOT NULL DEFAULT 0,
      currency VARCHAR(8) NOT NULL DEFAULT 'INR',
      limits JSONB NOT NULL DEFAULT '{}'::jsonb,
      verticals JSONB NOT NULL DEFAULT '[]'::jsonb,
      entitlements JSONB NOT NULL DEFAULT '[]'::jsonb,
      popular BOOLEAN DEFAULT FALSE,
      is_published BOOLEAN DEFAULT TRUE,
      sort_order INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('plans table ready');
    await seedFromConfig();
  } catch (err) {
    console.error('Error creating plans table:', err.message);
  }
};

async function seedFromConfig() {
  try {
    const { PLANS } = require('../config/plans');
    const r = await pool.query('SELECT COUNT(*)::int AS c FROM plans');
    if (r.rows[0].c > 0) return;
    for (let i = 0; i < PLANS.length; i++) {
      const p = PLANS[i];
      const limits = {};
      Object.entries(p.limits || {}).forEach(([k, v]) => {
        limits[k] = v === Infinity ? -1 : v;
      });
      await pool.query(
        `INSERT INTO plans (id, name, tagline, price_monthly, price_yearly, currency,
                            limits, verticals, entitlements, popular, is_published, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          p.id, p.name, p.tagline || '', p.priceMonthly || 0, p.priceYearly || 0,
          p.currency || 'INR',
          JSON.stringify(limits),
          JSON.stringify(p.verticals || []),
          JSON.stringify(p.entitlements || []),
          !!p.popular, true, i,
        ],
      );
    }
    console.log('plans seeded from config (', PLANS.length, ')');
  } catch (err) {
    console.error('plans seed error:', err.message);
  }
}

function rowToPlan(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    tagline: r.tagline || '',
    priceMonthly: r.price_monthly,
    priceYearly: r.price_yearly,
    currency: r.currency,
    limits: r.limits || {},
    verticals: r.verticals || [],
    entitlements: r.entitlements || [],
    popular: !!r.popular,
    isPublished: !!r.is_published,
    sortOrder: r.sort_order,
  };
}

const Plan = {
  listPublished: async () => {
    const r = await pool.query(
      'SELECT * FROM plans WHERE is_published = TRUE ORDER BY sort_order, price_monthly',
    );
    return r.rows.map(rowToPlan);
  },

  listAll: async () => {
    const r = await pool.query('SELECT * FROM plans ORDER BY sort_order, price_monthly');
    return r.rows.map(rowToPlan);
  },

  findById: async (id) => {
    const r = await pool.query('SELECT * FROM plans WHERE id = $1', [id]);
    return rowToPlan(r.rows[0]);
  },

  upsert: async (data) => {
    const id = data.id;
    if (!id) throw new Error('Plan id is required');
    const limits = data.limits || {};
    const r = await pool.query(
      `INSERT INTO plans (id, name, tagline, price_monthly, price_yearly, currency,
                          limits, verticals, entitlements, popular, is_published, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         tagline = EXCLUDED.tagline,
         price_monthly = EXCLUDED.price_monthly,
         price_yearly = EXCLUDED.price_yearly,
         currency = EXCLUDED.currency,
         limits = EXCLUDED.limits,
         verticals = EXCLUDED.verticals,
         entitlements = EXCLUDED.entitlements,
         popular = EXCLUDED.popular,
         is_published = EXCLUDED.is_published,
         sort_order = EXCLUDED.sort_order,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        id, data.name || id, data.tagline || '',
        data.priceMonthly || 0, data.priceYearly || 0, data.currency || 'INR',
        JSON.stringify(limits),
        JSON.stringify(data.verticals || []),
        JSON.stringify(data.entitlements || []),
        !!data.popular, data.isPublished !== false, data.sortOrder || 0,
      ],
    );
    return rowToPlan(r.rows[0]);
  },

  remove: async (id) => {
    await pool.query('DELETE FROM plans WHERE id = $1', [id]);
    return { id };
  },
};

module.exports = { Plan, createPlanTable };

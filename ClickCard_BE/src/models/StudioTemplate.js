const pool = require('../config/database');

const CATEGORIES = ['resume', 'visiting_card', 'qr_poster'];

const createStudioTemplateTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS studio_templates (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(80) UNIQUE NOT NULL,
      name VARCHAR(120) NOT NULL,
      category VARCHAR(30) NOT NULL,
      description TEXT,
      preview_url VARCHAR(500),
      width INT NOT NULL DEFAULT 1200,
      height INT NOT NULL DEFAULT 1600,
      primary_color VARCHAR(20) DEFAULT '#6E2BFF',
      accent_color VARCHAR(20) DEFAULT '#FF4D8D',
      html_template TEXT,
      is_premium BOOLEAN DEFAULT FALSE,
      is_published BOOLEAN DEFAULT FALSE,
      created_by INT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_studio_templates_category ON studio_templates(category);
    CREATE INDEX IF NOT EXISTS idx_studio_templates_published ON studio_templates(is_published);
  `;
  try {
    await pool.query(query);
    console.log('studio_templates table ready');
    await seedDefaults();
  } catch (err) {
    console.error('Error creating studio_templates:', err.message);
  }
};

// Seed a handful of starter templates so Studio is non-empty out of the box.
async function seedDefaults() {
  try {
    const count = await pool.query('SELECT COUNT(*)::int AS c FROM studio_templates');
    if (count.rows[0].c > 0) return;
    const seeds = [
      { slug: 'resume-modern',   name: 'Modern Resume',     category: 'resume',        description: 'Clean two-column layout for professionals.',  preview: null },
      { slug: 'resume-elegant',  name: 'Elegant Resume',    category: 'resume',        description: 'Serif-led, magazine-style résumé.',           preview: null },
      { slug: 'card-aurora',     name: 'Aurora Card',       category: 'visiting_card', description: 'Gradient header with rounded info card.',     preview: null },
      { slug: 'card-mono',       name: 'Minimal Mono Card', category: 'visiting_card', description: 'Single-colour, whitespace-rich card.',        preview: null },
      { slug: 'qr-poster-coral', name: 'Coral QR Poster',   category: 'qr_poster',     description: 'Vibrant poster framing a large QR code.',     preview: null },
      { slug: 'qr-poster-ocean', name: 'Ocean QR Poster',   category: 'qr_poster',     description: 'Cool gradient with prominent QR + tagline.',  preview: null },
    ];
    for (const t of seeds) {
      await pool.query(
        `INSERT INTO studio_templates (slug, name, category, description, preview_url, is_published)
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [t.slug, t.name, t.category, t.description, t.preview],
      );
    }
    console.log('studio_templates seeded with', seeds.length, 'starter templates');
  } catch (err) {
    console.error('studio_templates seed error:', err.message);
  }
}

const StudioTemplate = {
  CATEGORIES,

  listPublic: async (category) => {
    const params = [];
    let where = 'WHERE is_published = TRUE';
    if (category && CATEGORIES.includes(category)) {
      params.push(category);
      where += ` AND category = $${params.length}`;
    }
    const r = await pool.query(
      `SELECT id, slug, name, category, description, preview_url, width, height,
              primary_color, accent_color, is_premium
         FROM studio_templates ${where}
         ORDER BY category, name`,
      params,
    );
    return r.rows;
  },

  listAll: async () => {
    const r = await pool.query(`SELECT * FROM studio_templates ORDER BY category, name`);
    return r.rows;
  },

  findBySlug: async (slug) => {
    const r = await pool.query('SELECT * FROM studio_templates WHERE slug = $1', [slug]);
    return r.rows[0];
  },

  findById: async (id) => {
    const r = await pool.query('SELECT * FROM studio_templates WHERE id = $1', [id]);
    return r.rows[0];
  },

  create: async (data, createdBy) => {
    const r = await pool.query(
      `INSERT INTO studio_templates
         (slug, name, category, description, preview_url, width, height,
          primary_color, accent_color, html_template, is_premium, is_published, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        data.slug, data.name, data.category, data.description || '',
        data.preview_url || null, data.width || 1200, data.height || 1600,
        data.primary_color || '#6E2BFF', data.accent_color || '#FF4D8D',
        data.html_template || null, !!data.is_premium, !!data.is_published, createdBy || null,
      ],
    );
    return r.rows[0];
  },

  update: async (id, data) => {
    const fields = [
      'name', 'category', 'description', 'preview_url', 'width', 'height',
      'primary_color', 'accent_color', 'html_template', 'is_premium', 'is_published',
    ];
    const sets = [];
    const params = [];
    fields.forEach((f) => {
      if (data[f] !== undefined) {
        params.push(data[f]);
        sets.push(`${f} = $${params.length}`);
      }
    });
    if (sets.length === 0) return StudioTemplate.findById(id);
    params.push(id);
    const r = await pool.query(
      `UPDATE studio_templates SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${params.length} RETURNING *`,
      params,
    );
    return r.rows[0];
  },

  remove: async (id) => {
    await pool.query('DELETE FROM studio_templates WHERE id = $1', [id]);
    return { id };
  },
};

module.exports = { StudioTemplate, createStudioTemplateTable, CATEGORIES };

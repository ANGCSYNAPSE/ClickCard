/**
 * One-time idempotent admin seed.
 *
 * Creates (or promotes + resets) the platform admin account so the admin panel
 * can log in with EMAIL + PASSWORD (no OTP).
 *
 * Usage:  npm run seed:admin
 * Override defaults with env: ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { createUserTable } = require('../models/User');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@angc.com').toLowerCase();
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ClickCard@Admin1';

async function seedAdmin() {
  try {
    // Ensure tables exist (no-op if already created).
    await createUserTable();

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);

    if (existing.rows.length > 0) {
      const { id } = existing.rows[0];
      await pool.query(
        `UPDATE users
           SET role = 'admin', password = $1, is_email_verified = TRUE,
               is_blocked = FALSE, moderation_status = 'approved', updated_at = NOW()
         WHERE id = $2`,
        [hashedPassword, id],
      );
      console.log(`✓ Existing user ${ADMIN_EMAIL} updated → admin (id ${id}), password reset.`);
    } else {
      const insert = await pool.query(
        `INSERT INTO users
           (email, username, password, first_name, role, is_email_verified, moderation_status, is_blocked)
         VALUES ($1, $2, $3, $4, 'admin', TRUE, 'approved', FALSE)
         RETURNING id`,
        [ADMIN_EMAIL, ADMIN_USERNAME, hashedPassword, 'Admin'],
      );
      console.log(`✓ Admin account created: ${ADMIN_EMAIL} (id ${insert.rows[0].id}, role=admin).`);
    }

    console.log('\n  Admin panel login (email + password):');
    console.log(`    Email:    ${ADMIN_EMAIL}`);
    console.log(`    Password: ${ADMIN_PASSWORD}`);
    console.log('  Change it by setting ADMIN_PASSWORD before running this script.\n');
  } catch (err) {
    console.error('✗ Failed to seed admin:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedAdmin();

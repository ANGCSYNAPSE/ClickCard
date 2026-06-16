const pool = require('../config/database');

class Subscription {
  static async getActive(userId) {
    const query = `
      SELECT * FROM subscriptions
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Activate a plan for a user. Supersedes any current active subscription
   * (the partial unique index allows only one active row per user).
   */
  static async activate(userId, data) {
    const {
      planId,
      billingCycle = 'monthly',
      provider = null,
      providerRef = null,
      amount = 0,
      currency = 'INR',
      periodEnd = null,
    } = data;

    await pool.query(
      `UPDATE subscriptions SET status = 'canceled', updated_at = NOW()
       WHERE user_id = $1 AND status = 'active';`,
      [userId],
    );

    const insert = `
      INSERT INTO subscriptions
        (user_id, plan_id, status, billing_cycle, provider, provider_ref, amount, currency, current_period_end)
      VALUES ($1, $2, 'active', $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const result = await pool.query(insert, [
      userId, planId, billingCycle, provider, providerRef, amount, currency, periodEnd,
    ]);
    return result.rows[0];
  }

  static async cancel(userId) {
    const query = `
      UPDATE subscriptions SET status = 'canceled', updated_at = NOW()
      WHERE user_id = $1 AND status = 'active'
      RETURNING *;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async findByProviderRef(providerRef) {
    const query = `SELECT * FROM subscriptions WHERE provider_ref = $1 LIMIT 1;`;
    const result = await pool.query(query, [providerRef]);
    return result.rows[0] || null;
  }
}

module.exports = Subscription;

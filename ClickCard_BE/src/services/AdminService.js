const { User } = require('../models/User');
const { ShareLink } = require('../models/ShareLink');
const Lead = require('../models/Lead');

class AdminService {
  static async getDashboardStats() {
    try {
      const [
        totalUsers,
        newUsersToday,
        profileCompleteCount,
        publicProfileCount,
        totalViews,
        viewsToday,
        totalLeads,
        leadsToday
      ] = await Promise.all([
        User.getCount(),
        User.getTodayCount(),
        User.getProfileCompleteCount(),
        User.getPublicProfileCount(),
        ShareLink.getTotalViews(),
        ShareLink.getTodayViews(),
        Lead.getCount(),
        Lead.getTodayCount()
      ]);

      return {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          profileComplete: profileCompleteCount,
          publicEnabled: publicProfileCount
        },
        engagement: {
          totalViews: totalViews,
          viewsToday: viewsToday
        },
        leads: {
          total: totalLeads,
          today: leadsToday
        }
      };
    } catch (err) {
      throw err;
    }
  }

  static async getAllUsers() {
    try {
      return await User.findAll();
    } catch (err) {
      throw err;
    }
  }

  static async getAllLeads() {
    try {
      return await Lead.findAll();
    } catch (err) {
      throw err;
    }
  }

  static async getUserDetails(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const profile = await User.getProfile(userId);
      const links = await ShareLink.findByUserId(userId);
      const leads = await Lead.findByUserId(userId);

      return {
        ...user,
        profile,
        links,
        leads
      };
    } catch (err) {
      throw err;
    }
  }

  static async updateUserBlockStatus(userId, isBlocked) {
    try {
      return await User.updateBlockStatus(userId, isBlocked);
    } catch (err) {
      throw err;
    }
  }

  static async updateUserModerationStatus(userId, status) {
    try {
      return await User.updateModerationStatus(userId, status);
    } catch (err) {
      throw err;
    }
  }

  static async getSystemSettings() {
    try {
      const SystemSettings = require('../models/SystemSettings');
      return await SystemSettings.getAll();
    } catch (err) {
      throw err;
    }
  }

  static async updateSystemSetting(key, value) {
    try {
      const SystemSettings = require('../models/SystemSettings');
      return await SystemSettings.update(key, value);
    } catch (err) {
      throw err;
    }
  }

  /** Revenue & subscription breakdown for the admin dashboard. */
  static async getRevenueStats() {
    const pool = require('../config/database');
    const byPlan = await pool.query(`
      SELECT plan_id,
             COUNT(*)::int AS subscribers,
             COALESCE(SUM(amount), 0)::int AS revenue
      FROM subscriptions
      WHERE status = 'active'
      GROUP BY plan_id;
    `);
    const totals = await pool.query(`
      SELECT COUNT(*)::int AS active_subscriptions,
             COALESCE(SUM(amount), 0)::int AS mrr
      FROM subscriptions
      WHERE status = 'active' AND plan_id <> 'free';
    `);
    const trend = await pool.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS date,
             COALESCE(SUM(amount), 0)::int AS revenue
      FROM subscriptions
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY 1 ORDER BY 1;
    `);
    return {
      activeSubscriptions: totals.rows[0]?.active_subscriptions || 0,
      mrr: totals.rows[0]?.mrr || 0,
      byPlan: byPlan.rows,
      trend: trend.rows,
    };
  }
}

module.exports = AdminService;

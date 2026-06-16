const AnalyticsService = require('../services/AnalyticsService');
const { ShareLink } = require('../models/ShareLink');
const { User } = require('../models/User');
const { responseHandler, sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');

const ALLOWED = ['profile_view', 'link_tap', 'pdf_download', 'card_share'];

class AnalyticsController {
  /**
   * POST /api/analytics/track  (public)
   * Body: { type, slug?, userId?, linkKey?, meta? }
   * Resolves owner via slug → share_link → user_id when not provided.
   */
  static async track(req, res) {
    try {
      const { type, slug, userId: bodyUserId, linkKey, meta } = req.body || {};
      if (!type || !ALLOWED.includes(type)) {
        return responseHandler(res, 400, false, null, 'Invalid event type');
      }

      let userId = bodyUserId ? parseInt(bodyUserId, 10) : null;

      if (!userId && slug) {
        let link = await ShareLink.findBySlug(slug);
        if (!link) link = await ShareLink.findByShortCode(slug);
        if (link) userId = link.user_id;
        if (!userId) {
          const u = await User.findByUsername(slug);
          if (u) userId = u.id;
        }
      }

      if (!userId) {
        return responseHandler(res, 404, false, null, 'Unable to resolve target user');
      }

      await AnalyticsService.recordEvent({
        userId,
        type,
        slug: slug || null,
        linkKey: linkKey || null,
        meta: meta || {},
      }, req);

      return responseHandler(res, 200, true, { recorded: true }, 'Event tracked');
    } catch (err) {
      console.error('Analytics track error:', err);
      return responseHandler(res, 500, false, null, 'Failed to track event');
    }
  }

  /** GET /api/analytics/dashboard  (auth) */
  static async dashboard(req, res) {
    try {
      const userId = req.user.id;
      const data = await AnalyticsService.getUserDashboard(userId);
      return sendSuccessResponse(res, 200, 'Dashboard analytics retrieved', data);
    } catch (err) {
      console.error('Analytics dashboard error:', err);
      return sendErrorResponse(res, 500, 'Failed to load analytics');
    }
  }

  /** GET /api/analytics/recent  (auth) */
  static async recent(req, res) {
    try {
      const userId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const rows = await AnalyticsService.getRecentEvents(userId, limit);
      return sendSuccessResponse(res, 200, 'Recent analytics retrieved', rows);
    } catch (err) {
      console.error('Analytics recent error:', err);
      return sendErrorResponse(res, 500, 'Failed to load recent events');
    }
  }

  /** GET /api/admin/users/:id/analytics  (admin) */
  static async adminUserAnalytics(req, res) {
    try {
      const targetId = parseInt(req.params.id, 10);
      const [dashboard, recent] = await Promise.all([
        AnalyticsService.getUserDashboard(targetId),
        AnalyticsService.getRecentEvents(targetId, 20),
      ]);
      return sendSuccessResponse(res, 200, 'User analytics retrieved', { ...dashboard, recent });
    } catch (err) {
      console.error('Admin user analytics error:', err);
      return sendErrorResponse(res, 500, 'Failed to load user analytics');
    }
  }
}

module.exports = AnalyticsController;

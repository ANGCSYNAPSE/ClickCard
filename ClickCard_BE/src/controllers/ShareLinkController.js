const ShareLinkService = require('../services/ShareLinkService');
const AnalyticsService = require('../services/AnalyticsService');
const { responseHandler } = require('../utils/responseHandler');

class ShareLinkController {
  /**
   * POST /share/create - Create a new share link
   */
  static async createShareLink(req, res) {
    try {
      const userId = req.user.userId;
      const { custom_slug, expiry_days, requires_password, share_password } = req.body;

      // Validation
      if (requires_password && !share_password) {
        return responseHandler(res, 400, false, null, 'Password required when password protection is enabled');
      }

      if (share_password && share_password.length < 4) {
        return responseHandler(res, 400, false, null, 'Password must be at least 4 characters');
      }

      const shareLink = await ShareLinkService.createShareLink(userId, {
        customSlug: custom_slug,
        expiryDays: expiry_days,
        requiresPassword: requires_password,
        sharePassword: share_password,
      });

      return responseHandler(res, 201, true, shareLink, 'Share link created successfully');
    } catch (err) {
      console.error('Error creating share link:', err);
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }

  /**
   * GET /share/links - Get all share links for user
   */
  static async getUserShareLinks(req, res) {
    try {
      const userId = req.user.userId;

      const shareLinks = await ShareLinkService.getUserShareLinks(userId);

      return responseHandler(res, 200, true, shareLinks, 'Share links retrieved successfully');
    } catch (err) {
      console.error('Error fetching share links:', err);
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }

  /**
   * POST /share/update/:id - Update share link settings
   */
  static async updateShareLink(req, res) {
    try {
      const userId = req.user.userId;
      const shareLinkId = parseInt(req.params.id);
      const { custom_slug, is_active, expiry_date, requires_password, share_password } = req.body;

      if (requires_password && !share_password) {
        return responseHandler(res, 400, false, null, 'Password required when password protection is enabled');
      }

      const updated = await ShareLinkService.updateShareLink(shareLinkId, userId, {
        customSlug: custom_slug,
        isActive: is_active,
        expiryDate: expiry_date,
        requiresPassword: requires_password,
        sharePassword: share_password,
      });

      return responseHandler(res, 200, true, updated, 'Share link updated successfully');
    } catch (err) {
      console.error('Error updating share link:', err);
      if (err.message.includes('not found')) {
        return responseHandler(res, 404, false, null, err.message);
      }
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }

  /**
   * DELETE /share/:id - Delete share link
   */
  static async deleteShareLink(req, res) {
    try {
      const userId = req.user.userId;
      const shareLinkId = parseInt(req.params.id);

      const deleted = await ShareLinkService.deleteShareLink(shareLinkId, userId);

      return responseHandler(res, 200, true, deleted, 'Share link deleted successfully');
    } catch (err) {
      console.error('Error deleting share link:', err);
      if (err.message.includes('not found')) {
        return responseHandler(res, 404, false, null, err.message);
      }
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }

  /**
   * POST /share/:id/regenerate - Regenerate short code and QR
   */
  static async regenerateShortCode(req, res) {
    try {
      const userId = req.user.userId;
      const shareLinkId = parseInt(req.params.id);

      const regenerated = await ShareLinkService.regenerateShortCode(shareLinkId, userId);

      return responseHandler(res, 200, true, regenerated, 'Short code regenerated successfully');
    } catch (err) {
      console.error('Error regenerating short code:', err);
      if (err.message.includes('not found')) {
        return responseHandler(res, 404, false, null, err.message);
      }
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }

  /**
   * GET /share/:id/analytics - Get analytics for a share link
   */
  static async getShareLinkAnalytics(req, res) {
    try {
      const userId = req.user.userId;
      const shareLinkId = parseInt(req.params.id);
      const { period = '30days' } = req.query;

      if (!['7days', '30days', 'all'].includes(period)) {
        return responseHandler(res, 400, false, null, 'Invalid period. Use: 7days, 30days, or all');
      }

      const analytics = await AnalyticsService.getAnalytics(shareLinkId, userId, period);

      return responseHandler(res, 200, true, analytics, 'Analytics retrieved successfully');
    } catch (err) {
      console.error('Error fetching analytics:', err);
      if (err.message.includes('not found')) {
        return responseHandler(res, 404, false, null, err.message);
      }
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }

  /**
   * GET /share/:id/qr - Get QR code for share link
   */
  static async getQRCode(req, res) {
    try {
      const userId = req.user.userId;
      const shareLinkId = parseInt(req.params.id);
      const { format = 'dataurl' } = req.query;

      if (!['dataurl', 'buffer'].includes(format)) {
        return responseHandler(res, 400, false, null, 'Invalid format. Use: dataurl or buffer');
      }

      if (format === 'buffer') {
        const qrBuffer = await ShareLinkService.getQRCode(shareLinkId, userId, 'buffer');
        res.setHeader('Content-Type', 'image/png');
        return res.send(qrBuffer);
      }

      const qrDataUrl = await ShareLinkService.getQRCode(shareLinkId, userId, 'dataurl');

      return responseHandler(res, 200, true, { qr_code: qrDataUrl }, 'QR code generated successfully');
    } catch (err) {
      console.error('Error generating QR code:', err);
      if (err.message.includes('not found')) {
        return responseHandler(res, 404, false, null, err.message);
      }
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }

  /**
   * GET /analytics/all - Get analytics for all user's share links
   */
  static async getAllUserAnalytics(req, res) {
    try {
      const userId = req.user.userId;

      const allAnalytics = await AnalyticsService.getUserAnalytics(userId);

      return responseHandler(res, 200, true, allAnalytics, 'All analytics retrieved successfully');
    } catch (err) {
      console.error('Error fetching all analytics:', err);
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }
}

module.exports = ShareLinkController;

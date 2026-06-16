const { ShareLinkAnalytics } = require('../models/ShareLinkAnalytics');
const { ShareLink } = require('../models/ShareLink');
const { AnalyticsEvent } = require('../models/AnalyticsEvent');

class AnalyticsService {
  /**
   * Record a generic user-scoped analytics event.
   * Types: profile_view, link_tap, pdf_download, card_share
   */
  static async recordEvent(payload, req = null) {
    const enriched = { ...payload };
    if (req) {
      const ua = req.get ? req.get('user-agent') : null;
      enriched.visitorUserAgent = enriched.visitorUserAgent || ua || null;
      enriched.visitorIp = enriched.visitorIp || req.ip || (req.connection && req.connection.remoteAddress) || null;
      enriched.referrerSource = enriched.referrerSource || (req.get ? req.get('referer') : null) || null;
      enriched.deviceType = enriched.deviceType || AnalyticsService.extractDeviceType(ua || '');
      enriched.platform = enriched.platform || AnalyticsService.extractPlatform(ua || '');
    }
    return AnalyticsEvent.record(enriched);
  }

  /** Aggregated dashboard counts for the authenticated user. */
  static async getUserDashboard(userId) {
    return AnalyticsEvent.dashboardForUser(userId);
  }

  /** Recent events list (admin or owner). */
  static async getRecentEvents(userId, limit = 20) {
    return AnalyticsEvent.recentForUser(userId, limit);
  }

  /**
   * Record a view for a share link
   * @param {number} shareLinkId - Share link ID
   * @param {object} visitorData - Visitor information
   * @returns {object} - Recorded view
   */
  static async recordView(shareLinkId, visitorData = {}) {
    try {
      const { visitorIp, visitorUserAgent, referrerSource, deviceType, platform } = visitorData;

      // Record analytics
      const view = await ShareLinkAnalytics.recordView(shareLinkId, {
        visitorIp,
        visitorUserAgent,
        referrerSource,
        deviceType,
        platform,
      });

      // Check if this is a unique visitor (not visited in last 10 seconds)
      const isNewVisitor = !(await ShareLinkAnalytics.hasVisitedRecently(
        shareLinkId,
        visitorIp,
        10
      ));

      // Update share link view counts
      await ShareLink.incrementViewCount(shareLinkId);

      if (isNewVisitor && visitorIp) {
        await ShareLink.incrementUniqueVisitors(shareLinkId);
      }

      return {
        id: view.id,
        share_link_id: view.share_link_id,
        is_unique: isNewVisitor,
        viewed_at: view.viewed_at,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get analytics for a share link
   * @param {number} shareLinkId - Share link ID
   * @param {number} userId - User ID (for authorization)
   * @param {string} period - Time period: '7days', '30days', 'all'
   * @returns {object} - Comprehensive analytics
   */
  static async getAnalytics(shareLinkId, userId, period = '30days') {
    try {
      // Verify authorization
      const shareLink = await ShareLink.findById(shareLinkId);
      if (!shareLink || shareLink.user_id !== userId) {
        throw new Error('Share link not found or unauthorized');
      }

      // Get summary analytics
      const summary = await ShareLinkAnalytics.getAnalytics(shareLinkId, period);

      // Get views by date
      const viewsByDate = await ShareLinkAnalytics.getViewsByDate(shareLinkId, period);

      // Get device breakdown
      const deviceBreakdown = await ShareLinkAnalytics.getDeviceBreakdown(shareLinkId);

      // Get top referrers
      const topReferrers = await ShareLinkAnalytics.getTopReferrers(shareLinkId, 5);

      // Get recent visitors
      const recentVisitors = await ShareLinkAnalytics.getRecentVisitors(shareLinkId, 10);

      return {
        summary: {
          total_views: parseInt(summary.total_views) || 0,
          unique_visitors: parseInt(summary.unique_visitors) || 0,
          mobile_views: parseInt(summary.mobile_views) || 0,
          desktop_views: parseInt(summary.desktop_views) || 0,
          tablet_views: parseInt(summary.tablet_views) || 0,
        },
        device_breakdown: deviceBreakdown.map((device) => ({
          type: device.device_type || 'unknown',
          count: parseInt(device.count),
          unique_count: parseInt(device.unique_count),
        })),
        top_referrers: topReferrers.map((ref) => ({
          source: ref.referrer_source || 'direct',
          count: parseInt(ref.count),
        })),
        views_by_date: viewsByDate.map((vbd) => ({
          date: vbd.date,
          views: parseInt(vbd.views),
          unique_visitors: parseInt(vbd.unique_visitors),
        })),
        recent_visitors: recentVisitors.map((visitor) => ({
          ip: this.maskIP(visitor.visitor_ip),
          device: visitor.device_type || 'unknown',
          platform: visitor.platform || 'unknown',
          referrer: visitor.referrer_source || 'direct',
          viewed_at: visitor.viewed_at,
        })),
        period,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get simple analytics (dashboard widget)
   * @param {number} shareLinkId - Share link ID
   * @param {number} userId - User ID (for authorization)
   * @returns {object} - Simple analytics summary
   */
  static async getSimpleAnalytics(shareLinkId, userId) {
    try {
      const shareLink = await ShareLink.findById(shareLinkId);
      if (!shareLink || shareLink.user_id !== userId) {
        throw new Error('Share link not found or unauthorized');
      }

      return {
        id: shareLink.id,
        short_code: shareLink.short_code,
        view_count: shareLink.view_count,
        unique_visitors: shareLink.unique_visitors,
        last_viewed: shareLink.last_viewed,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get analytics for all user's share links
   * @param {number} userId - User ID
   * @returns {array} - Analytics for all links
   */
  static async getUserAnalytics(userId) {
    try {
      const shareLinks = await ShareLink.findByUserId(userId);

      return shareLinks.map((link) => ({
        id: link.id,
        short_code: link.short_code,
        custom_slug: link.custom_slug,
        view_count: link.view_count,
        unique_visitors: link.unique_visitors,
        last_viewed: link.last_viewed,
        created_at: link.created_at,
      }));
    } catch (err) {
      throw err;
    }
  }

  /**
   * Mask IP address for privacy
   * @param {string} ip - Full IP address
   * @returns {string} - Masked IP address
   */
  static maskIP(ip) {
    if (!ip) return 'unknown';

    const parts = ip.split('.');
    if (parts.length !== 4) return ip;

    return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  }

  /**
   * Calculate bounce rate (simplified)
   * @param {number} shareLinkId - Share link ID
   * @returns {number} - Bounce rate percentage
   */
  static async calculateBounceRate(shareLinkId) {
    try {
      // Simplified: treat as low bounce rate if repeated visitors
      const summary = await ShareLinkAnalytics.getAnalytics(shareLinkId);
      const uniqueRatio = summary.unique_visitors / summary.total_views;

      // Higher unique ratio = higher bounce rate (people visit once)
      return Math.round(uniqueRatio * 100);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Clear old analytics (admin function)
   * @param {number} daysThreshold - Days to keep (delete older)
   * @returns {number} - Number of records deleted
   */
  static async clearOldAnalytics(daysThreshold = 90) {
    try {
      const deleted = await ShareLinkAnalytics.clearOldAnalytics(daysThreshold);
      return deleted;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Extract device type from user agent
   * @param {string} userAgent - User agent string
   * @returns {string} - Device type: 'mobile', 'tablet', 'desktop'
   */
  static extractDeviceType(userAgent) {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();

    if (/mobile|android|iphone|ipod|windows phone/i.test(ua)) {
      return 'mobile';
    }

    if (/tablet|ipad|kindle|playbook|silk/i.test(ua)) {
      return 'tablet';
    }

    return 'desktop';
  }

  /**
   * Extract platform from user agent
   * @param {string} userAgent - User agent string
   * @returns {string} - Platform: 'android', 'ios', 'windows', 'mac', 'linux'
   */
  static extractPlatform(userAgent) {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();

    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod|mac/i.test(ua)) return 'ios';
    if (/windows/i.test(ua)) return 'windows';
    if (/linux/i.test(ua)) return 'linux';

    return 'unknown';
  }
}

module.exports = AnalyticsService;

const PDFService = require('../services/PDFService');
const { renderCardHtml, TEMPLATES } = require('../services/CardTemplateService');
const { renderCardPdf } = require('../services/CardPDFService');
const { ShareLink } = require('../models/ShareLink');
const { User } = require('../models/User');
const ShareLinkService = require('../services/ShareLinkService');
const AnalyticsService = require('../services/AnalyticsService');
const pool = require('../config/database');
const { responseHandler } = require('../utils/responseHandler');

class PDFController {
  /**
   * GET /api/public/profile/:identifier/resume.pdf
   * Download PDF resume for a public profile
   * Access: Public (respects share link settings)
   * Optional query: ?password=xxx (for password-protected profiles)
   */
  static async downloadPublicResumePDF(req, res) {
    try {
      const { identifier } = req.params;
      const { password } = req.query;

      // Resolve share link (same as public profile lookup)
      let shareLink = await ShareLink.findBySlug(identifier);
      if (!shareLink) shareLink = await ShareLink.findByShortCode(identifier);
      if (!shareLink && !isNaN(identifier)) {
        const links = await ShareLink.findByUserId(parseInt(identifier));
        shareLink = Array.isArray(links) ? links.find((sl) => sl.is_active) : null;
      }

      if (!shareLink) {
        return responseHandler(res, 404, false, null, 'Profile not found');
      }

      // Check share link accessibility (active, not expired, etc.)
      const accessibility = ShareLinkService.checkAccessibility(shareLink);
      if (!accessibility.accessible) {
        return responseHandler(res, 403, false, null, accessibility.message);
      }

      // Check password protection
      if (shareLink.is_password_protected) {
        if (!password) {
          return responseHandler(res, 403, false, null, 'Password required to access this PDF');
        }
        const passwordValid = await ShareLinkService.verifyShareLinkPassword(password, shareLink.share_password);
        if (!passwordValid) {
          return responseHandler(res, 403, false, null, 'Invalid password');
        }
      }

      // Check user's master visibility toggle
      const userResult = await pool.query('SELECT public_profile_enabled FROM users WHERE id = $1', [shareLink.user_id]);
      const user = userResult.rows[0];
      if (!user || !user.public_profile_enabled) {
        return responseHandler(res, 403, false, null, 'This profile has been made private by the owner');
      }

      // Track pdf_download event (non-blocking)
      AnalyticsService.recordEvent({
        userId: shareLink.user_id,
        type: 'pdf_download',
        slug: shareLink.custom_slug || shareLink.short_code,
      }, req).catch((e) => console.error('Error recording pdf_download:', e.message));

      // Generate and stream PDF
      await PDFService.generateResumePDF(shareLink.user_id, res);
    } catch (err) {
      console.error('Error generating public PDF:', err);
      if (!res.headersSent) {
        return responseHandler(res, 500, false, null, err.message || 'Failed to generate PDF');
      }
    }
  }

  /**
   * GET /api/users/profile/my-resume.pdf
   * Download own resume PDF (authenticated users only)
   */
  static async downloadMyResumePDF(req, res) {
    try {
      const userId = req.user.id;
      AnalyticsService.recordEvent({ userId, type: 'pdf_download', meta: { source: 'owner' } }, req)
        .catch((e) => console.error('Error recording owner pdf_download:', e.message));
      await PDFService.generateResumePDF(userId, res);
    } catch (err) {
      console.error('Error generating own PDF:', err);
      if (!res.headersSent) {
        return responseHandler(res, 500, false, null, err.message || 'Failed to generate PDF');
      }
    }
  }

  /**
   * GET /api/users/profile/pdf-url
   * Returns the public PDF URL for the authenticated user's first active share link
   */
  static async getMyPDFUrl(req, res) {
    try {
      const userId = req.user.id;

      // Get user's share link(s)
      const links = await ShareLink.findByUserId(userId);
      const activeLink = Array.isArray(links) ? links.find((sl) => sl.is_active) : null;

      if (!activeLink) {
        return responseHandler(res, 404, false, null, 'No active share link found. Create one first via /api/share/create');
      }

      const identifier = activeLink.custom_slug || activeLink.short_code;
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const pdfUrl = `${baseUrl}/api/public/profile/${identifier}/resume.pdf`;
      const profileUrl = `${baseUrl}/api/public/profile/${identifier}`;

      return responseHandler(res, 200, true, {
        pdfUrl,
        profileUrl,
        identifier,
        slug: activeLink.custom_slug,
        shortCode: activeLink.short_code,
        isPasswordProtected: activeLink.is_password_protected,
        isActive: activeLink.is_active,
      }, 'PDF URL retrieved successfully');
    } catch (err) {
      console.error('Error getting PDF URL:', err);
      return responseHandler(res, 500, false, null, err.message || 'Internal server error');
    }
  }

  /**
   * GET /api/users/profile/card/templates
   * Lists available digital card templates.
   */
  static async listCardTemplates(req, res) {
    return responseHandler(res, 200, true, { templates: TEMPLATES }, 'Templates retrieved');
  }

  /**
   * Builds the flat card-render context for the authenticated user.
   * Merges profile_identity / contact / business / social_links into the shape
   * CardTemplateService expects.
   */
  static async buildCardContext(userId, body = {}) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    const profileRes = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    const p = profileRes.rows[0] || {};

    const personal = p.personal_identity || {};
    const contact = p.contact_information || {};
    const business = p.business_details || {};
    let social = [];
    const sl = p.social_links;
    if (Array.isArray(sl)) social = sl;
    else if (sl && typeof sl === 'object') {
      social = Object.entries(sl)
        .filter(([, v]) => typeof v === 'string' && v)
        .map(([k, v]) => ({ platform: k, url: v }));
    }
    const stored = p.digital_card || {};

    const links = await ShareLink.findByUserId(userId);
    const active = Array.isArray(links) ? links.find((l) => l.is_active) : null;
    const baseUrl = process.env.PUBLIC_PROFILE_BASE_URL || process.env.BASE_URL || 'https://clickcard.app';
    const publicUrl = active
      ? `${baseUrl}/${active.custom_slug || active.short_code}`
      : user.username
      ? `${baseUrl}/${user.username}`
      : '';

    return {
      templateId: body.templateId || stored.templateId || 'gradient-classic',
      primary: body.primary || stored.primaryColor || '#6E2BFF',
      accent: body.accent || stored.accentColor || '#FF4D8D',
      theme: body.theme || stored.theme || 'light',
      publicUrl,
      profile: {
        fullName: personal.fullName || [user.first_name, user.last_name].filter(Boolean).join(' '),
        tagline: personal.tagline,
        bio: personal.bio || user.profile_bio,
        picture: user.profile_picture || personal.profilePicture,
        email: contact.email || user.email,
        phone: contact.phone || user.phone_number,
        whatsapp: contact.whatsapp,
        website: contact.website,
        city: contact.city,
        country: contact.country,
        social,
        business: { name: business.name, category: business.category },
      },
    };
  }

  /**
   * GET /api/users/profile/card/preview
   * Returns the rendered HTML of the user's chosen template (for iframes/debug).
   */
  static async previewCard(req, res) {
    try {
      const ctx = await PDFController.buildCardContext(req.user.id, req.query);
      const html = renderCardHtml(ctx);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } catch (err) {
      console.error('Card preview error:', err);
      return responseHandler(res, 500, false, null, err.message || 'Failed to render card');
    }
  }

  /**
   * POST /api/users/profile/card.pdf
   * Body: { templateId, primary, accent, theme }
   * Streams the rendered PDF.
   */
  static async downloadCardPDF(req, res) {
    try {
      const ctx = await PDFController.buildCardContext(req.user.id, req.body || {});
      let pdf;
      try {
        pdf = await renderCardPdf(ctx);
      } catch (e) {
        if (e.code === 'NO_CHROMIUM') {
          return responseHandler(res, 503, false, null,
            'Server-side PDF rendering is not configured (set PUPPETEER_EXECUTABLE_PATH).');
        }
        throw e;
      }
      AnalyticsService.recordEvent({
        userId: req.user.id,
        type: 'pdf_download',
        meta: { source: 'card', templateId: ctx.templateId },
      }, req).catch(() => {});
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="card-${ctx.templateId}.pdf"`);
      return res.end(pdf);
    } catch (err) {
      console.error('Card PDF error:', err);
      return responseHandler(res, 500, false, null, err.message || 'Failed to render card');
    }
  }
}

module.exports = PDFController;

const { StudioTemplate } = require('../models/StudioTemplate');
const { renderTemplate } = require('../services/StudioRenderService');
const PDFController = require('./PDFController');
const AnalyticsService = require('../services/AnalyticsService');
const { responseHandler, sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');

class StudioController {
  /** GET /api/studio/templates  (public) — only published */
  static async listPublic(req, res) {
    try {
      const items = await StudioTemplate.listPublic(req.query.category);
      return sendSuccessResponse(res, 200, 'Templates retrieved', items);
    } catch (err) {
      return sendErrorResponse(res, 500, 'Failed to list templates', err.message);
    }
  }

  /** GET /api/studio/templates/:slug  (public) */
  static async getPublic(req, res) {
    try {
      const tpl = await StudioTemplate.findBySlug(req.params.slug);
      if (!tpl || !tpl.is_published) return sendErrorResponse(res, 404, 'Template not found');
      return sendSuccessResponse(res, 200, 'Template retrieved', tpl);
    } catch (err) {
      return sendErrorResponse(res, 500, 'Failed to fetch template', err.message);
    }
  }

  /** POST /api/users/studio/render  (auth)
   *  Body: { slug, format: 'pdf'|'png'|'svg', theme?, primary?, accent? }
   *  Streams the rendered file.
   */
  static async render(req, res) {
    try {
      const { slug, format = 'pdf', theme = 'light', primary, accent } = req.body || {};
      if (!slug) return sendErrorResponse(res, 400, 'slug is required');
      if (!['pdf', 'png', 'svg'].includes(format)) {
        return sendErrorResponse(res, 400, "format must be one of pdf|png|svg");
      }

      // Reuse PDFController.buildCardContext to assemble profile context.
      const ctx = await PDFController.buildCardContext(req.user.id, { primary, accent, theme });

      let result;
      try {
        result = await renderTemplate({ slug, ctx, theme, format });
      } catch (e) {
        if (e.code === 'NO_CHROMIUM') {
          return responseHandler(res, 503, false, null,
            'Server-side rendering is not configured (set PUPPETEER_EXECUTABLE_PATH).');
        }
        if (e.message?.includes('Template not')) {
          return sendErrorResponse(res, 404, e.message);
        }
        throw e;
      }

      AnalyticsService.recordEvent({
        userId: req.user.id,
        type: format === 'pdf' ? 'pdf_download' : 'card_share',
        meta: { source: 'studio', slug, format },
      }, req).catch(() => {});

      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${slug}.${result.extension}"`);
      return res.end(result.buffer);
    } catch (err) {
      console.error('Studio render error:', err);
      return sendErrorResponse(res, 500, 'Failed to render template', err.message);
    }
  }

  /* ===================== admin ===================== */

  static async adminList(req, res) {
    try {
      const items = await StudioTemplate.listAll();
      return sendSuccessResponse(res, 200, 'Templates retrieved', items);
    } catch (err) {
      return sendErrorResponse(res, 500, 'Failed to list templates', err.message);
    }
  }

  static async adminCreate(req, res) {
    try {
      const body = req.body || {};
      if (!body.slug || !body.name || !body.category) {
        return sendErrorResponse(res, 400, 'slug, name, category are required');
      }
      const existing = await StudioTemplate.findBySlug(body.slug);
      if (existing) return sendErrorResponse(res, 409, 'A template with that slug already exists');
      const row = await StudioTemplate.create(body, req.user.id);
      return sendSuccessResponse(res, 201, 'Template created', row);
    } catch (err) {
      return sendErrorResponse(res, 500, 'Failed to create template', err.message);
    }
  }

  static async adminUpdate(req, res) {
    try {
      const row = await StudioTemplate.update(req.params.id, req.body || {});
      if (!row) return sendErrorResponse(res, 404, 'Template not found');
      return sendSuccessResponse(res, 200, 'Template updated', row);
    } catch (err) {
      return sendErrorResponse(res, 500, 'Failed to update template', err.message);
    }
  }

  static async adminRemove(req, res) {
    try {
      await StudioTemplate.remove(req.params.id);
      return sendSuccessResponse(res, 200, 'Template deleted', { id: req.params.id });
    } catch (err) {
      return sendErrorResponse(res, 500, 'Failed to delete template', err.message);
    }
  }
}

module.exports = StudioController;

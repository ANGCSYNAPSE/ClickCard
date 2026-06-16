const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/AnalyticsController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Per-user dashboard analytics (profile views, link taps, downloads).
 */

/**
 * @swagger
 * /api/analytics/track:
 *   post:
 *     summary: Track a public analytics event
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type: { type: string, enum: [profile_view, link_tap, pdf_download, card_share] }
 *               slug: { type: string, description: "Public slug or short_code resolving to a user" }
 *               userId: { type: integer }
 *               linkKey: { type: string, description: "Which link was tapped (e.g. 'linkedin')" }
 *               meta: { type: object }
 *     responses:
 *       200: { description: Event recorded }
 *       400: { description: Invalid type }
 *       404: { description: User not resolved }
 */
router.post('/track', AnalyticsController.track);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics for the authenticated user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Dashboard analytics retrieved }
 */
router.get('/dashboard', authenticateToken, AnalyticsController.dashboard);

/**
 * @swagger
 * /api/analytics/recent:
 *   get:
 *     summary: Recent events for the authenticated user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Recent events retrieved }
 */
router.get('/recent', authenticateToken, AnalyticsController.recent);

module.exports = router;

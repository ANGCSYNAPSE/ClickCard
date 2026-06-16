const express = require('express');
const router = express.Router();
const StudioController = require('../controllers/StudioController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Studio
 *   description: Resume / visiting-card / QR-poster templates and rendering.
 */

/**
 * @swagger
 * /api/studio/templates:
 *   get:
 *     summary: List published Studio templates
 *     description: Optional `category` filter (resume | visiting_card | qr_poster).
 *     tags: [Studio]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [resume, visiting_card, qr_poster] }
 *     responses:
 *       200: { description: Templates retrieved }
 */
router.get('/templates', StudioController.listPublic);

/**
 * @swagger
 * /api/studio/templates/{slug}:
 *   get:
 *     summary: Fetch one published template by slug
 *     tags: [Studio]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Template retrieved }
 */
router.get('/templates/:slug', StudioController.getPublic);

/**
 * @swagger
 * /api/studio/render:
 *   post:
 *     summary: Render the user's chosen template (PDF/PNG/SVG)
 *     description: Server-side rendering via puppeteer-core. PDF + PNG need Chromium; SVG works without it.
 *     tags: [Studio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slug]
 *             properties:
 *               slug: { type: string }
 *               format: { type: string, enum: [pdf, png, svg], default: pdf }
 *               theme: { type: string, enum: [light, dark] }
 *               primary: { type: string }
 *               accent: { type: string }
 *     responses:
 *       200: { description: File stream }
 *       503: { description: Chromium not configured }
 */
router.post('/render', authenticateToken, StudioController.render);

/* -------- admin -------- */
router.get('/admin/templates', authenticateToken, isAdmin, StudioController.adminList);
router.post('/admin/templates', authenticateToken, isAdmin, StudioController.adminCreate);
router.put('/admin/templates/:id', authenticateToken, isAdmin, StudioController.adminUpdate);
router.delete('/admin/templates/:id', authenticateToken, isAdmin, StudioController.adminRemove);

module.exports = router;

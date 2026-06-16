const express = require('express');
const router = express.Router();
const ShareLinkController = require('../controllers/ShareLinkController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication

/**
 * @swagger
 * tags:
 *   name: Share Links
 *   description: Management of unique profile share links and short URLs
 */

// All routes require authentication

/**
 * @swagger
 * /api/share/create:
 *   post:
 *     summary: Create a new share link
 *     description: Create a unique share link with custom slug, expiry, and optional password protection.
 *     tags: [Share Links]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               custom_slug: { type: string }
 *               expiry_days: { type: integer }
 *               requires_password: { type: boolean }
 *               share_password: { type: string }
 *     responses:
 *       201:
 *         description: Share link created successfully
 */
router.post('/create', authenticateToken, ShareLinkController.createShareLink);

/**
 * @swagger
 * /api/share/links:
 *   get:
 *     summary: Get all my share links
 *     description: Retrieve all share links created by the authenticated user.
 *     tags: [Share Links]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Links retrieved
 */
router.get('/links', authenticateToken, ShareLinkController.getUserShareLinks);

/**
 * @swagger
 * /api/share/update/{id}:
 *   post:
 *     summary: Update share link
 *     description: Update settings for an existing share link.
 *     tags: [Share Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               custom_slug: { type: string }
 *               is_active: { type: boolean }
 *               expiry_date: { type: string, format: date-time }
 *               requires_password: { type: boolean }
 *               share_password: { type: string }
 *     responses:
 *       200:
 *         description: Link updated
 */
router.post('/update/:id', authenticateToken, ShareLinkController.updateShareLink);

/**
 * @swagger
 * /api/share/{id}:
 *   delete:
 *     summary: Delete share link
 *     description: Permanently delete a share link.
 *     tags: [Share Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Link deleted
 */
router.delete('/:id', authenticateToken, ShareLinkController.deleteShareLink);

/**
 * @swagger
 * /api/share/{id}/regenerate:
 *   post:
 *     summary: Regenerate link code
 *     description: Generate a new random short code and QR code.
 *     tags: [Share Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Code regenerated
 */
router.post('/:id/regenerate', authenticateToken, ShareLinkController.regenerateShortCode);

/**
 * @swagger
 * /api/share/{id}/analytics:
 *   get:
 *     summary: Get link analytics
 *     description: Retrieve visitor analytics for a specific share link.
 *     tags: [Share Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Analytics retrieved
 */
router.get('/:id/analytics', authenticateToken, ShareLinkController.getShareLinkAnalytics);

/**
 * @swagger
 * /api/share/{id}/qr:
 *   get:
 *     summary: Get link QR code
 *     description: Retrieve the QR code for a specific share link.
 *     tags: [Share Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: QR code retrieved
 */
router.get('/:id/qr', authenticateToken, ShareLinkController.getQRCode);

/**
 * @swagger
 * /api/share/analytics/all:
 *   get:
 *     summary: Get total analytics
 *     description: Retrieve summary analytics for all user's links.
 *     tags: [Share Links]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All analytics retrieved
 */
router.get('/analytics/all', authenticateToken, ShareLinkController.getAllUserAnalytics);

module.exports = router;

const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: In-app + live (socket) notifications for users and admins
 *
 * /api/notifications:
 *   get:
 *     summary: Get my notifications
 *     description: Latest notifications for the authenticated user plus the unread count.
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Notifications retrieved }
 *
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get my unread count
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Unread count }
 *
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Marked as read }
 *
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All marked as read }
 *
 * /api/notifications/announce:
 *   post:
 *     summary: Broadcast an announcement to all users (admin only)
 *     description: Used when admin ships a new feature/template — fans out a notification (+ live socket push) to every user.
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "New: AI Resume Templates" }
 *               message: { type: string, example: "Build a recruiter-ready resume in minutes." }
 *               type: { type: string, example: feature }
 *     responses:
 *       201: { description: Announcement sent }
 */

router.get('/', authenticateToken, NotificationController.list);
router.get('/unread-count', authenticateToken, NotificationController.unreadCount);
router.patch('/read-all', authenticateToken, NotificationController.markAllRead);
router.patch('/:id/read', authenticateToken, NotificationController.markRead);
router.post('/announce', authenticateToken, isAdmin, NotificationController.announce);

module.exports = router;

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const AnalyticsController = require('../controllers/AnalyticsController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Platform administration, user moderation, and global settings
 */

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Returns counts for users, profiles, leads, etc.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved
 */
router.get('/stats', AdminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/revenue:
 *   get:
 *     summary: Get revenue & subscription stats
 *     description: Active subscriptions, MRR, per-plan breakdown and 30-day revenue trend.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue stats retrieved
 */
router.get('/revenue', AdminController.getRevenue);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users
 *     description: Retrieve all registered users with block status.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list retrieved
 */
router.get('/users', AdminController.getUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved
 */
router.get('/users/:id', AdminController.getUserDetails);

/**
 * @swagger
 * /api/admin/users/{id}/analytics:
 *   get:
 *     summary: Get analytics for a specific user
 *     description: Profile views, link taps, PDF downloads, active links + 7-day trend + recent events.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics retrieved
 */
router.get('/users/:id/analytics', AnalyticsController.adminUserAnalytics);

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   patch:
 *     summary: Block or Unblock a user
 *     description: Restrict or restore user access.
 *     tags: [Admin]
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
 *               isBlocked: { type: boolean }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User block status updated
 */
router.patch('/users/:id/block', AdminController.blockUser);

/**
 * @swagger
 * /api/admin/users/{id}/moderate:
 *   patch:
 *     summary: Moderate profile content
 *     tags: [Admin]
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
 *               status: { type: string, enum: [approved, rejected, pending] }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Moderation status updated
 */
router.patch('/users/:id/moderate', AdminController.moderateUser);

/**
 * @swagger
 * /api/admin/leads:
 *   get:
 *     summary: Get all leads platform-wide
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leads retrieved
 */
router.get('/leads', AdminController.getLeads);

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings list
 *   post:
 *     summary: Update system setting
 *     description: Update or create a global configuration key.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, value]
 *             properties:
 *               key: { type: string }
 *               value: { type: object }
 *     responses:
 *       200:
 *         description: Setting updated
 */
router.get('/settings', AdminController.getSettings);
router.post('/settings', AdminController.updateSetting);

module.exports = router;

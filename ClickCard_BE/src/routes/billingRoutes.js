const express = require('express');
const router = express.Router();
const BillingController = require('../controllers/BillingController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Billing
 *     description: Plans, subscriptions and payments
 *
 * /api/billing/plans:
 *   get:
 *     summary: List plans & verticals
 *     description: Public catalogue of plans (Free/Pro/Business) and the premium verticals each unlocks. Unlimited limits are returned as -1.
 *     tags: [Billing]
 *     responses:
 *       200:
 *         description: Plans retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     plans:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string, example: pro }
 *                           name: { type: string, example: Pro }
 *                           priceMonthly: { type: integer, example: 29900 }
 *                           priceYearly: { type: integer, example: 299000 }
 *                           currency: { type: string, example: INR }
 *                           verticals: { type: array, items: { type: string } }
 *                           entitlements: { type: array, items: { type: string } }
 *                     verticals:
 *                       type: array
 *                       items: { type: object }
 *
 * /api/billing/subscription:
 *   get:
 *     summary: Get my subscription & entitlements
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current plan, limits and entitlements
 *
 * /api/billing/checkout:
 *   post:
 *     summary: Create a checkout (payment order/intent)
 *     description: Provider-agnostic. Returns an order the client pays. For the stub provider, follow up with /confirm.
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId]
 *             properties:
 *               planId: { type: string, example: pro }
 *               billingCycle: { type: string, enum: [monthly, yearly], example: monthly }
 *     responses:
 *       201:
 *         description: Checkout created
 *
 * /api/billing/confirm:
 *   post:
 *     summary: Confirm checkout & activate plan
 *     description: Activates the subscription. With a real provider this is driven by the webhook instead.
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId]
 *             properties:
 *               planId: { type: string, example: pro }
 *               billingCycle: { type: string, example: monthly }
 *               orderRef: { type: string }
 *     responses:
 *       200:
 *         description: Subscription activated
 *
 * /api/billing/webhook:
 *   post:
 *     summary: Payment provider webhook
 *     description: Verifies the signature and activates the subscription on successful payment.
 *     tags: [Billing]
 *     responses:
 *       200:
 *         description: Webhook processed
 *
 * /api/billing/cancel:
 *   post:
 *     summary: Cancel subscription (downgrade to free)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription canceled
 */

router.get('/plans', BillingController.listPlans);
router.get('/subscription', authenticateToken, BillingController.getMySubscription);
router.post('/checkout', authenticateToken, BillingController.createCheckout);
router.post('/confirm', authenticateToken, BillingController.confirmCheckout);
router.post('/webhook', BillingController.webhook);
router.post('/cancel', authenticateToken, BillingController.cancel);

/* -------- admin plan management -------- */
/**
 * @swagger
 * /api/billing/admin/plans:
 *   get:
 *     summary: List ALL plans (incl. drafts) for admin
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create or update a plan
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string }
 *               name: { type: string }
 *               tagline: { type: string }
 *               priceMonthly: { type: integer }
 *               priceYearly: { type: integer }
 *               currency: { type: string }
 *               limits: { type: object }
 *               verticals: { type: array, items: { type: string } }
 *               entitlements: { type: array, items: { type: string } }
 *               popular: { type: boolean }
 *               isPublished: { type: boolean }
 *               sortOrder: { type: integer }
 */
router.get('/admin/plans', authenticateToken, isAdmin, BillingController.adminListPlans);
router.post('/admin/plans', authenticateToken, isAdmin, BillingController.adminUpsertPlan);
router.delete('/admin/plans/:id', authenticateToken, isAdmin, BillingController.adminDeletePlan);

module.exports = router;

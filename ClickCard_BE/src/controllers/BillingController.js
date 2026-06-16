const { responseHandler } = require('../utils/responseHandler');
const { PLANS, VERTICALS } = require('../config/plans');
const BillingService = require('../services/BillingService');
const { Plan } = require('../models/Plan');

// JSON can't represent Infinity — expose unlimited limits as -1.
const sanitizeLimits = (limits = {}) =>
  Object.fromEntries(
    Object.entries(limits).map(([k, v]) => [k, v === Infinity ? -1 : v]),
  );

const sanitizePlan = (p) => ({ ...p, limits: sanitizeLimits(p.limits) });

class BillingController {
  /** GET /api/billing/plans — public list of plans + verticals. */
  static async listPlans(req, res) {
    try {
      const dbPlans = await Plan.listPublished().catch(() => []);
      const plans = dbPlans.length
        ? dbPlans.map(sanitizePlan)
        : PLANS.map(sanitizePlan);
      return responseHandler(res, 200, true, {
        plans,
        verticals: VERTICALS,
        provider: BillingService.PROVIDER,
        razorpayKeyId: BillingService.PROVIDER === 'razorpay' ? process.env.RAZORPAY_KEY_ID : undefined,
      }, 'Plans retrieved');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message);
    }
  }

  /* -------------------- admin plan CRUD -------------------- */

  static async adminListPlans(req, res) {
    try {
      const rows = await Plan.listAll();
      return responseHandler(res, 200, true, rows, 'Plans retrieved');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message);
    }
  }

  static async adminUpsertPlan(req, res) {
    try {
      const data = req.body || {};
      if (!data.id) return responseHandler(res, 400, false, null, 'id is required');
      const row = await Plan.upsert(data);
      return responseHandler(res, 200, true, row, 'Plan saved');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message);
    }
  }

  static async adminDeletePlan(req, res) {
    try {
      await Plan.remove(req.params.id);
      return responseHandler(res, 200, true, { id: req.params.id }, 'Plan deleted');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message);
    }
  }

  /** GET /api/billing/subscription — current user's plan + entitlements. */
  static async getMySubscription(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const data = await BillingService.getEntitlements(userId);
      return responseHandler(res, 200, true, { ...data, limits: sanitizeLimits(data.limits) }, 'Subscription retrieved');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message || 'Failed to load subscription');
    }
  }

  /** POST /api/billing/checkout — create a payment order/intent for a plan. */
  static async createCheckout(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const { planId, billingCycle = 'monthly' } = req.body;
      if (!planId) return responseHandler(res, 400, false, null, 'planId is required');
      const order = await BillingService.createCheckout(userId, planId, billingCycle);
      return responseHandler(res, 201, true, order, 'Checkout created');
    } catch (err) {
      return responseHandler(res, 400, false, null, err.message || 'Could not create checkout');
    }
  }

  /**
   * POST /api/billing/confirm — confirm a checkout and activate the plan.
   * For Razorpay this verifies the payment signature before activating.
   */
  static async confirmCheckout(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const {
        planId, billingCycle = 'monthly', orderRef, amount,
        razorpayPaymentId, razorpayOrderId, razorpaySignature,
      } = req.body;
      if (!planId) return responseHandler(res, 400, false, null, 'planId is required');
      const sub = await BillingService.confirmCheckout(userId, {
        planId, billingCycle, orderRef, amount,
        razorpayPaymentId, razorpayOrderId, razorpaySignature,
      });
      return responseHandler(res, 200, true, sub, 'Subscription activated');
    } catch (err) {
      return responseHandler(res, 400, false, null, err.message || 'Could not activate subscription');
    }
  }

  /** POST /api/billing/webhook — Razorpay payment webhook. */
  static async webhook(req, res) {
    try {
      const signature = req.headers['x-razorpay-signature'] || req.headers['x-payment-signature'] || '';
      const rawBody = req.rawBody || JSON.stringify(req.body);
      if (!BillingService.verifyWebhook(rawBody, signature)) {
        return responseHandler(res, 400, false, null, 'Invalid webhook signature');
      }
      const result = await BillingService.processWebhook(req.body);
      return responseHandler(res, 200, true, { received: true, ...result }, 'Webhook processed');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message || 'Webhook error');
    }
  }

  /** POST /api/billing/cancel — downgrade to free. */
  static async cancel(req, res) {
    try {
      const Subscription = require('../models/Subscription');
      const userId = req.user.userId || req.user.id;
      await Subscription.cancel(userId);
      return responseHandler(res, 200, true, { planId: 'free' }, 'Subscription canceled');
    } catch (err) {
      return responseHandler(res, 500, false, null, err.message || 'Could not cancel');
    }
  }
}

module.exports = BillingController;

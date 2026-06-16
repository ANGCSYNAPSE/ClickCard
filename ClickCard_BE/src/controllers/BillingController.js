const { responseHandler } = require('../utils/responseHandler');
const { PLANS, VERTICALS } = require('../config/plans');
const BillingService = require('../services/BillingService');
const { Plan, createPlanTable } = require('../models/Plan');

// JSON can't represent Infinity — expose unlimited limits as -1.
const sanitizeLimits = (limits = {}) =>
  Object.fromEntries(
    Object.entries(limits).map(([k, v]) => [k, v === Infinity ? -1 : v]),
  );

const sanitizePlan = (p) => ({ ...p, limits: sanitizeLimits(p.limits) });

class BillingController {
  /** GET /api/billing/plans — public list of plans + verticals.
   *
   *  Always reads from the DB so admin-published plans show up. If the table
   *  isn't there yet (fresh deploy where the init promise hadn't finished
   *  before the first request) we create it on the fly + seed from config,
   *  then re-query. Errors are LOGGED, not silently swallowed.
   */
  static async listPlans(req, res) {
    try {
      let dbPlans;
      let source = 'db';
      try {
        dbPlans = await Plan.listPublished();
      } catch (err) {
        console.error('[billing] listPublished failed, creating table:', err.message);
        await createPlanTable();
        dbPlans = await Plan.listPublished().catch((e) => {
          console.error('[billing] listPublished still failing after init:', e.message);
          return [];
        });
      }

      let plans;
      if (dbPlans && dbPlans.length) {
        plans = dbPlans.map(sanitizePlan);
      } else {
        source = 'config-fallback';
        plans = PLANS.map(sanitizePlan);
      }

      console.log(`[billing] /plans served ${plans.length} plan(s) from ${source}`);

      return responseHandler(res, 200, true, {
        plans,
        verticals: VERTICALS,
        provider: BillingService.PROVIDER,
        razorpayKeyId: BillingService.PROVIDER === 'razorpay' ? process.env.RAZORPAY_KEY_ID : undefined,
      }, 'Plans retrieved');
    } catch (err) {
      console.error('[billing] /plans error:', err);
      return responseHandler(res, 500, false, null, err.message);
    }
  }

  /* -------------------- admin plan CRUD -------------------- */

  static async adminListPlans(req, res) {
    try {
      let rows;
      try {
        rows = await Plan.listAll();
      } catch {
        await createPlanTable();
        rows = await Plan.listAll();
      }
      return responseHandler(res, 200, true, rows, 'Plans retrieved');
    } catch (err) {
      console.error('[billing] admin listAll error:', err);
      return responseHandler(res, 500, false, null, err.message);
    }
  }

  static async adminUpsertPlan(req, res) {
    try {
      const data = req.body || {};
      if (!data.id) return responseHandler(res, 400, false, null, 'id is required');
      // Default to PUBLISHED unless admin explicitly opts out — without this,
      // a plan saved with isPublished:undefined would be hidden from users.
      if (data.isPublished === undefined) data.isPublished = true;
      let row;
      try {
        row = await Plan.upsert(data);
      } catch (err) {
        if (/relation .* does not exist/i.test(err.message)) {
          await createPlanTable();
          row = await Plan.upsert(data);
        } else {
          throw err;
        }
      }
      console.log(`[billing] plan upserted: id=${row.id} published=${row.isPublished}`);
      return responseHandler(res, 200, true, row, 'Plan saved');
    } catch (err) {
      console.error('[billing] upsert error:', err);
      return responseHandler(res, 500, false, null, err.message);
    }
  }

  static async adminDeletePlan(req, res) {
    try {
      await Plan.remove(req.params.id);
      return responseHandler(res, 200, true, { id: req.params.id }, 'Plan deleted');
    } catch (err) {
      console.error('[billing] delete error:', err);
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

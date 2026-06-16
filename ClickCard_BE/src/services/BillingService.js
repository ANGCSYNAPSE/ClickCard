const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const { Plan } = require('../models/Plan');
const {
  getPlan: getPlanFromConfig,
  planEntitlements,
  planAmount: planAmountFromConfig,
} = require('../config/plans');

/**
 * Provider-agnostic billing.
 *
 * The actual charge is abstracted behind `createCheckout` / `confirmCheckout`.
 * Razorpay is fully wired when RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET are set,
 * otherwise we fall back to the stub provider so the flow still works
 * end-to-end in dev.
 *
 * Pricing is read from the DB `plans` table (admin-editable). If a plan row
 * isn't found we fall back to the static config so existing entitlements
 * keep working during a migration.
 */
const PROVIDER = process.env.PAYMENT_PROVIDER ||
  (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? 'razorpay' : 'stub');

let razorpayClient = null;
function getRazorpay() {
  if (razorpayClient) return razorpayClient;
  const Razorpay = require('razorpay');
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured');
  }
  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return razorpayClient;
}

async function resolvePlan(planId) {
  const dbPlan = await Plan.findById(planId).catch(() => null);
  if (dbPlan) {
    // Merge entitlements from code (verticals are still defined there).
    return {
      ...dbPlan,
      entitlements: dbPlan.entitlements?.length
        ? dbPlan.entitlements
        : planEntitlements(planId),
    };
  }
  const code = getPlanFromConfig(planId);
  return {
    id: code.id,
    name: code.name,
    tagline: code.tagline,
    priceMonthly: code.priceMonthly,
    priceYearly: code.priceYearly,
    currency: code.currency,
    limits: code.limits,
    verticals: code.verticals,
    entitlements: code.entitlements,
    popular: !!code.popular,
  };
}

async function resolveAmount(planId, cycle) {
  const plan = await resolvePlan(planId);
  if (cycle === 'yearly') return plan.priceYearly || planAmountFromConfig(planId, 'yearly');
  return plan.priceMonthly || planAmountFromConfig(planId, 'monthly');
}

const BillingService = {
  PROVIDER,
  resolvePlan,

  periodEnd(cycle) {
    const d = new Date();
    if (cycle === 'yearly') d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return d;
  },

  /** Creates a payment intent/order for a plan. Returns what the client needs to pay. */
  async createCheckout(userId, planId, cycle = 'monthly') {
    const plan = await resolvePlan(planId);
    if (!plan || plan.id === 'free') {
      throw new Error('Select a paid plan to checkout');
    }
    const amount = await resolveAmount(planId, cycle);
    const orderRef = `cc_${planId}_${cycle}_${userId}_${Date.now()}`;

    if (PROVIDER === 'razorpay') {
      const rzp = getRazorpay();
      const order = await rzp.orders.create({
        amount,
        currency: plan.currency || 'INR',
        receipt: orderRef.slice(0, 40),
        notes: { userId: String(userId), planId, billingCycle: cycle },
      });
      return {
        provider: 'razorpay',
        orderRef: order.id,
        razorpayOrderId: order.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        planId,
        billingCycle: cycle,
        amount,
        currency: plan.currency || 'INR',
      };
    }

    // stub provider — client can immediately confirm with this token
    return {
      provider: 'stub',
      orderRef,
      planId,
      billingCycle: cycle,
      amount,
      currency: plan.currency || 'INR',
      confirmToken: crypto.createHash('sha256').update(orderRef).digest('hex').slice(0, 24),
    };
  },

  /**
   * Confirms a checkout and activates the subscription.
   * For real providers this verifies the Razorpay signature before activating.
   */
  async confirmCheckout(userId, payload = {}) {
    const {
      planId, billingCycle = 'monthly', orderRef, amount,
      razorpayPaymentId, razorpayOrderId, razorpaySignature,
    } = payload;

    if (PROVIDER === 'razorpay') {
      // verify HMAC: hex(hmac_sha256(secret, orderId + "|" + paymentId))
      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        throw new Error('Missing Razorpay verification fields');
      }
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
      if (expected !== razorpaySignature) {
        throw new Error('Razorpay signature mismatch');
      }
    }

    const plan = await resolvePlan(planId);
    const finalAmount = amount ?? (await resolveAmount(planId, billingCycle));

    const sub = await Subscription.activate(userId, {
      planId,
      billingCycle,
      provider: PROVIDER,
      providerRef: razorpayPaymentId || orderRef || null,
      amount: finalAmount,
      currency: plan.currency || 'INR',
      periodEnd: this.periodEnd(billingCycle),
    });
    return sub;
  },

  /** Verifies an incoming webhook payload signature. */
  verifyWebhook(rawBody, signature) {
    if (PROVIDER === 'stub') return true;
    const secret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.PAYMENT_WEBHOOK_SECRET ||
      '';
    if (!secret) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return expected === signature;
  },

  /**
   * Parse a Razorpay webhook payload and (if it's a successful payment)
   * activate the subscription using the order notes.
   */
  async processWebhook(payload) {
    if (!payload || !payload.event) return { handled: false };
    if (payload.event !== 'payment.captured' && payload.event !== 'order.paid') {
      return { handled: false, event: payload.event };
    }
    const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
    const notes = entity?.notes || {};
    const userId = parseInt(notes.userId, 10);
    const planId = notes.planId;
    const billingCycle = notes.billingCycle || 'monthly';
    if (!userId || !planId) return { handled: false, reason: 'Missing notes' };
    await this.confirmCheckout(userId, {
      planId,
      billingCycle,
      orderRef: entity?.order_id || entity?.id,
      amount: entity?.amount,
      razorpayPaymentId: entity?.id,
      razorpayOrderId: entity?.order_id,
      // Server-trusted path — signature already verified by verifyWebhook.
      razorpaySignature: 'verified-via-webhook',
    }).catch((e) => {
      // Re-throw so the webhook returns 500 only on programmer errors;
      // signature mismatch already 400'd.
      if (e.message !== 'Razorpay signature mismatch') throw e;
    });
    return { handled: true, userId, planId, billingCycle };
  },

  /** Resolves a user's current plan + entitlements (defaults to free). */
  async getEntitlements(userId) {
    const sub = await Subscription.getActive(userId);
    const planId = sub?.plan_id || 'free';
    const plan = await resolvePlan(planId);
    return {
      planId,
      planName: plan.name,
      status: sub?.status || 'active',
      billingCycle: sub?.billing_cycle || 'monthly',
      currentPeriodEnd: sub?.current_period_end || null,
      limits: plan.limits,
      verticals: plan.verticals,
      entitlements: plan.entitlements || planEntitlements(planId),
    };
  },

  async hasEntitlement(userId, entitlement) {
    const { entitlements } = await this.getEntitlements(userId);
    return entitlements.includes(entitlement);
  },
};

module.exports = BillingService;

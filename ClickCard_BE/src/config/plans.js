/**
 * Single source of truth for plans, verticals and entitlements.
 * Provider-agnostic: prices here, actual charging handled by BillingService.
 * Amounts are in the smallest currency unit (paise) — ₹299 => 29900.
 */

// Granular feature flags users unlock by upgrading.
const ENTITLEMENTS = {
  // Pro Identity
  UNLIMITED_LINKS: 'unlimited_links',
  CUSTOM_THEMES: 'custom_themes',
  REMOVE_BRANDING: 'remove_branding',
  CUSTOM_DOMAIN: 'custom_domain',
  // Studio Pro
  STUDIO_PREMIUM_TEMPLATES: 'studio_premium_templates',
  EXPORTS: 'exports_pdf_png_svg',
  DYNAMIC_QR: 'dynamic_qr',
  // Business Storefront
  PRODUCT_CATALOGUE: 'product_catalogue',
  BUSINESS_HOURS_MAPS: 'business_hours_maps',
  LEAD_CAPTURE: 'lead_capture',
  TEAM_PROFILES: 'team_profiles',
  // Analytics & Growth
  ADVANCED_ANALYTICS: 'advanced_analytics',
  REFERRAL_BOOST: 'referral_boost',
  SCHEDULED_LINKS: 'scheduled_links',
  AB_TESTING: 'ab_testing',
};

// The four promotable verticals (feature bundles) for marketing/UI.
const VERTICALS = [
  {
    id: 'pro_identity',
    name: 'Pro Identity',
    tagline: 'Own your link, fully branded.',
    entitlements: [
      ENTITLEMENTS.UNLIMITED_LINKS,
      ENTITLEMENTS.CUSTOM_THEMES,
      ENTITLEMENTS.REMOVE_BRANDING,
      ENTITLEMENTS.CUSTOM_DOMAIN,
    ],
  },
  {
    id: 'studio_pro',
    name: 'Studio Pro',
    tagline: 'Designer-grade cards, resumes & QR.',
    entitlements: [
      ENTITLEMENTS.STUDIO_PREMIUM_TEMPLATES,
      ENTITLEMENTS.EXPORTS,
      ENTITLEMENTS.DYNAMIC_QR,
    ],
  },
  {
    id: 'business_storefront',
    name: 'Business Storefront',
    tagline: 'Sell, capture leads & get found.',
    entitlements: [
      ENTITLEMENTS.PRODUCT_CATALOGUE,
      ENTITLEMENTS.BUSINESS_HOURS_MAPS,
      ENTITLEMENTS.LEAD_CAPTURE,
      ENTITLEMENTS.TEAM_PROFILES,
    ],
  },
  {
    id: 'analytics_growth',
    name: 'Analytics & Growth',
    tagline: 'Know what works, grow faster.',
    entitlements: [
      ENTITLEMENTS.ADVANCED_ANALYTICS,
      ENTITLEMENTS.REFERRAL_BOOST,
      ENTITLEMENTS.SCHEDULED_LINKS,
      ENTITLEMENTS.AB_TESTING,
    ],
  },
];

const vertical = (id) => VERTICALS.find((v) => v.id === id).entitlements;

// Purchasable plans. `verticals` lists which bundles each plan unlocks.
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'For students & first-timers',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'INR',
    limits: { links: 5, cardTemplates: 1 },
    verticals: [],
    entitlements: [],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For professionals & creators',
    priceMonthly: 29900,
    priceYearly: 299000, // ~2 months free
    currency: 'INR',
    popular: true,
    limits: { links: Infinity, cardTemplates: Infinity },
    verticals: ['pro_identity', 'studio_pro', 'analytics_growth'],
    entitlements: [
      ...vertical('pro_identity'),
      ...vertical('studio_pro'),
      ...vertical('analytics_growth'),
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For teams & storefronts',
    priceMonthly: 59900,
    priceYearly: 599000,
    currency: 'INR',
    limits: { links: Infinity, cardTemplates: Infinity },
    verticals: ['pro_identity', 'studio_pro', 'analytics_growth', 'business_storefront'],
    entitlements: [
      ...vertical('pro_identity'),
      ...vertical('studio_pro'),
      ...vertical('analytics_growth'),
      ...vertical('business_storefront'),
    ],
  },
];

const getPlan = (planId) => PLANS.find((p) => p.id === planId) || PLANS[0];
const planEntitlements = (planId) => getPlan(planId).entitlements;
const planAmount = (planId, cycle = 'monthly') =>
  cycle === 'yearly' ? getPlan(planId).priceYearly : getPlan(planId).priceMonthly;

module.exports = {
  ENTITLEMENTS,
  VERTICALS,
  PLANS,
  getPlan,
  planEntitlements,
  planAmount,
};

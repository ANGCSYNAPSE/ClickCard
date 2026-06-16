const { sendErrorResponse } = require('../utils/responseHandler');
const BillingService = require('../services/BillingService');

/**
 * Gate a route behind a plan entitlement.
 * Usage: router.post('/x', authenticateToken, requireEntitlement('unlimited_links'), handler)
 */
const requireEntitlement = (entitlement) => async (req, res, next) => {
  try {
    const ok = await BillingService.hasEntitlement(req.user.userId, entitlement);
    if (!ok) {
      return res.status(402).json({
        success: false,
        message: 'Upgrade required to use this feature',
        error: 'PAYMENT_REQUIRED',
        requiredEntitlement: entitlement,
      });
    }
    next();
  } catch (err) {
    return sendErrorResponse(res, 500, 'Entitlement check failed', err.message);
  }
};

module.exports = { requireEntitlement };

const Referral = require('../models/Referral');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');

class ReferralController {
  // Get own referrals and stats
  static async getMyReferrals(req, res) {
    try {
      const userId = req.user.userId;
      const [referrals, stats] = await Promise.all([
        Referral.findByReferrer(userId),
        Referral.getStats(userId)
      ]);

      return sendSuccessResponse(res, 200, 'Referrals retrieved successfully', {
        referrals,
        stats
      });
    } catch (err) {
      console.error('Get my referrals error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve referrals');
    }
  }

  // Admin: Get all referrals
  static async getAllReferrals(req, res) {
    try {
      const referrals = await Referral.findAll();
      return sendSuccessResponse(res, 200, 'All referrals retrieved successfully', referrals);
    } catch (err) {
      console.error('Admin get all referrals error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve all referrals');
    }
  }
}

module.exports = ReferralController;

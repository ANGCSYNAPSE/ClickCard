const express = require('express');
const router = express.Router();
const ReferralController = require('../controllers/ReferralController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// User referral routes
router.get('/my', authenticateToken, ReferralController.getMyReferrals);

// Admin referral routes
router.get('/all', authenticateToken, isAdmin, ReferralController.getAllReferrals);

module.exports = router;

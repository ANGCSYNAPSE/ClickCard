const SocialAuthService = require('../services/SocialAuthService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');
const { verifyGoogleIdToken, verifyAppleIdToken } = require('../utils/socialTokenVerifier');

const SocialController = {
  /**
   * POST /api/auth/google
   * Body: { credential, deviceId?, referralCode? }
   * Verifies the Google ID token, then signs the user in (or registers them).
   */
  googleSignIn: async (req, res) => {
    try {
      const { credential, deviceId, referralCode } = req.body || {};
      if (!credential) return sendErrorResponse(res, 400, 'Missing Google credential');

      const profile = await verifyGoogleIdToken(credential);

      const result = await SocialAuthService.socialSignIn({
        name: profile.name || '',
        email: profile.email.toLowerCase(),
        deviceId: deviceId || 'WEB',
        googleId: profile.sub,
        appleId: null,
        authType: 'google',
        referralCode: referralCode || null,
      });

      if (result.success) return sendSuccessResponse(res, result.statusCode, result.message, result.data);
      return sendErrorResponse(res, result.statusCode, result.message, result.errors || result.error);
    } catch (err) {
      console.error('Google sign-in error:', err);
      return sendErrorResponse(res, 401, 'Invalid Google credential', err.message);
    }
  },

  /**
   * POST /api/auth/apple
   * Body: { credential, deviceId?, referralCode?, name? }
   * Apple only returns the user's name on the very first auth; pass it through.
   */
  appleSignIn: async (req, res) => {
    try {
      const { credential, deviceId, referralCode, name } = req.body || {};
      if (!credential) return sendErrorResponse(res, 400, 'Missing Apple credential');

      const profile = await verifyAppleIdToken(credential);

      const result = await SocialAuthService.socialSignIn({
        name: name || profile.name || '',
        email: profile.email.toLowerCase(),
        deviceId: deviceId || 'WEB',
        googleId: null,
        appleId: profile.sub,
        authType: 'apple',
        referralCode: referralCode || null,
      });

      if (result.success) return sendSuccessResponse(res, result.statusCode, result.message, result.data);
      return sendErrorResponse(res, result.statusCode, result.message, result.errors || result.error);
    } catch (err) {
      console.error('Apple sign-in error:', err);
      return sendErrorResponse(res, 401, 'Invalid Apple credential', err.message);
    }
  },
  // POST /api/auth/social-signin
  // Handles both login and registration via social providers (Google, Apple)
  socialSignIn: async (req, res) => {
    try {
      const {
        name,
        email,
        phoneNumber,
        deviceId,
        appleId,
        googleId,
        authType,
        referralCode,
      } = req.body;

      // Validate required fields
      if (!email) {
        return sendErrorResponse(res, 400, 'Email is required');
      }

      if (!authType || !['google', 'apple'].includes(authType)) {
        return sendErrorResponse(
          res,
          400,
          'Invalid or missing authType (should be "google" or "apple")'
        );
      }

      if (authType === 'google' && !googleId) {
        return sendErrorResponse(res, 400, 'googleId is required when authType is "google"');
      }

      if (authType === 'apple' && !appleId) {
        return sendErrorResponse(res, 400, 'appleId is required when authType is "apple"');
      }

      // Call service
      const result = await SocialAuthService.socialSignIn({
        name: name || '',
        email: email.toLowerCase(),
        phoneNumber: phoneNumber || '',
        deviceId: deviceId || 'UNKNOWN_DEVICE',
        appleId: appleId || null,
        googleId: googleId || null,
        authType,
        referralCode: referralCode || null,
      });

      if (result.success) {
        return sendSuccessResponse(res, result.statusCode, result.message, result.data);
      } else {
        return sendErrorResponse(
          res,
          result.statusCode,
          result.message,
          result.errors || result.error
        );
      }
    } catch (err) {
      console.error('Social sign-in controller error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },
};

module.exports = SocialController;

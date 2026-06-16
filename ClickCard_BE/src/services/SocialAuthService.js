const { User } = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcrypt');
const AuthService = require('./AuthService');
const Referral = require('../models/Referral');

const SocialAuthService = {
  // Validate social signin request
  validateSocialSignInRequest: (body) => {
    const { email, authType, googleId, appleId } = body;
    const errors = [];

    if (!email || typeof email !== 'string') {
      errors.push('Invalid email format');
    }

    if (!authType || !['google', 'apple'].includes(authType)) {
      errors.push('Invalid or missing authType (should be "google" or "apple")');
    }

    if (authType === 'google' && !googleId) {
      errors.push('googleId is required when authType is "google"');
    }

    if (authType === 'apple' && !appleId) {
      errors.push('appleId is required when authType is "apple"');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Handle social sign-in/sign-up
  socialSignIn: async (requestData) => {
    try {
      const {
        name = '',
        email,
        phoneNumber = '',
        deviceId = 'UNKNOWN_DEVICE',
        appleId,
        googleId,
        authType,
        referralCode
      } = requestData;

      // Validate request
      const validation = SocialAuthService.validateSocialSignInRequest(requestData);
      if (!validation.isValid) {
        return {
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          errors: validation.errors,
        };
      }

      let user = null;
      let isNewUser = false;

      // Check if user exists by email
      const existingUserByEmail = await User.findByEmail(email);

      if (!existingUserByEmail) {
        // New user - create via social auth
        isNewUser = true;

        // Check if social ID is already linked to another account
        if (authType === 'google' && googleId) {
          const existingGoogleUser = await User.findByGoogleId(googleId);
          if (existingGoogleUser) {
            return {
              success: false,
              statusCode: 409,
              message: 'googleId is already linked to another account',
            };
          }
        }

        if (authType === 'apple' && appleId) {
          const existingAppleUser = await User.findByAppleId(appleId);
          if (existingAppleUser) {
            return {
              success: false,
              statusCode: 409,
              message: 'appleId is already linked to another account',
            };
          }
        }

        // Generate referral code for new user
        const userReferralCode = await AuthService.generateUniqueReferralCode();

        // Create new user
        const socialId = authType === 'google' ? googleId : appleId;
        user = await User.createSocialUser(
          email.toLowerCase(),
          authType,
          socialId,
          name,
          phoneNumber,
          deviceId,
          userReferralCode
        );

        // Handle referral if code provided
        if (referralCode) {
          const referrer = await User.findByReferralCode(referralCode);
          if (referrer) {
            await Referral.create(referrer.id, user.id);
          }
        }
      } else {
        // Existing user
        user = existingUserByEmail;

        // Verify auth provider consistency
        if (user.auth_provider && user.auth_provider !== 'email' && user.auth_provider !== authType) {
          return {
            success: false,
            statusCode: 400,
            message: `Account was created using ${user.auth_provider}. Please sign in with that provider.`,
          };
        }

        // Verify social IDs match
        if (authType === 'google') {
          if (!user.google_id) {
            return {
              success: false,
              statusCode: 400,
              message: 'No Google account linked to this email. Use a different sign-in method.',
            };
          }
          if (user.google_id !== googleId) {
            return {
              success: false,
              statusCode: 400,
              message: 'Google ID mismatch. This account is linked to a different Google account.',
            };
          }
        }

        if (authType === 'apple') {
          if (!user.apple_id) {
            return {
              success: false,
              statusCode: 400,
              message: 'No Apple account linked to this email. Use a different sign-in method.',
            };
          }
          if (user.apple_id !== appleId) {
            return {
              success: false,
              statusCode: 400,
              message: 'Apple ID mismatch. This account is linked to a different Apple account.',
            };
          }
        }

        // Update device info
        await User.updateDeviceInfo(user.id, deviceId);

        // Update name if not set and provided
        if (!user.first_name && name) {
          await User.updateProfile(user.id, {
            firstName: name,
            LastName: '',
            phoneNumber: user.phone_number,
          });
        }
      }

      // Generate tokens
      const accessToken = generateAccessToken(user.id, user.email, user.role || 'user');
      const refreshToken = generateRefreshToken(user.id);

      // Save refresh token to database
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await RefreshToken.store(user.id, refreshToken, expiresAt);

      // Update last login
      await User.updateLastLogin(user.id);

      return {
        success: true,
        statusCode: isNewUser ? 201 : 200,
        message: isNewUser ? 'User registered successfully via social auth' : 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.first_name || '',
            phone: user.phone_number || '',
            isEmailVerified: user.is_email_verified,
            isProfileComplete: user.is_profile_complete,
            authProvider: user.auth_provider,
            role: user.role,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
          isNewUser,
        },
      };
    } catch (err) {
      console.error('Social sign-in error:', err);
      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error during social authentication',
        error: err.message,
      };
    }
  },
};

module.exports = SocialAuthService;

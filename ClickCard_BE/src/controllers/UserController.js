const AuthService = require('../services/AuthService');
const { User } = require('../models/User');
const { ShareLink } = require('../models/ShareLink');
const ShareLinkService = require('../services/ShareLinkService');
const CloudinaryService = require('../services/CloudinaryService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');
const { validateEmail } = require('../utils/validator');

const UserController = {
  // Step 1: Initiate registration (email only)
  initiateRegistration: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return sendErrorResponse(res, 400, 'Email is required');
      }

      if (!validateEmail(email)) {
        return sendErrorResponse(res, 400, 'Invalid email format. Please enter a valid email address (e.g., user@example.com)');
      }

      const result = await AuthService.initiateRegistration(email);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        const statusCode = result.statusCode || 400;
        return sendErrorResponse(res, statusCode, result.message);
      }
    } catch (err) {
      console.error('Initiate registration error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // Step 2: Verify email OTP for registration
  verifyEmailOTPForRegistration: async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return sendErrorResponse(res, 400, 'Email and OTP are required');
      }

      const result = await AuthService.verifyEmailOTPForRegistration(email, otp);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        const statusCode = result.statusCode || 400;
        return sendErrorResponse(res, statusCode, result.message);
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // Step 3: Check username availability
  checkUsernameAvailability: async (req, res) => {
    try {
      const { username } = req.body;

      if (!username) {
        return sendErrorResponse(res, 400, 'Username is required');
      }

      const result = await AuthService.checkUsernameAvailability(username);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, { available: result.available });
      } else {
        const statusCode = result.statusCode || 400;
        return sendErrorResponse(res, statusCode, result.message);
      }
    } catch (err) {
      console.error('Check username error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // Step 4: Complete registration
  completeRegistration: async (req, res) => {
    try {
      const { email, username, referralCode } = req.body;

      if (!email || !username) {
        return sendErrorResponse(res, 400, 'Email and username are required');
      }

      const result = await AuthService.completeRegistration(email, username, referralCode);

      if (result.success) {
        return sendSuccessResponse(res, 201, result.message, result.data);
      } else {
        const statusCode = result.statusCode || 400;
        return sendErrorResponse(res, statusCode, result.message);
      }
    } catch (err) {
      console.error('Complete registration error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },



  // Resend email OTP
  resendEmailOTP: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return sendErrorResponse(res, 400, 'Email is required');
      }

      const result = await AuthService.resendEmailOTP(email);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message);
      } else {
        return sendErrorResponse(res, 404, result.message);
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // Verify email OTP (for existing users)
  verifyEmailOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return sendErrorResponse(res, 400, 'Email and OTP are required');
      }

      const result = await AuthService.verifyEmailOTP(email, otp);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        return sendErrorResponse(res, 400, result.message);
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/login/initiate
  initiateLogin: async (req, res) => {
    try {
      const { credential } = req.body;
      const result = await AuthService.initiateLogin(credential);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        return sendErrorResponse(res, result.statusCode || 400, result.message);
      }
    } catch (err) {
      console.error('Login initiation error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/login/verify
  verifyLoginOTP: async (req, res) => {
    try {
      const { credential, otp } = req.body;
      const result = await AuthService.verifyLoginOTP(credential, otp);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        return sendErrorResponse(res, result.statusCode || 400, result.message);
      }
    } catch (err) {
      console.error('Login verification error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/admin/login — email + password (admin only, no OTP)
  adminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.adminLogin(email, password);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        return sendErrorResponse(res, result.statusCode || 400, result.message);
      }
    } catch (err) {
      console.error('Admin login error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },



  // POST /api/users/profile/create
  createFullProfile: async (req, res) => {
    try {
      const userId = req.user.userId;

      // Support both:
      // 1. multipart/form-data -> profileData as JSON string + optional profilePicture file
      // 2. application/json -> req.body is already the profile data object
      let profileData;
      if (req.body.profileData) {
        // Handle multipart/form-data: profileData might be a JSON string or an object
        if (typeof req.body.profileData === 'string') {
          try {
            profileData = JSON.parse(req.body.profileData);
          } catch (parseErr) {
            return sendErrorResponse(res, 400, 'Invalid JSON in profileData field');
          }
        } else {
          profileData = req.body.profileData;
        }
      } else {
        // Handle application/json: req.body is the profile data
        profileData = req.body;
      }

      // Handle optional profile picture upload
      let imageUrl = null;
      if (req.file) {
        try {
          const uploadResult = await CloudinaryService.uploadImage(
            req.file.buffer,
            'users',
            userId.toString()
          );
          imageUrl = uploadResult.secure_url;

          // Save image URL to users table
          await User.updateProfilePicture(userId, imageUrl);
        } catch (uploadErr) {
          console.error('Profile picture upload failed:', uploadErr.message);
          // Continue with profile creation even if image upload fails
        }
      }

      const result = await AuthService.createOrUpdateFullProfile(userId, profileData);

      if (result.success) {
        // Include imageUrl in response if uploaded
        const responseData = { ...result.data };
        if (imageUrl) {
          responseData.profilePicture = imageUrl;
        }
        return sendSuccessResponse(res, 201, result.message, responseData);
      } else {
        return sendErrorResponse(res, 400, result.message, result.errors || result.error);
      }
    } catch (err) {
      console.error('Create profile error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // GET /api/users/profile/full
  getFullProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      const result = await AuthService.getCurrentUser(userId); // This already returns user info

      // We might want to get the specific profile data from the new table
      const profile = await AuthService.getFullProfileData(userId);

      if (profile.success) {
        return sendSuccessResponse(res, 200, profile.message, profile.data);
      } else {
        return sendErrorResponse(res, 404, profile.message);
      }
    } catch (err) {
      console.error('Get profile error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },


  // GET /api/users/current
  getCurrentUser: async (req, res) => {
    try {
      const userId = req.user.userId;

      const result = await AuthService.getCurrentUser(userId);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        return sendErrorResponse(res, 404, result.message);
      }
    } catch (err) {
      console.error('Get current user error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/refresh-token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return sendErrorResponse(res, 400, 'Refresh token is required');
      }

      const result = await AuthService.refreshAccessToken(refreshToken);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message, result.data);
      } else {
        return sendErrorResponse(res, 401, result.message);
      }
    } catch (err) {
      console.error('Refresh token error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/logout
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return sendErrorResponse(res, 400, 'Refresh token is required');
      }

      const result = await AuthService.logout(refreshToken);

      if (result.success) {
        return sendSuccessResponse(res, 200, result.message);
      } else {
        return sendErrorResponse(res, 400, result.message);
      }
    } catch (err) {
      console.error('Logout error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },



  // POST /api/users/profile/make-public
  makeProfilePublic: async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return sendErrorResponse(res, 401, 'Unauthorized - User ID not found');
      }

      // Check if profile is complete
      const user = await User.getProfileWithVisibility(userId);

      if (!user) {
        return sendErrorResponse(res, 404, 'User not found');
      }

      if (!user.is_profile_complete) {
        return sendErrorResponse(
          res,
          400,
          'Profile must be complete before making it public. Please complete your profile first.'
        );
      }

      // Update profile visibility to public
      const result = await User.updateProfileVisibility(userId, true);

      return sendSuccessResponse(res, 200, 'Profile is now public', {
        profileId: result.id,
        email: result.email,
        name: result.first_name,
        isPublic: result.public_profile_enabled,
        message: 'Your public profile is now active and accessible via share links',
      });
    } catch (err) {
      console.error('Make profile public error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/profile/make-private
  makeProfilePrivate: async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return sendErrorResponse(res, 401, 'Unauthorized - User ID not found');
      }

      const user = await User.findById(userId);

      if (!user) {
        return sendErrorResponse(res, 404, 'User not found');
      }

      // Update profile visibility to private
      const result = await User.updateProfileVisibility(userId, false);

      return sendSuccessResponse(res, 200, 'Profile is now private', {
        profileId: result.id,
        email: result.email,
        name: result.first_name,
        isPublic: result.public_profile_enabled,
        message: 'Your public profile has been deactivated. Share links will no longer work.',
      });
    } catch (err) {
      console.error('Make profile private error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // GET /api/users/profile/visibility
  getProfileVisibility: async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return sendErrorResponse(res, 401, 'Unauthorized - User ID not found');
      }

      const user = await User.getProfileWithVisibility(userId);

      if (!user) {
        return sendErrorResponse(res, 404, 'User not found');
      }

      return sendSuccessResponse(res, 200, 'Profile visibility retrieved', {
        profileId: user.id,
        email: user.email,
        name: user.first_name,
        isPublic: user.public_profile_enabled,
        isProfileComplete: user.is_profile_complete,
        isEmailVerified: user.is_email_verified,
      });
    } catch (err) {
      console.error('Get profile visibility error:', err);
      return sendErrorResponse(res, 500, 'Internal server error');
    }
  },

  // POST /api/users/profile/upload-picture
  uploadProfilePicture: async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!req.file) {
        return sendErrorResponse(res, 400, 'No image file provided');
      }

      // 1. Upload to Cloudinary
      // Folder: 'users', Public ID: specific userId
      const result = await CloudinaryService.uploadImage(
        req.file.buffer,
        'users',
        userId.toString()
      );

      // 2. Update the database
      await User.updateProfilePicture(userId, result.secure_url);

      return sendSuccessResponse(res, 200, 'Profile picture uploaded successfully', {
        imageUrl: result.secure_url,
        userId: userId
      });
    } catch (err) {
      console.error('Profile picture upload error:', err);
      return sendErrorResponse(res, 500, err.message || 'Failed to upload profile picture');
    }
  },

  // GET /api/users/digital-card
  getMyDigitalCard: async (req, res) => {
    try {
      const userId = req.user.userId;

      // 1. Get full profile
      const profile = await User.getProfile(userId);
      
      // 2. Get primary share link
      let links = await ShareLink.findByUserId(userId);
      let primaryLink = links.find(l => l.is_active && l.custom_slug) || links.find(l => l.is_active) || links[0];

      // 3. If no link exists, create a default one
      if (!primaryLink) {
        const newLink = await ShareLinkService.createShareLink(userId, { shareMethod: 'link' });
        primaryLink = {
          id: newLink.id,
          custom_slug: newLink.custom_slug,
          short_code: newLink.short_code,
          is_active: true
        };
      }

      // 4. Generate/Get QR Code and Public URL
      const baseUrl = process.env.SHARE_LINK_BASE_URL || `http://${req.get('host')}`;
      const identifier = primaryLink.custom_slug || primaryLink.short_code || userId;
      const publicUrl = `${baseUrl}/api/public/profile/${identifier}`;
      const qrCode = await ShareLinkService.getQRCode(primaryLink.id, userId, 'dataurl');

      return sendSuccessResponse(res, 200, 'Digital card data retrieved successfully', {
        profile,
        publicUrl,
        qrCode,
        linkDetails: {
          id: primaryLink.id,
          slug: primaryLink.custom_slug,
          shortCode: primaryLink.short_code
        }
      });
    } catch (err) {
      console.error('Get my digital card error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve digital card data');
    }
  },
};

module.exports = UserController;

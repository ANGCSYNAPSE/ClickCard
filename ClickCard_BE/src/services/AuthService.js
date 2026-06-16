const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const OTP = require('../models/OTP');
const RefreshToken = require('../models/RefreshToken');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwtUtils');
const {
  validateEmail,
  validatePhoneNumber,
  validateUsername,
  validateFieldsProfile,
} = require('../utils/validator');

const AuthService = {
  // Step 1: Initiate registration with email only (send OTP)
  initiateRegistration: async (email) => {
    console.log('🔄 Initiating registration for email:', email);
    try {
      // Validate email
      console.log('✅ Validating email...');
      if (!email || !validateEmail(email)) {
        console.log('❌ Email validation failed');
        return { success: false, message: 'Invalid email address', statusCode: 400 };
      }
      console.log('✅ Email validated successfully');

      // Check if email already exists
      console.log('🔍 Checking if email already exists...');
      const existingEmail = await User.findByEmail(email);
      console.log('📋 Existing email check result:', !!existingEmail);
      if (existingEmail) {
        console.log('❌ Email already registered');
        return { success: false, message: 'Email already registered', statusCode: 409 };
      }
      console.log('✅ Email not registered, proceeding...');

      // Generate and send OTP
      console.log('🔢 Generating OTP...');
      const otpResult = await OTP.generate(email, 'email_verification');
      console.log('📧 OTP generation result:', !!otpResult);
      
      if (!otpResult) {
        console.error('❌ Failed to generate OTP');
        return { success: false, message: 'Failed to generate OTP', statusCode: 500 };
      }
      console.log('✅ OTP generated successfully');

      console.log('📤 Sending OTP email...');
      const emailResult = await sendOTPEmail(email, otpResult.otp_code, 'email_verification', 'User');
      console.log('📧 Email send result:', emailResult);
      
      if (!emailResult.success) {
        console.error('❌ Failed to send email:', emailResult.error);
        return { success: false, message: `Failed to send OTP email: ${emailResult.error}`, statusCode: 500 };
      }
      console.log('✅ Email sent successfully');

      return {
        success: true,
        message: 'OTP sent to your email',
        data: {
          email: email,
        },
      };
    } catch (err) {
      console.error('❌ Initiate registration error:', err.message);
      console.error('❌ Full error:', err);
      return { success: false, message: `Registration initiation failed: ${err.message}`, statusCode: 500 };
    }
  },

  // Step 2: Verify email OTP (before username/password entry)
  verifyEmailOTPForRegistration: async (email, otpCode) => {
    try {
      // Validate email
      if (!email || !validateEmail(email)) {
        return { success: false, message: 'Invalid email address', statusCode: 400 };
      }

      const otpResult = await OTP.verify(email, otpCode, 'email_verification');

      if (!otpResult.success) {
        return { success: false, message: otpResult.message, statusCode: 400 };
      }

      return {
        success: true,
        message: 'Email verified. Proceed to username selection.',
        data: {
          email: email,
          verified: true,
        },
      };
    } catch (err) {
      console.error('Verify OTP error:', err.message);
      return { success: false, message: `OTP verification failed: ${err.message}`, statusCode: 500 };
    }
  },

  // Step 3: Check username availability
  checkUsernameAvailability: async (username) => {
    try {
      // Validate username
      if (!username || !validateUsername(username)) {
        return {
          success: false,
          message: 'Username must be 3-20 characters (alphanumeric and underscores only)',
          statusCode: 400,
          available: false,
        };
      }

      // Check if username already exists
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return {
          success: false,
          message: 'Username already taken',
          statusCode: 409,
          available: false,
        };
      }

      return {
        success: true,
        message: 'Username is available',
        available: true,
      };
    } catch (err) {
      console.error('Check username error:', err.message);
      return { success: false, message: `Failed to check username: ${err.message}`, statusCode: 500, available: false };
    }
  },

  // Step 4: Complete registration with username and optional referral code
  completeRegistration: async (email, username, referralCode = null, role = 'user') => {
    try {
      // 1. Validate username
      if (!username || !validateUsername(username)) {
        return { 
          success: false, 
          message: 'Username must be 3-20 characters (alphanumeric and underscores only)', 
          statusCode: 400 
        };
      }

      // 2. Check if username is already taken
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return { success: false, message: 'Username already taken', statusCode: 409 };
      }

      // 3. Generate unique referral code for the new user
      const userReferralCode = await AuthService.generateUniqueReferralCode();

      // 4. Create the user (Passwordless - no password needed)
      const user = await User.create(email.toLowerCase(), '', '', '', '', username, userReferralCode, role);

      // 5. Handle referral if code provided
      if (referralCode) {
        const referrer = await User.findByReferralCode(referralCode);
        if (referrer) {
          const Referral = require('../models/Referral');
          await Referral.create(referrer.id, user.id);
          // Notify the referrer (live).
          try {
            const NotificationService = require('./NotificationService');
            await NotificationService.notifyUser(referrer.id, {
              type: 'referral',
              title: 'New referral! 🎉',
              message: `@${username} joined using your referral code.`,
              data: { referredUserId: user.id, username },
            });
          } catch (e) {
            console.warn('Referral notification failed:', e.message);
          }
        }
      }

      // 5b. Notify admins of the new signup (live).
      try {
        const NotificationService = require('./NotificationService');
        await NotificationService.notifyAdmins({
          type: 'new_user',
          title: 'New user registered',
          message: `@${username} (${email}) just created an account.`,
          data: { userId: user.id, username, email },
        });
      } catch (e) {
        console.warn('Admin new-user notification failed:', e.message);
      }

      // 6. Verify email immediately since it was verified in Step 2
      await User.verifyEmail(user.id);

      // 7. Send welcome email
      const welcomeResult = await sendWelcomeEmail(email, username);
      
      if (!welcomeResult.success) {
        console.warn('Welcome email failed to send:', welcomeResult.error);
        // Don't fail registration if welcome email fails - user was created successfully
      }

      // 8. Generate tokens
      const accessToken = generateAccessToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token
      const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await RefreshToken.store(user.id, refreshToken, refreshTokenExpiry);

      return {
        success: true,
        message: 'Registration completed successfully',
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          referralCode: user.referral_code,
          role: user.role,
          accessToken,
          refreshToken,
        },
      };
    } catch (err) {
      console.error('Complete registration error:', err.message);
      return { success: false, message: `Registration failed: ${err.message}`, statusCode: 500 };
    }
  },

  // Helper: Generate a unique referral code
  generateUniqueReferralCode: async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let isUnique = false;
    let code = '';
    
    while (!isUnique) {
      code = 'CC-'; // ClickCard prefix
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const existing = await User.findByReferralCode(code);
      if (!existing) isUnique = true;
    }
    
    return code;
  },



  // Resend email OTP
  // Works in two scenarios:
  //   1. Mid-registration (no user row yet) — issues a new email_verification OTP
  //   2. Existing user (e.g. password reset / login OTP) — same, but with a name
  // The earlier `User.findByEmail` requirement broke the registration flow
  // because the user is created only at /complete-registration.
  resendEmailOTP: async (email) => {
    try {
      if (!email || !validateEmail(email)) {
        return { success: false, message: 'Invalid email address', statusCode: 400 };
      }

      const user = await User.findByEmail(email).catch(() => null);
      const userName = user ? (user.first_name || 'User') : 'User';

      // Generate new OTP (overwrites/invalidates any prior unverified OTP).
      const otpResult = await OTP.generate(email, 'email_verification');
      if (!otpResult) {
        return { success: false, message: 'Failed to generate OTP', statusCode: 500 };
      }

      const emailResult = await sendOTPEmail(
        email,
        otpResult.otp_code,
        'email_verification',
        userName,
      );

      // emailService now falls back to console-logging the OTP when SMTP is
      // not configured, so this only fails on truly catastrophic errors.
      if (!emailResult.success) {
        return {
          success: false,
          message: `Failed to send OTP: ${emailResult.error || emailResult.message}`,
          statusCode: 500,
        };
      }

      return {
        success: true,
        message: 'OTP resent successfully',
      };
    } catch (err) {
      console.error('Resend OTP error:', err.message);
      return { success: false, message: `Failed to resend OTP: ${err.message}`, statusCode: 500 };
    }
  },

  // Verify email OTP (for existing users)
  verifyEmailOTP: async (email, otpCode) => {
    try {
      const otpResult = await OTP.verify(email, otpCode, 'email_verification');

      if (!otpResult.success) {
        return { success: false, message: otpResult.message };
      }

      // Get user and update email verification
      const user = await User.findByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      await User.verifyEmail(user.id);

      // Send welcome email
      await sendWelcomeEmail(email, user.first_name || 'User');

      // Generate tokens so user is immediately logged in
      const accessToken = generateAccessToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token
      const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await RefreshToken.store(user.id, refreshToken, refreshTokenExpiry);

      return {
        success: true,
        message: 'Email verified successfully',
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          accessToken,
          refreshToken,
          isProfileComplete: user.is_profile_complete,
        },
      };
    } catch (err) {
      console.error('Verify OTP error:', err);
      return { success: false, message: 'OTP verification failed', error: err.message };
    }
  },

  // Login Initiation (Send OTP)
  initiateLogin: async (credential) => {
    try {
      if (!credential) {
        return { success: false, message: 'Email or username is required', statusCode: 400 };
      }

      let user = null;
      // Try to find user by email first
      if (validateEmail(credential)) {
        user = await User.findByEmail(credential);
      }
      // Try to find user by username
      else {
        user = await User.findByUsername(credential);
      }

      if (!user) {
        return { success: false, message: 'No account found with this email/username', statusCode: 404 };
      }

      // Generate and send OTP for login
      const otpResult = await OTP.generate(user.email, 'login');
      const emailResult = await sendOTPEmail(user.email, otpResult.otp_code, 'login', user.first_name || 'User');

      if (!emailResult.success) {
        console.error('Failed to send login OTP email:', emailResult.error);
        return { success: false, message: `Failed to send OTP email: ${emailResult.error}`, statusCode: 500 };
      }

      return {
        success: true,
        message: 'OTP sent to your registered email',
        data: {
          email: user.email,
          username: user.username
        }
      };
    } catch (err) {
      console.error('Login initiation error:', err);
      return { success: false, message: 'Failed to initiate login', error: err.message };
    }
  },

  // Verify Login OTP
  verifyLoginOTP: async (credential, otpCode) => {
    try {
      if (!credential || !otpCode) {
        return { success: false, message: 'Credential and OTP are required', statusCode: 400 };
      }

      let user = null;
      if (validateEmail(credential)) {
        user = await User.findByEmail(credential);
      } else {
        user = await User.findByUsername(credential);
      }

      if (!user) {
        return { success: false, message: 'User not found', statusCode: 404 };
      }

      const otpResult = await OTP.verify(user.email, otpCode, 'login');

      if (!otpResult.success) {
        return { success: false, message: otpResult.message, statusCode: 400 };
      }

      // Check email verification (if not already verified)
      if (!user.is_email_verified) {
        await User.verifyEmail(user.id);
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate tokens
      const accessToken = generateAccessToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token
      const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await RefreshToken.store(user.id, refreshToken, refreshTokenExpiry);

      return {
        success: true,
        message: 'Login successful',
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          isProfileComplete: user.is_profile_complete,
          accessToken,
          refreshToken,
        },
      };
    } catch (err) {
      console.error('Login verification error:', err);
      return { success: false, message: 'Login verification failed', error: err.message };
    }
  },


  // Admin login with email + password (no OTP)
  adminLogin: async (email, password) => {
    try {
      if (!email || !password) {
        return { success: false, message: 'Email and password are required', statusCode: 400 };
      }

      const user = await User.findByEmail(String(email).toLowerCase());
      if (!user) {
        return { success: false, message: 'Invalid credentials', statusCode: 401 };
      }
      if (user.role !== 'admin') {
        return { success: false, message: 'Access denied. Admins only.', statusCode: 403 };
      }
      if (user.is_blocked) {
        return { success: false, message: 'This account has been blocked', statusCode: 403 };
      }

      const passwordValid = await bcrypt.compare(password, user.password || '');
      if (!passwordValid) {
        return { success: false, message: 'Invalid credentials', statusCode: 401 };
      }

      await User.updateLastLogin(user.id);

      const accessToken = generateAccessToken(user.id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.id);
      const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await RefreshToken.store(user.id, refreshToken, refreshTokenExpiry);

      return {
        success: true,
        message: 'Admin login successful',
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          accessToken,
          refreshToken,
        },
      };
    } catch (err) {
      console.error('Admin login error:', err);
      return { success: false, message: 'Login failed', error: err.message, statusCode: 500 };
    }
  },

  // Create or Update Full Profile
  createOrUpdateFullProfile: async (userId, data) => {
    try {
      // Basic validation for Personal Identity
      if (data.personalIdentity && data.personalIdentity.fullName === '') {
        return { success: false, message: 'Full name is required in personal identity' };
      }

      // Map incoming payload to the 8 sections for the model
      const profileData = {
        personalIdentity: data.personalIdentity || {},
        contactInformation: data.contactInformation || {},
        education: data.education || [],
        workExperience: data.workExperience || [],
        businessDetails: data.businessDetails || {},
        productsServices: data.productsServices || [],
        socialLinks: data.socialMediaLinks || {}, // Mapping socialMediaLinks from request to socialLinks for DB
        digitalCard: data.digitalCard || {},
      };

      const updatedProfile = await User.createOrUpdateProfile(userId, profileData);

      return {
        success: true,
        message: 'Full profile updated successfully',
        data: updatedProfile,
      };
    } catch (err) {
      console.error('Profile update error:', err);
      return { success: false, message: 'Failed to update profile', error: err.message };
    }
  },



  // Get full profile data
  getFullProfileData: async (userId) => {
    try {
      const profile = await User.getProfile(userId);
      if (!profile) {
        return { success: false, message: 'Profile not found' };
      }

      return {
        success: true,
        message: 'Profile retrieved successfully',
        data: profile,
      };
    } catch (err) {
      console.error('Get profile data error:', err);
      return { success: false, message: 'Failed to get profile data', error: err.message };
    }
  },

  // Get current user
  getCurrentUser: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (err) {
      console.error('Get user error:', err);
      return { success: false, message: 'Failed to get user', error: err.message };
    }
  },



  // Refresh access token
  refreshAccessToken: async (refreshToken) => {
    try {
      // Verify refresh token
      const verification = verifyRefreshToken(refreshToken);
      if (!verification.valid) {
        return { success: false, message: 'Invalid refresh token' };
      }

      // Check if token is in database and not revoked
      const tokenRecord = await RefreshToken.findByToken(refreshToken);
      if (!tokenRecord) {
        return { success: false, message: 'Refresh token not found or revoked' };
      }

      // Check expiry
      if (new Date() > new Date(tokenRecord.expires_at)) {
        return { success: false, message: 'Refresh token expired' };
      }

      // Get user info
      const user = await User.findById(tokenRecord.user_id);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user.id, user.email, user.role);

      return {
        success: true,
        message: 'Access token refreshed successfully',
        data: { accessToken: newAccessToken },
      };
    } catch (err) {
      console.error('Refresh token error:', err);
      return { success: false, message: 'Failed to refresh token', error: err.message };
    }
  },

  // Logout user
  logout: async (refreshToken) => {
    try {
      // Revoke refresh token
      await RefreshToken.revoke(refreshToken);

      return { success: true, message: 'Logout successful' };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, message: 'Logout failed', error: err.message };
    }
  },


};

module.exports = AuthService;

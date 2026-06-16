const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const PDFController = require('../controllers/PDFController');
const LeadController = require('../controllers/LeadController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage (for direct Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Multi-step user registration and authentication
 */

/* ---------------------- REGISTRATION FLOW (4 STEPS) ---------------------- */

/**
 * @swagger
 * /api/users/initiate-registration:
 *   post:
 *     summary: Step 1 - Initiate registration with email
 *     description: User enters a valid email address. OTP is sent to verify the email before proceeding to username selection.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 pattern: '^[^\s@]+@[^\s@]+\.[^\s@]+$'
 *                 description: Valid email address (e.g., user@example.com, john.doe@company.co.uk)
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP sent to your email"
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *       400:
 *         description: Invalid email format or missing required field
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid email format. Please enter a valid email address (e.g., user@example.com)"
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email already registered"
 */
router.post('/initiate-registration', UserController.initiateRegistration);

/**
 * @swagger
 * /api/users/verify-email-otp-registration:
 *   post:
 *     summary: Step 2 - Verify email OTP during registration
 *     description: User enters OTP received in email. After verification, user can proceed to username selection.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     verified:
 *                       type: boolean
 *       400:
 *         description: Invalid OTP or email
 */
router.post('/verify-email-otp-registration', UserController.verifyEmailOTPForRegistration);

/**
 * @swagger
 * /api/users/check-username:
 *   post:
 *     summary: Step 3 - Check username availability
 *     description: User checks if desired username is available. Username must be 3-20 characters (alphanumeric and underscores).
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *     responses:
 *       200:
 *         description: Username availability checked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *       400:
 *         description: Invalid username format
 *       409:
 *         description: Username already taken
 */
router.post('/check-username', UserController.checkUsernameAvailability);

/**
 * @swagger
 * /api/users/complete-registration:
 *   post:
 *     summary: Step 4 - Complete registration
 *     description: Finalize registration with username and optional referral code.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 example: john_doe
 *               referralCode:
 *                 type: string
 *                 example: CC-ABC123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Username already taken
 */
router.post('/complete-registration', UserController.completeRegistration);


/* ---------------------- EMAIL OTP MANAGEMENT ---------------------- */

/**
 * @swagger
 * /api/users/resend-email-otp:
 *   post:
 *     summary: Resend email OTP
 *     description: Resend OTP to email for users who didn't receive or want to regenerate it.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       404:
 *         description: User not found
 */
router.post('/resend-email-otp', UserController.resendEmailOTP);

/**
 * @swagger
 * /api/users/verify-email-otp:
 *   post:
 *     summary: Verify email OTP (existing users)
 *     description: Verify OTP for existing users (e.g., password reset flow). User is logged in after verification.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Invalid OTP or email
 */
router.post('/verify-email-otp', UserController.verifyEmailOTP);

/* ---------------------- LOGIN ---------------------- */

/**
 * @swagger
 * /api/users/login/initiate:
 *   post:
 *     summary: Initiate passwordless login
 *     description: Send an OTP to the user's registered email using their email or username.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Email or username
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */
router.post('/login/initiate', UserController.initiateLogin);

/**
 * @swagger
 * /api/users/login/verify:
 *   post:
 *     summary: Verify login OTP
 *     description: Verify the OTP sent to email and complete login. Returns tokens.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *               - otp
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Email or username used during initiation
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid OTP
 */
router.post('/login/verify', UserController.verifyLoginOTP);

/**
 * @swagger
 * /api/users/admin/login:
 *   post:
 *     summary: Admin login (email + password)
 *     description: Password-based login for admin accounts only. Returns JWT tokens. No OTP.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: admin@angc.com }
 *               password: { type: string, example: "ClickCard@Admin1" }
 *     responses:
 *       200:
 *         description: Admin login successful (returns accessToken, refreshToken, role)
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Access denied — not an admin
 */
router.post('/admin/login', UserController.adminLogin);


/* ---------------------- PASSWORD MANAGEMENT ---------------------- */


/* ---------------------- PROTECTED ROUTES (REQUIRE AUTHENTICATION) ---------------------- */

/**
 * @swagger
 * /api/users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh-token', UserController.refreshToken);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and revoke refresh token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticateToken, UserController.logout);

/**
 * @swagger
 * /api/users/profile/create:
 *   post:
 *     summary: Create or update full profile (including optional profile picture)
 *     description: Create or update user's full profile across 8 sections. You can upload an optional 'profilePicture' and send the rest of the data in 'profileData'.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile picture file
 *               profileData:
 *                 type: object
 *                 description: All 8 profile sections (Personal, Contact, Education, Work, Business, Products, Social, Digital Card)
 *                 properties:
 *                   personalIdentity:
 *                     type: object
 *                     properties:
 *                       fullName: { type: string, example: "John Doe" }
 *                       displayName: { type: string, example: "JohnD" }
 *                       pronouns: { type: string, example: "He/Him" }
 *                       dateOfBirth: { type: string, format: date, example: "1990-01-01" }
 *                       gender: { type: string, example: "Male" }
 *                       nationality: { type: string, example: "Indian" }
 *                       location: { type: string, example: "Mumbai, India" }
 *                       tagline: { type: string, example: "Creative Designer" }
 *                       bio: { type: string, example: "Experienced professional..." }
 *                   contactInformation:
 *                     type: object
 *                     properties:
 *                       primaryMobile: { type: string, example: "+919876543210" }
 *                       secondaryMobile: { type: string, example: "+919876543211" }
 *                       emails: { type: array, items: { type: string }, example: ["work@john.com", "home@john.com"] }
 *                       whatsAppNumber: { type: string, example: "+919876543210" }
 *                       websiteUrl: { type: string, example: "https://johndoe.com" }
 *                   education:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         institutionName: { type: string, example: "University of Tech" }
 *                         degree: { type: string, example: "Bachelor of Engineering" }
 *                         yearOfPassing: { type: string, example: "2012" }
 *                   workExperience:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         company: { type: string, example: "Tech Solutions Inc" }
 *                         designation: { type: string, example: "Senior Developer" }
 *                         duration: { type: string, example: "2015 - Present" }
 *                   businessDetails:
 *                     type: object
 *                     properties:
 *                       companyName: { type: string, example: "ClickCard Global" }
 *                       industry: { type: string, example: "IT Services" }
 *                   productsServices:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name: { type: string, example: "Premium Digital Card" }
 *                   socialMediaLinks:
 *                     type: object
 *                     properties:
 *                       linkedIn: { type: string, example: "linkedin.com/in/johndoe" }
 *                       instagram: { type: string, example: "instagram.com/johndoe" }
 *                   digitalCard:
 *                     type: object
 *                     properties:
 *                       templateId: { type: string, example: "classic_gold" }
 *                       isPublic: { type: boolean, example: true }
 *           encoding:
 *             profileData:
 *               contentType: application/json
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       201:
 *         description: Full User Profile created/updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/create', authenticateToken, upload.single('profilePicture'), UserController.createFullProfile);

/**
 * @swagger
 * /api/users/profile/full:
 *   get:
 *     summary: Get full profile
 *     description: Retrieve user's complete profile data.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile/full', authenticateToken, UserController.getFullProfile);

// Get user leads
router.get('/leads', authenticateToken, LeadController.getUserLeads);

/**
 * @swagger
 * /api/users/current:
 *   get:
 *     summary: Get current user
 *     description: Retrieve current logged-in user details.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/current', authenticateToken, UserController.getCurrentUser);


/**
 * @swagger
 * /api/users/profile/make-public:
 *   post:
 *     summary: Make profile public
 *     description: Make user's profile visible to public.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile made public
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/make-public', authenticateToken, UserController.makeProfilePublic);

/**
 * @swagger
 * /api/users/profile/make-private:
 *   post:
 *     summary: Make profile private
 *     description: Make user's profile private and hidden from public.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile made private
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/make-private', authenticateToken, UserController.makeProfilePrivate);

/**
 * @swagger
 * /api/users/profile/visibility:
 *   get:
 *     summary: Get profile visibility
 *     description: Check if user's profile is public or private.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile visibility retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/profile/visibility', authenticateToken, UserController.getProfileVisibility);

/**
 * @swagger
 * /api/users/profile/upload-picture:
 *   post:
 *     summary: Upload profile picture
 *     description: Uploads a profile picture to Cloudinary and updates the user's profile.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Picture uploaded successfully
 *       400:
 *         description: No file provided or invalid format
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/upload-picture', authenticateToken, upload.single('profilePicture'), UserController.uploadProfilePicture);

/**
 * @swagger
 * /api/users/profile/pdf-url:
 *   get:
 *     summary: Get public PDF URL
 *     description: Returns the public URL for the user's resume PDF.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF URL retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active share link found
 */
router.get('/profile/pdf-url', authenticateToken, PDFController.getMyPDFUrl);

/**
 * @swagger
 * /api/users/profile/my-resume.pdf:
 *   get:
 *     summary: Download own resume PDF
 *     description: Generates and downloads the authenticated user's own resume PDF.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF resume generated
 *       401:
 *         description: Unauthorized
 */
router.get('/profile/my-resume.pdf', authenticateToken, PDFController.downloadMyResumePDF);

/**
 * @swagger
 * /api/users/profile/card/templates:
 *   get:
 *     summary: List digital card templates
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Templates retrieved }
 */
router.get('/profile/card/templates', authenticateToken, PDFController.listCardTemplates);

/**
 * @swagger
 * /api/users/profile/card/preview:
 *   get:
 *     summary: Server-rendered HTML preview of the digital card (?templateId=...)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: HTML preview }
 */
router.get('/profile/card/preview', authenticateToken, PDFController.previewCard);

/**
 * @swagger
 * /api/users/profile/card.pdf:
 *   post:
 *     summary: Render the chosen digital card template as PDF
 *     description: Server-side rendering via puppeteer-core. Requires Chromium on the host.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId: { type: string }
 *               primary: { type: string, description: "Hex #rrggbb" }
 *               accent: { type: string, description: "Hex #rrggbb" }
 *               theme: { type: string, enum: [light, dark] }
 *     responses:
 *       200: { description: PDF stream }
 *       503: { description: Chromium not configured on server }
 */
router.post('/profile/card.pdf', authenticateToken, PDFController.downloadCardPDF);

// My Digital Card (Profile + QR + Public Link)
router.get('/digital-card', authenticateToken, UserController.getMyDigitalCard);

module.exports = router;

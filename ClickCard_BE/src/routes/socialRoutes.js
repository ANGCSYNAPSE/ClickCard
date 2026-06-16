const express = require('express');
const { body, validationResult } = require('express-validator');
const SocialController = require('../controllers/SocialController');

const router = express.Router();

// Validation middleware for social signin
const validateSocialSignIn = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('authType')
    .isIn(['google', 'apple'])
    .withMessage('authType must be either "google" or "apple"'),
  body('googleId')
    .if(() => true)
    .optional()
    .isString()
    .trim(),
  body('appleId')
    .if(() => true)
    .optional()
    .isString()
    .trim(),
  body('name')
    .optional()
    .isString()
    .trim(),
  body('phoneNumber')
    .optional()
    .isString()
    .trim(),
  body('deviceId')
    .optional()
    .isString()
    .trim(),
  body('fcmToken')
    .optional()
    .isString()
    .trim(),
];

// Custom validation middleware
const validateCustomRules = (req, res, next) => {
  const { authType, googleId, appleId } = req.body;

  if (authType === 'google' && !googleId) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'googleId', message: 'googleId is required when authType is "google"' }],
    });
  }

  if (authType === 'apple' && !appleId) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'appleId', message: 'appleId is required when authType is "apple"' }],
    });
  }

  next();
};

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * @swagger
 * /api/auth/social-signin:
 *   post:
 *     summary: Login or Register via social accounts (Google, Apple)
 *     description: |
 *       Unified endpoint for social authentication. Automatically creates accounts for new users.
 *       Now supports referralCode for tracking invites.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, authType]
 *             properties:
 *               email: { type: string, format: email }
 *               authType: { type: string, enum: [google, apple] }
 *               googleId: { type: string }
 *               appleId: { type: string }
 *               name: { type: string }
 *               phoneNumber: { type: string }
 *               deviceId: { type: string }
 *               referralCode: { type: string, example: "CC-ABC123" }
 *     responses:
 *       200:
 *         description: Login successful
 *       201:
 *         description: Social registration successful
 */
router.post(
  '/social-signin',
  validateSocialSignIn,
  handleValidationErrors,
  validateCustomRules,
  SocialController.socialSignIn
);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Sign in or register with a verified Google ID token
 *     description: |
 *       Accepts a Google-issued ID token (`credential`) from Google Identity Services on the client.
 *       The server verifies the token against Google's JWKS and the configured `GOOGLE_CLIENT_ID`
 *       audience(s), then either logs the user in or creates a new account. Returns the same
 *       payload shape as `/api/auth/social-signin`.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credential]
 *             properties:
 *               credential: { type: string, description: "Google ID token (JWT)" }
 *               deviceId: { type: string }
 *               referralCode: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       201: { description: Registered successfully }
 *       401: { description: Invalid credential }
 */
router.post('/google', SocialController.googleSignIn);

/**
 * @swagger
 * /api/auth/apple:
 *   post:
 *     summary: Sign in or register with a verified Apple ID token
 *     description: |
 *       Accepts an Apple-issued ID token (`credential`) from Sign in with Apple JS on the client.
 *       The server verifies the JWT against Apple's JWKS and the configured `APPLE_CLIENT_ID`
 *       audience(s). Apple only returns the user's name on the *first* auth — pass it in `name`.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credential]
 *             properties:
 *               credential: { type: string }
 *               name: { type: string }
 *               deviceId: { type: string }
 *               referralCode: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       201: { description: Registered successfully }
 *       401: { description: Invalid credential }
 */
router.post('/apple', SocialController.appleSignIn);

module.exports = router;

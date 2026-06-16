const express = require('express');
const router = express.Router();
const PublicProfileController = require('../controllers/PublicProfileController');
const PDFController = require('../controllers/PDFController');
const LeadController = require('../controllers/LeadController');

// Get public profile by identifier (slug, short code, or user_id)
router.get('/profile/:identifier', PublicProfileController.getPublicProfile);

// Download PDF resume for a public profile
router.get('/profile/:identifier/resume.pdf', PDFController.downloadPublicResumePDF);

// Get QR code for public profile
router.get('/profile/:identifier/qr', PublicProfileController.getPublicQRCode);

// Verify password for protected profiles
router.post('/profile/:identifier/verify-password', PublicProfileController.verifyPassword);

// Submit a lead (contact form) on a public profile
router.post('/profile/:identifier/lead', LeadController.captureLead);

// Test endpoint
router.get('/test', (req, res) => res.json({ ok: true }));

module.exports = router;

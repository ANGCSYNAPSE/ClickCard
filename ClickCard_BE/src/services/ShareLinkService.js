const { ShareLink } = require('../models/ShareLink');
const { User } = require('../models/User');
const { generateSlug, createUniqueSlug } = require('../utils/slugGenerator');
const { generateShortCode } = require('../utils/shortCodeGenerator');
const { generateQRCodeDataUrl, generateQRCodeBuffer } = require('../utils/qrCodeGenerator');
const bcrypt = require('bcryptjs');

class ShareLinkService {
  /**
   * Create a new share link for a user
   * @param {number} userId - User ID
   * @param {object} options - Configuration options
   * @returns {object} - Created share link with URLs
   */
  static async createShareLink(userId, options = {}) {
    try {
      const {
        customSlug = null,
        expiryDays = null,
        requiresPassword = false,
        sharePassword = null,
        shareMethod = 'link',
      } = options;

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate or validate custom slug
      let finalSlug = null;
      if (customSlug) {
        const baseSlug = generateSlug(customSlug);
        let isTaken = await ShareLink.isSlugTaken(baseSlug);
        let suffix = 0;

        // If slug is taken, append number
        while (isTaken) {
          suffix++;
          const testSlug = suffix === 1 ? baseSlug : `${baseSlug}-${suffix}`;
          isTaken = await ShareLink.isSlugTaken(testSlug);
          if (!isTaken) {
            finalSlug = testSlug;
            break;
          }
        }

        if (!finalSlug) {
          finalSlug = baseSlug;
        }
      }

      // Generate unique short code
      let shortCode = generateShortCode();
      let isTaken = await ShareLink.isShortCodeTaken(shortCode);
      let attempts = 0;

      while (isTaken && attempts < 10) {
        shortCode = generateShortCode();
        isTaken = await ShareLink.isShortCodeTaken(shortCode);
        attempts++;
      }

      if (isTaken) {
        throw new Error('Failed to generate unique short code after 10 attempts');
      }

      // Hash password if provided
      let hashedPassword = null;
      if (requiresPassword && sharePassword) {
        hashedPassword = await bcrypt.hash(sharePassword, 10);
      }

      // Calculate expiry date
      let expiryDate = null;
      if (expiryDays && expiryDays > 0) {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
      }

      // Create share link in database
      const shareLink = await ShareLink.create(userId, {
        customSlug: finalSlug,
        shortCode,
        shareMethod,
        expiryDate,
      });

      // Update with password if needed
      if (requiresPassword && hashedPassword) {
        await ShareLink.update(shareLink.id, {
          requiresPassword: true,
          sharePassword: hashedPassword,
        });
      }

      // Generate QR code
      const baseUrl = process.env.SHARE_LINK_BASE_URL || 'http://localhost:5000';
      const publicUrl = finalSlug
        ? `${baseUrl}/api/public/profile/${finalSlug}`
        : `${baseUrl}/api/public/profile/${shareLink.user_id}`;
      const qrCodeDataUrl = await generateQRCodeDataUrl(publicUrl);

      return {
        id: shareLink.id,
        public_url: publicUrl,
        short_url: `${baseUrl}/api/public/profile/${shortCode}`,
        qr_code: qrCodeDataUrl,
        short_code: shortCode,
        custom_slug: finalSlug,
        is_active: shareLink.is_active,
        requires_password: requiresPassword,
        expiry_date: expiryDate,
        created_at: shareLink.created_at,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update share link settings
   * @param {number} shareLinkId - Share link ID
   * @param {number} userId - User ID (for authorization)
   * @param {object} updates - Fields to update
   * @returns {object} - Updated share link
   */
  static async updateShareLink(shareLinkId, userId, updates = {}) {
    try {
      // Verify link exists and belongs to user
      const shareLink = await ShareLink.findById(shareLinkId);
      if (!shareLink || shareLink.user_id !== userId) {
        throw new Error('Share link not found or unauthorized');
      }

      const { customSlug, isActive, expiryDate, requiresPassword, sharePassword } = updates;

      // Validate custom slug if provided
      let finalSlug = null;
      if (customSlug) {
        const baseSlug = generateSlug(customSlug);
        const isTaken = await ShareLink.isSlugTaken(baseSlug, shareLinkId);
        if (isTaken) {
          throw new Error('Custom slug is already taken');
        }
        finalSlug = baseSlug;
      }

      // Hash password if provided
      let hashedPassword = null;
      if (requiresPassword && sharePassword) {
        hashedPassword = await bcrypt.hash(sharePassword, 10);
      }

      // Update share link
      const updated = await ShareLink.update(shareLinkId, {
        customSlug: finalSlug,
        isActive,
        expiryDate,
        requiresPassword,
        sharePassword: hashedPassword,
      });

      return {
        id: updated.id,
        custom_slug: updated.custom_slug,
        short_code: updated.short_code,
        is_active: updated.is_active,
        expiry_date: updated.expiry_date,
        updated_at: updated.updated_at,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get all share links for a user
   * @param {number} userId - User ID
   * @returns {array} - Array of share links
   */
  static async getUserShareLinks(userId) {
    try {
      const shareLinks = await ShareLink.findByUserId(userId);
      return shareLinks.map((link) => ({
        id: link.id,
        short_code: link.short_code,
        custom_slug: link.custom_slug,
        is_active: link.is_active,
        expiry_date: link.expiry_date,
        view_count: link.view_count,
        unique_visitors: link.unique_visitors,
        last_viewed: link.last_viewed,
        created_at: link.created_at,
        updated_at: link.updated_at,
      }));
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete a share link
   * @param {number} shareLinkId - Share link ID
   * @param {number} userId - User ID (for authorization)
   * @returns {object} - Deleted share link info
   */
  static async deleteShareLink(shareLinkId, userId) {
    try {
      const shareLink = await ShareLink.findById(shareLinkId);
      if (!shareLink || shareLink.user_id !== userId) {
        throw new Error('Share link not found or unauthorized');
      }

      const deleted = await ShareLink.delete(shareLinkId);
      return {
        id: deleted.id,
        is_active: deleted.is_active,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Regenerate short code for a share link
   * @param {number} shareLinkId - Share link ID
   * @param {number} userId - User ID (for authorization)
   * @returns {object} - Updated share link with new short code
   */
  static async regenerateShortCode(shareLinkId, userId) {
    try {
      const shareLink = await ShareLink.findById(shareLinkId);
      if (!shareLink || shareLink.user_id !== userId) {
        throw new Error('Share link not found or unauthorized');
      }

      // Generate new short code
      let newShortCode = generateShortCode();
      let isTaken = await ShareLink.isShortCodeTaken(newShortCode);
      let attempts = 0;

      while (isTaken && attempts < 10) {
        newShortCode = generateShortCode();
        isTaken = await ShareLink.isShortCodeTaken(newShortCode);
        attempts++;
      }

      if (isTaken) {
        throw new Error('Failed to generate unique short code');
      }

      const updated = await ShareLink.regenerateShortCode(shareLinkId, newShortCode);

      // Generate new QR code
      const baseUrl = process.env.SHARE_LINK_BASE_URL || 'http://localhost:5000';
      const publicUrl = shareLink.custom_slug
        ? `${baseUrl}/api/public/profile/${shareLink.custom_slug}`
        : `${baseUrl}/api/public/profile/${shareLink.user_id}`;
      const qrCodeDataUrl = await generateQRCodeDataUrl(publicUrl);

      return {
        id: updated.id,
        short_code: updated.short_code,
        short_url: `${baseUrl}/api/public/profile/${updated.short_code}`,
        qr_code: qrCodeDataUrl,
        updated_at: updated.updated_at,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Verify share link password
   * @param {string} plainPassword - Plain password to verify
   * @param {string} hashedPassword - Hashed password from database
   * @returns {boolean} - True if password matches
   */
  static async verifyShareLinkPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Check if share link is accessible
   * @param {object} shareLink - Share link object
   * @returns {object} - Accessibility status and message
   */
  static checkAccessibility(shareLink) {
    const status = {
      accessible: true,
      message: null,
      reason: null,
    };

    // Check if active
    if (!shareLink.is_active) {
      status.accessible = false;
      status.reason = 'inactive';
      status.message = 'This share link has been deactivated';
      return status;
    }

    // Check if expired
    if (shareLink.expiry_date && new Date(shareLink.expiry_date) < new Date()) {
      status.accessible = false;
      status.reason = 'expired';
      status.message = 'This share link has expired';
      return status;
    }

    return status;
  }

  /**
   * Get QR code for a share link
   * @param {number} shareLinkId - Share link ID
   * @param {number} userId - User ID (for authorization)
   * @param {string} format - Format: 'dataurl' or 'buffer'
   * @returns {string|Buffer} - QR code in requested format
   */
  static async getQRCode(shareLinkId, userId, format = 'dataurl') {
    try {
      const shareLink = await ShareLink.findById(shareLinkId);
      if (!shareLink || shareLink.user_id !== userId) {
        throw new Error('Share link not found or unauthorized');
      }

      const baseUrl = process.env.SHARE_LINK_BASE_URL || 'http://localhost:5000';
      const publicUrl = shareLink.custom_slug
        ? `${baseUrl}/api/public/profile/${shareLink.custom_slug}`
        : `${baseUrl}/api/public/profile/${shareLink.user_id}`;

      if (format === 'buffer') {
        return await generateQRCodeBuffer(publicUrl);
      }

      return await generateQRCodeDataUrl(publicUrl);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = ShareLinkService;

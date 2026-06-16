const pool = require('../config/database');

const OTP = {
  // Generate and store OTP
  generate: async (email, purpose) => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = parseInt(process.env.OTP_EXPIRY) || 10; // minutes
    const expiresAt = new Date(Date.now() + otpExpiry * 60000);

    const query = `
      INSERT INTO email_otps (email, otp_code, purpose, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id, otp_code, expires_at
    `;
    try {
      const result = await pool.query(query, [email, otpCode, purpose, expiresAt]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Verify OTP
  verify: async (email, otpCode, purpose) => {
    const query = `
      SELECT id, otp_code, is_verified, expires_at, attempts
      FROM email_otps
      WHERE email = $1 AND purpose = $2 AND is_verified = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `;
    try {
      const result = await pool.query(query, [email, purpose]);
      const otpRecord = result.rows[0];

      if (!otpRecord) {
        return { success: false, message: 'OTP not found' };
      }

      // Check expiry
      if (new Date() > new Date(otpRecord.expires_at)) {
        return { success: false, message: 'OTP expired' };
      }

      // Check attempts
      if (otpRecord.attempts >= 3) {
        return { success: false, message: 'Too many attempts. Please request a new OTP' };
      }

      // Verify OTP
      if (otpRecord.otp_code === otpCode) {
        const updateQuery = `
          UPDATE email_otps
          SET is_verified = TRUE, verified_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING id, is_verified
        `;
        await pool.query(updateQuery, [otpRecord.id]);
        return { success: true, message: 'OTP verified successfully' };
      } else {
        // Increment attempts
        const incrementQuery = `
          UPDATE email_otps
          SET attempts = attempts + 1
          WHERE id = $1
        `;
        await pool.query(incrementQuery, [otpRecord.id]);
        return { success: false, message: 'Invalid OTP', attempts: otpRecord.attempts + 1 };
      }
    } catch (err) {
      throw err;
    }
  },

  // Get latest OTP for email
  getLatest: async (email, purpose) => {
    const query = `
      SELECT id, otp_code, is_verified, expires_at, attempts
      FROM email_otps
      WHERE email = $1 AND purpose = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;
    try {
      const result = await pool.query(query, [email, purpose]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Clean expired OTPs (optional cleanup)
  cleanExpired: async () => {
    const query = `
      DELETE FROM email_otps
      WHERE expires_at < CURRENT_TIMESTAMP
    `;
    try {
      await pool.query(query);
    } catch (err) {
      throw err;
    }
  },
};

module.exports = OTP;

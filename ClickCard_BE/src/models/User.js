const pool = require('../config/database');

const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) UNIQUE,
      phone_number VARCHAR(20) UNIQUE,
      fcm_token VARCHAR(255),
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      date_of_birth DATE,
      gender VARCHAR(20),
      profile_picture VARCHAR(500),
      role VARCHAR(20) DEFAULT 'user',
      is_email_verified BOOLEAN DEFAULT FALSE,
      is_profile_complete BOOLEAN DEFAULT FALSE,
      public_profile_enabled BOOLEAN DEFAULT FALSE,
      profile_bio VARCHAR(500),
      profile_header_image VARCHAR(500),
      last_login TIMESTAMP,
      auth_provider VARCHAR(50) DEFAULT 'email',
      google_id VARCHAR(255) UNIQUE,
      apple_id VARCHAR(255) UNIQUE,
      device_id VARCHAR(255),
      is_blocked BOOLEAN DEFAULT FALSE,
      moderation_status VARCHAR(20) DEFAULT 'approved',
      referral_code VARCHAR(20) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id SERIAL PRIMARY KEY,
      referrer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'signed_up',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(referred_id)
    );

    CREATE TABLE IF NOT EXISTS email_otps (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp_code VARCHAR(10) NOT NULL,
      purpose VARCHAR(50), -- 'email_verification', 'password_reset'
      is_verified BOOLEAN DEFAULT FALSE,
      attempts INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      verified_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(500) NOT NULL,
      is_revoked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      personal_identity JSONB DEFAULT '{}',
      contact_information JSONB DEFAULT '{}',
      education JSONB DEFAULT '[]',
      work_experience JSONB DEFAULT '[]',
      business_details JSONB DEFAULT '{}',
      products_services JSONB DEFAULT '[]',
      social_links JSONB DEFAULT '{}',
      digital_card JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      custom_slug VARCHAR(50) UNIQUE,
      short_code VARCHAR(8) UNIQUE NOT NULL,
      is_password_protected BOOLEAN DEFAULT FALSE,
      share_password VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      expiry_date TIMESTAMP,
      requires_qr_scan BOOLEAN DEFAULT FALSE,
      allowed_domains JSONB DEFAULT '[]',
      view_count INT DEFAULT 0,
      unique_visitors INT DEFAULT 0,
      last_viewed TIMESTAMP,
      share_method VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS share_link_analytics (
      id SERIAL PRIMARY KEY,
      share_link_id INT NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
      visitor_ip VARCHAR(50),
      visitor_user_agent VARCHAR(500),
      referrer_source VARCHAR(255),
      device_type VARCHAR(50),
      platform VARCHAR(50),
      viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100),
      email VARCHAR(255),
      phone VARCHAR(20),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id VARCHAR(50) NOT NULL DEFAULT 'free',
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      billing_cycle VARCHAR(20) DEFAULT 'monthly',
      provider VARCHAR(30),
      provider_ref VARCHAR(255),
      amount INT DEFAULT 0,
      currency VARCHAR(10) DEFAULT 'INR',
      current_period_end TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_active_idx
      ON subscriptions(user_id) WHERE status = 'active';
  `;

  try {
    // First, create all tables
    await pool.query(query);
    console.log('Tables created or already exist');
    
    // Then, run migration to add missing columns if they don't exist
    try {
      const columnsToAdd = [
        { name: 'username', type: 'VARCHAR(100) UNIQUE' },
        { name: 'fcm_token', type: 'VARCHAR(255)' },
        { name: 'role', type: "VARCHAR(20) DEFAULT 'user'" },
        { name: 'public_profile_enabled', type: 'BOOLEAN DEFAULT FALSE' },
        { name: 'profile_bio', type: 'VARCHAR(500)' },
        { name: 'profile_header_image', type: 'VARCHAR(500)' },
        { name: 'last_login', type: 'TIMESTAMP' },
        { name: 'auth_provider', type: "VARCHAR(50) DEFAULT 'email'" },
        { name: 'google_id', type: 'VARCHAR(255) UNIQUE' },
        { name: 'apple_id', type: 'VARCHAR(255) UNIQUE' },
        { name: 'device_id', type: 'VARCHAR(255)' },
        { name: 'is_blocked', type: 'BOOLEAN DEFAULT FALSE' },
        { name: 'moderation_status', type: "VARCHAR(20) DEFAULT 'approved'" },
        { name: 'referral_code', type: 'VARCHAR(20) UNIQUE' }
      ];

      for (const col of columnsToAdd) {
        const checkColumn = `
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = '${col.name}'
          );
        `;
        const result = await pool.query(checkColumn);
        const columnExists = result.rows[0].exists;
        
        if (!columnExists) {
          console.log(`Adding ${col.name} column to users table...`);
          await pool.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type};`);
          console.log(`${col.name} column added successfully`);
        }
      }
      
      // Create indexes
      await pool.query('CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_apple_id ON users(apple_id);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_share_links_user_id ON share_links(user_id);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_share_links_slug ON share_links(custom_slug);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_share_links_short_code ON share_links(short_code);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_analytics_share_link_id ON share_link_analytics(share_link_id);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);');
      
      console.log('Migrations and indexes applied successfully');
    } catch (migrationErr) {
      console.error('Error during migration:', migrationErr.message);
    }
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

const User = {
  // Create a new user with full registration details
  create: async (email, hashedPassword, name = '', phone = '', fcmToken = '', username = '', referralCode = '', role = 'user') => {
    const query = `
      INSERT INTO users (email, password, first_name, phone_number, fcm_token, username, referral_code, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, username, first_name, phone_number, is_email_verified, is_profile_complete, created_at, role, is_blocked, referral_code
    `;
    try {
      const result = await pool.query(query, [email, hashedPassword, name, phone, fcmToken, username, referralCode, role]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find user by email
  findByEmail: async (email) => {
    const query = `
      SELECT id, email, username, password, is_email_verified, is_profile_complete, 
             first_name, last_name, phone_number, google_id, apple_id, auth_provider,
             fcm_token, device_id, role, is_blocked, moderation_status, referral_code
      FROM users
      WHERE email = $1
    `;
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find user by username
  findByUsername: async (username) => {
    const query = `
      SELECT id, email, username, is_email_verified, is_profile_complete, first_name, role, is_blocked, moderation_status, referral_code
      FROM users
      WHERE username = $1
    `;
    try {
      const result = await pool.query(query, [username]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find user by phone number
  findByPhone: async (phone) => {
    const query = `
      SELECT id, email, phone_number
      FROM users
      WHERE phone_number = $1
    `;
    try {
      const result = await pool.query(query, [phone]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find user by ID
  findById: async (userId) => {
    const query = `
      SELECT id, email, username, first_name, last_name, phone_number, date_of_birth,
             gender, profile_picture, profile_bio, public_profile_enabled,
             is_email_verified, is_profile_complete,
             last_login, created_at, updated_at, role, is_blocked, moderation_status, referral_code
      FROM users
      WHERE id = $1
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update user profile (Legacy/Simple)
  updateProfile: async (userId, profileData) => {
    const { firstName, lastName, phoneNumber, dateOfBirth, gender } = profileData;
    const query = `
      UPDATE users
      SET first_name = $1, last_name = $2, phone_number = $3, 
          date_of_birth = $4, gender = $5, is_profile_complete = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, email, first_name, last_name, phone_number, date_of_birth, gender, is_profile_complete
    `;
    try {
      const result = await pool.query(query, [
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        gender,
        userId,
      ]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Full Profile Management
  createOrUpdateProfile: async (userId, profileData) => {
    const {
      personalIdentity,
      contactInformation,
      education,
      workExperience,
      businessDetails,
      productsServices,
      socialLinks,
      digitalCard,
    } = profileData;

    const query = `
      INSERT INTO user_profiles (
        user_id, personal_identity, contact_information, education, 
        work_experience, business_details, products_services, social_links, digital_card
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id) DO UPDATE SET
        personal_identity = EXCLUDED.personal_identity,
        contact_information = EXCLUDED.contact_information,
        education = EXCLUDED.education,
        work_experience = EXCLUDED.work_experience,
        business_details = EXCLUDED.business_details,
        products_services = EXCLUDED.products_services,
        social_links = EXCLUDED.social_links,
        digital_card = EXCLUDED.digital_card,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    try {
      // Begin transaction
      await pool.query('BEGIN');

      const result = await pool.query(query, [
        userId,
        JSON.stringify(personalIdentity || {}),
        JSON.stringify(contactInformation || {}),
        JSON.stringify(education || []),
        JSON.stringify(workExperience || []),
        JSON.stringify(businessDetails || {}),
        JSON.stringify(productsServices || []),
        JSON.stringify(socialLinks || {}),
        JSON.stringify(digitalCard || {}),
      ]);

      // Update users table to mark profile as complete
      await pool.query(
        'UPDATE users SET is_profile_complete = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );

      await pool.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  },

  // Get full profile
  getProfile: async (userId) => {
    const query = `
      SELECT p.*, u.email, u.first_name, u.last_name, u.phone_number, 
             u.profile_picture, u.public_profile_enabled,
             u.is_email_verified, u.is_profile_complete
      FROM user_profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Verify email
  verifyEmail: async (userId) => {
    const query = `
      UPDATE users
      SET is_email_verified = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, is_email_verified
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update password
  updatePassword: async (userId, newHashedPassword) => {
    const query = `
      UPDATE users
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email
    `;
    try {
      const result = await pool.query(query, [newHashedPassword, userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update last login
  updateLastLogin: async (userId) => {
    const query = `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    try {
      await pool.query(query, [userId]);
    } catch (err) {
      throw err;
    }
  },

  // Update FCM token
  updateFcmToken: async (userId, fcmToken) => {
    const query = `
      UPDATE users
      SET fcm_token = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, fcm_token
    `;
    try {
      const result = await pool.query(query, [fcmToken, userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find user by Google ID
  findByGoogleId: async (googleId) => {
    const query = `
      SELECT id, email, first_name, last_name, phone_number, google_id, apple_id, 
             auth_provider, is_email_verified, is_profile_complete, device_id, role, 
             is_blocked, moderation_status, referral_code
      FROM users
      WHERE google_id = $1
    `;
    try {
      const result = await pool.query(query, [googleId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Find user by Apple ID
  findByAppleId: async (appleId) => {
    const query = `
      SELECT id, email, first_name, last_name, phone_number, google_id, apple_id,
             auth_provider, is_email_verified, is_profile_complete, device_id, role,
             is_blocked, moderation_status, referral_code
      FROM users
      WHERE apple_id = $1
    `;
    try {
      const result = await pool.query(query, [appleId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Create user via social auth
  createSocialUser: async (email, authType, socialId, name = '', phone = '', deviceId = '', referralCode = '', role = 'user') => {
    const socialIdField = authType === 'google' ? 'google_id' : 'apple_id';
    const randomPassword = require('crypto').randomBytes(32).toString('hex');
    
    const query = `
      INSERT INTO users (email, password, first_name, phone_number, 
                         auth_provider, ${socialIdField}, device_id, referral_code, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, email, first_name, last_name, phone_number, is_email_verified, 
                is_profile_complete, auth_provider, device_id, created_at, role, is_blocked, referral_code
    `;
    try {
      const result = await pool.query(query, [email, randomPassword, name, phone, authType, socialId, deviceId, referralCode, role]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update user social ID
  updateSocialId: async (userId, authType, socialId) => {
    const socialIdField = authType === 'google' ? 'google_id' : 'apple_id';
    const query = `
      UPDATE users
      SET ${socialIdField} = $1, auth_provider = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, email, first_name, auth_provider, google_id, apple_id
    `;
    try {
      const result = await pool.query(query, [socialId, authType, userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update user device info
  updateDeviceInfo: async (userId, deviceId) => {
    const query = `
      UPDATE users
      SET device_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, device_id
    `;
    try {
      const result = await pool.query(query, [deviceId, userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update profile visibility (make public/private)
  updateProfileVisibility: async (userId, isPublic) => {
    const query = `
      UPDATE users
      SET public_profile_enabled = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, first_name, last_name, public_profile_enabled, is_profile_complete
    `;
    try {
      const result = await pool.query(query, [isPublic, userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Get user with profile visibility status
  getProfileWithVisibility: async (userId) => {
    const query = `
      SELECT id, email, first_name, last_name, phone_number, profile_picture, 
             profile_bio, public_profile_enabled, is_profile_complete, is_email_verified,
             created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Update profile picture URL
  updateProfilePicture: async (userId, imageUrl) => {
    const query = `
      UPDATE users
      SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, profile_picture
    `;
    try {
      const result = await pool.query(query, [imageUrl, userId]);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Get total user count
  getCount: async () => {
    const query = 'SELECT COUNT(*) FROM users;';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  },

  // Get users registered today
  getTodayCount: async () => {
    const query = 'SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE;';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  },

  // Get count of users with complete profiles
  getProfileCompleteCount: async () => {
    const query = 'SELECT COUNT(*) FROM users WHERE is_profile_complete = TRUE;';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  },

  // Get count of users with public profiles enabled
  getPublicProfileCount: async () => {
    const query = 'SELECT COUNT(*) FROM users WHERE public_profile_enabled = TRUE;';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  },

  // Get all users for admin
  findAll: async () => {
    const query = `
      SELECT id, email, username, first_name, last_name, role, is_profile_complete, 
             public_profile_enabled, is_blocked, moderation_status, referral_code, 
             created_at, last_login 
      FROM users 
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Block/Unblock user
  updateBlockStatus: async (userId, isBlocked) => {
    const query = `
      UPDATE users 
      SET is_blocked = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, email, is_blocked;
    `;
    const result = await pool.query(query, [isBlocked, userId]);
    return result.rows[0];
  },

  // Update moderation status
  updateModerationStatus: async (userId, status) => {
    const query = `
      UPDATE users 
      SET moderation_status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, email, moderation_status;
    `;
    const result = await pool.query(query, [status, userId]);
    return result.rows[0];
  },

  // Find by referral code
  findByReferralCode: async (code) => {
    const query = 'SELECT id, email, first_name FROM users WHERE referral_code = $1;';
    const result = await pool.query(query, [code]);
    return result.rows[0];
  },
};

module.exports = { User, createUserTable };


// Email templates for OTP and notifications

const emailTemplates = {
  emailVerification: (otp, userName = 'User') => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .otp-box { background-color: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .otp-label { color: #666; font-size: 14px; margin-bottom: 10px; }
          .expiry-note { color: #e74c3c; font-size: 13px; margin-top: 15px; font-weight: 500; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; }
          .footer p { margin: 5px 0; color: #666; font-size: 12px; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600; }
          .message { color: #333; font-size: 15px; line-height: 1.6; }
          .security-note { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; font-size: 13px; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Email Verification</h1>
          </div>
          <div class="content">
            <p class="message">Hi ${userName},</p>
            <p class="message">Welcome to <strong>ClickCard</strong>! 🎉</p>
            <p class="message">Thank you for signing up. To complete your registration and verify your email address, please use the One-Time Password (OTP) below:</p>
            
            <div class="otp-box">
              <div class="otp-label">Your Verification Code:</div>
              <div class="otp-code">${otp}</div>
              <div class="expiry-note">⏱️ Valid for 10 minutes only</div>
            </div>

            <p class="message">Enter this code in the verification field on the signup page to complete your registration.</p>

            <div class="security-note">
              <strong>🔒 Security Tip:</strong> Never share this OTP with anyone. ClickCard support will never ask for your OTP.
            </div>

            <p class="message">If you didn't sign up for ClickCard, please ignore this email.</p>

            <p class="message">Need help? Visit our <a href="#" style="color: #667eea; text-decoration: none;">Help Center</a></p>
          </div>
          <div class="footer">
            <p><strong>ClickCard Inc.</strong></p>
            <p>© 2026 ClickCard. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
    `;
  },

  passwordReset: (otp, userName = 'User') => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .otp-box { background-color: #f8f9fa; border: 2px solid #f5576c; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #f5576c; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .otp-label { color: #666; font-size: 14px; margin-bottom: 10px; }
          .expiry-note { color: #e74c3c; font-size: 13px; margin-top: 15px; font-weight: 500; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; }
          .footer p { margin: 5px 0; color: #666; font-size: 12px; }
          .message { color: #333; font-size: 15px; line-height: 1.6; }
          .warning-box { background-color: #ffebee; border-left: 4px solid #f5576c; padding: 12px; margin: 20px 0; font-size: 13px; color: #c62828; }
          .security-note { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; font-size: 13px; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p class="message">Hi ${userName},</p>
            <p class="message">We received a request to reset the password associated with your ClickCard account. If this was you, use the One-Time Password (OTP) below to proceed:</p>
            
            <div class="otp-box">
              <div class="otp-label">Your Reset Code:</div>
              <div class="otp-code">${otp}</div>
              <div class="expiry-note">⏱️ Valid for 10 minutes only</div>
            </div>

            <p class="message">Enter this code to create a new password for your account.</p>

            <div class="warning-box">
              <strong>⚠️ If this wasn't you:</strong> Your account may have been compromised. Please contact our support team immediately at support@clickcard.com
            </div>

            <div class="security-note">
              <strong>🔒 Security Tip:</strong> Never share your OTP or password with anyone. Our team will never ask for them.
            </div>

            <p class="message">For your security, this link will expire in 10 minutes.</p>
          </div>
          <div class="footer">
            <p><strong>ClickCard Inc.</strong></p>
            <p>© 2026 ClickCard. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
    `;
  },

  loginOTP: (otp, userName = 'User') => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%); color: #ffffff; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .otp-box { background-color: #f8f9fa; border: 2px solid #0072ff; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #0072ff; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .otp-label { color: #666; font-size: 14px; margin-bottom: 10px; }
          .expiry-note { color: #e74c3c; font-size: 13px; margin-top: 15px; font-weight: 500; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; }
          .footer p { margin: 5px 0; color: #666; font-size: 12px; }
          .message { color: #333; font-size: 15px; line-height: 1.6; }
          .security-note { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; font-size: 13px; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔓 Login Verification</h1>
          </div>
          <div class="content">
            <p class="message">Hi ${userName},</p>
            <p class="message">Use the One-Time Password (OTP) below to securely log in to your ClickCard account:</p>
            
            <div class="otp-box">
              <div class="otp-label">Your Login Code:</div>
              <div class="otp-code">${otp}</div>
              <div class="expiry-note">⏱️ Valid for 10 minutes only</div>
            </div>
 
            <p class="message">Enter this code on the login page to access your account. For your security, this code should not be shared with anyone.</p>
 
            <div class="security-note">
              <strong>🔒 Security Tip:</strong> If you didn't request this code, your account might be being accessed by someone else. Please change your password or contact support.
            </div>
 
            <p class="message">Happy connecting!<br>The ClickCard Team</p>
          </div>
          <div class="footer">
            <p><strong>ClickCard Inc.</strong></p>
            <p>© 2026 ClickCard. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;
  },

  welcomeEmail: (userName = 'User', email) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .features { margin: 30px 0; }
          .feature { display: flex; margin: 15px 0; }
          .feature-icon { font-size: 24px; margin-right: 15px; }
          .feature-text { flex: 1; }
          .feature-text h3 { margin: 0 0 5px 0; color: #333; font-size: 16px; }
          .feature-text p { margin: 0; color: #666; font-size: 14px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; }
          .footer p { margin: 5px 0; color: #666; font-size: 12px; }
          .message { color: #333; font-size: 15px; line-height: 1.6; }
          .cta-button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ClickCard!</h1>
          </div>
          <div class="content">
            <p class="message">Hi ${userName},</p>
            <p class="message">Your account has been successfully created and verified! Welcome to the ClickCard family. 🚀</p>

            <h3 style="color: #333; margin-top: 30px;">What You Can Do Now:</h3>
            <div class="features">
              <div class="feature">
                <div class="feature-icon">👤</div>
                <div class="feature-text">
                  <h3>Complete Your Profile</h3>
                  <p>Add your personal information to unlock all features</p>
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">🔐</div>
                <div class="feature-text">
                  <h3>Secure Account</h3>
                  <p>Your account is protected with industry-standard encryption</p>
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">🆘</div>
                <div class="feature-text">
                  <h3>24/7 Support</h3>
                  <p>Our support team is always here to help you</p>
                </div>
              </div>
            </div>

            <p class="message">If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
            <p class="message"><strong>Account Email:</strong> ${email}</p>
          </div>
          <div class="footer">
            <p><strong>ClickCard Inc.</strong></p>
            <p>© 2026 ClickCard. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
    `;
  },
};

module.exports = emailTemplates;

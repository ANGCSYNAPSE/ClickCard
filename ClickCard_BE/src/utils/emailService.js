const nodemailer = require('nodemailer');
const emailTemplates = require('./emailTemplates');
require('dotenv').config();

/**
 * Email service with a dev-mode fallback.
 *
 * When EMAIL_USER / EMAIL_PASSWORD are configured we send a real email via
 * Gmail. When they are NOT configured (e.g. fresh Vercel deploy with no SMTP
 * set up yet) we log the OTP to the server console and return success — that
 * way the registration / login OTP flows still work end-to-end while the
 * SMTP credentials get wired up. Read the OTP from the BE Runtime Logs.
 *
 * To force fallback even when creds exist, set EMAIL_DEV_MODE=true.
 */

const hasCreds = () =>
  !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
const isDevMode = () =>
  process.env.EMAIL_DEV_MODE === 'true' || !hasCreds();

let _transporter = null;
function getTransporter() {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  return _transporter;
}

function logOtpFallback(email, otp, purpose) {
  // Banner is intentionally easy to grep for in Vercel Runtime Logs.
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 OTP (dev fallback — no SMTP configured)`);
  console.log(`   To:      ${email}`);
  console.log(`   Purpose: ${purpose}`);
  console.log(`   CODE:    ${otp}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

const sendOTPEmail = async (email, otp, purpose, userName = 'User') => {
  if (isDevMode()) {
    logOtpFallback(email, otp, purpose);
    return {
      success: true,
      message: 'OTP issued (logged to server console — SMTP not configured)',
      devMode: true,
    };
  }

  let subject;
  let htmlContent;
  if (purpose === 'email_verification') {
    subject = '✉️ Verify Your Email - ClickCard';
    htmlContent = emailTemplates.emailVerification(otp, userName);
  } else if (purpose === 'password_reset') {
    subject = '🔐 Reset Your Password - ClickCard';
    htmlContent = emailTemplates.passwordReset(otp, userName);
  } else if (purpose === 'login') {
    subject = '🔓 Login Verification - ClickCard';
    htmlContent = emailTemplates.loginOTP(otp, userName);
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.response);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    // Still log the OTP so the user isn't locked out — better DX than a hard
    // failure that requires a redeploy to recover.
    logOtpFallback(email, otp, purpose);
    return {
      success: true,
      message: 'OTP issued (SMTP send failed — code logged to server console)',
      devMode: true,
      smtpError: error.message,
    };
  }
};

const sendWelcomeEmail = async (email, userName = 'User') => {
  if (isDevMode()) {
    console.log(`📧 Welcome email skipped (dev mode) → ${email}`);
    return { success: true, message: 'Welcome email skipped (SMTP not configured)', devMode: true };
  }

  const subject = '🎉 Welcome to ClickCard!';
  const htmlContent = emailTemplates.welcomeEmail(userName, email);

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.response);
    return { success: true, message: 'Welcome email sent successfully' };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    // Non-blocking — registration shouldn't fail because we couldn't send a
    // welcome email.
    return { success: true, message: 'Welcome email skipped (SMTP error)', smtpError: error.message };
  }
};

module.exports = { sendOTPEmail, sendWelcomeEmail };

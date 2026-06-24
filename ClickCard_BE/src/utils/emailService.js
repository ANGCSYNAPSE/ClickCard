const nodemailer = require('nodemailer');
const emailTemplates = require('./emailTemplates');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function logOtpFallback(email, otp, purpose) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 OTP (dev fallback — SMTP not configured)`);
  console.log(`   To:      ${email}`);
  console.log(`   Purpose: ${purpose}`);
  console.log(`   CODE:    ${otp}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

const sendOTPEmail = async (email, otp, purpose, userName = 'User') => {
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

  try {
    await transporter.sendMail({
      from: `ClickCard <${process.env.EMAIL_USER}>`,
      replyTo: process.env.EMAIL_USER,
      to: email,
      subject,
      html: htmlContent,
    });
    console.log('✅ Email sent successfully via SMTP');
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    logOtpFallback(email, otp, purpose);
    return {
      success: true,
      message: 'OTP issued (SMTP failed — code logged to server console)',
      devMode: true,
      smtpError: error.message,
    };
  }
};

const sendWelcomeEmail = async (email, userName = 'User') => {
  try {
    await transporter.sendMail({
      from: `ClickCard <${process.env.EMAIL_USER}>`,
      replyTo: process.env.EMAIL_USER,
      to: email,
      subject: '🎉 Welcome to ClickCard!',
      html: emailTemplates.welcomeEmail(userName, email),
    });
    console.log('✅ Welcome email sent via SMTP');
    return { success: true, message: 'Welcome email sent successfully' };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return { success: true, message: 'Welcome email skipped (SMTP error)', smtpError: error.message };
  }
};

module.exports = { sendOTPEmail, sendWelcomeEmail };

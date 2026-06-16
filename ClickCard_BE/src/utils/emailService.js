const nodemailer = require('nodemailer');
const emailTemplates = require('./emailTemplates');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp, purpose, userName = 'User') => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials not configured in .env');
    return { success: false, message: 'Email service not configured', error: 'Missing EMAIL_USER or EMAIL_PASSWORD' };
  }

  let subject, htmlContent;

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
    subject: subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.response);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return { success: false, message: 'Failed to send OTP email', error: error.message };
  }
};

const sendWelcomeEmail = async (email, userName = 'User') => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials not configured in .env');
    return { success: false, message: 'Email service not configured', error: 'Missing EMAIL_USER or EMAIL_PASSWORD' };
  }

  const subject = '🎉 Welcome to ClickCard!';
  const htmlContent = emailTemplates.welcomeEmail(userName, email);

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.response);
    return { success: true, message: 'Welcome email sent successfully' };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return { success: false, message: 'Failed to send welcome email', error: error.message };
  }
};

module.exports = { sendOTPEmail, sendWelcomeEmail };

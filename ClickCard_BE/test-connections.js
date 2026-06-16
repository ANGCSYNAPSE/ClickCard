require('dotenv').config();
const nodemailer = require('nodemailer');
const pool = require('./src/config/database');

console.log('🔍 Testing Connections...\n');

// Test Email Configuration
console.log('📧 EMAIL CONFIGURATION:');
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET'}`);
console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
console.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
console.log(`SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}\n`);

// Test Email Connection
const testEmailConnection = async () => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    console.log('🧪 Testing Email Connection...');
    const verified = await transporter.verify();
    if (verified) {
      console.log('✅ Email connection SUCCESSFUL\n');
    } else {
      console.log('❌ Email connection FAILED - Credentials invalid\n');
    }
  } catch (error) {
    console.log(`❌ Email Error: ${error.message}\n`);
  }
};

// Test Database Connection
const testDatabaseConnection = async () => {
  try {
    console.log('🗄️  DATABASE CONFIGURATION:');
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET'}\n`);
    
    console.log('🧪 Testing Database Connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection SUCCESSFUL');
    console.log(`Connected at: ${result.rows[0].now}\n`);
  } catch (error) {
    console.log(`❌ Database Error: ${error.message}\n`);
  }
};

const runTests = async () => {
  await testEmailConnection();
  await testDatabaseConnection();
  process.exit(0);
};

runTests();

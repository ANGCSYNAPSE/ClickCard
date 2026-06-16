# ClickCard Backend API

A complete Node.js/Express backend with authentication APIs using Neon PostgreSQL database.

## Project Structure

```
src/
├── config/          # Configuration files (database.js)
├── controllers/     # API endpoint handlers
├── middleware/      # Authentication and custom middleware
├── models/          # Database models and queries
├── routes/          # API routes
├── services/        # Business logic and services
├── utils/           # Utility functions (JWT, validators, etc.)
├── app.js          # Express app setup
└── index.js        # Entry point
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Neon PostgreSQL database account

## Installation

1. **Clone or navigate to the project directory:**
```bash
cd ClickCard_Backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
   - Copy `.env` file content and update with your credentials:
   - `DATABASE_URL`: Your Neon database connection string
   - `JWT_SECRET`: Your JWT secret key
   - `EMAIL_USER`: Your Gmail address for OTP sending
   - `EMAIL_PASSWORD`: Your Gmail app password (not regular password)
   - `FRONTEND_URL`: Your frontend URL

## Environment Variables

```env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRE=30d

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@clickcard.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# OTP Configuration
OTP_EXPIRY=10
OTP_LENGTH=6

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Running the Project

### Development Mode (with Nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication Endpoints

#### 1. Register User
- **POST** `/api/users/register`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

#### 2. Resend Email OTP
- **POST** `/api/users/resend-email-otp`
- **Body:**
```json
{
  "email": "user@example.com"
}
```

#### 3. Verify Email OTP
- **POST** `/api/users/verify-email-otp`
- **Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### 4. Login User
- **POST** `/api/users/login/user`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```
- **Response:** Returns `accessToken` and `refreshToken`

#### 5. Complete Profile
- **POST** `/api/users/profile/complete`
- **Headers:** `Authorization: Bearer {accessToken}`
- **Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "phoneNumber": "+1234567890"
}
```

#### 6. Get Current User
- **GET** `/api/users/current`
- **Headers:** `Authorization: Bearer {accessToken}`

#### 7. Refresh Access Token
- **POST** `/api/users/refresh-token`
- **Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

#### 8. Logout User
- **POST** `/api/users/logout`
- **Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

#### 9. Request Password Reset OTP
- **POST** `/api/users/forgot-password/request-otp`
- **Body:**
```json
{
  "email": "user@example.com"
}
```

#### 10. Verify Password Reset OTP
- **POST** `/api/users/forgot-password/verify-otp`
- **Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### 11. Reset Password
- **POST** `/api/users/forgot-password/reset`
- **Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

#### 12. Change Password (Authenticated)
- **POST** `/api/users/change-password`
- **Headers:** `Authorization: Bearer {accessToken}`
- **Body:**
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## OTP Configuration

- **Expiry Time:** 10 minutes (configurable via `OTP_EXPIRY`)
- **Max Attempts:** 3 attempts before requiring a new OTP
- **Length:** 6 digits

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:
- **Access Token:** Valid for 7 days
- **Refresh Token:** Valid for 30 days

Include the access token in the Authorization header:
```
Authorization: Bearer {accessToken}
```

## Database Schema

### Users Table
- `id`: Primary Key
- `email`: Unique email address
- `password`: Hashed password
- `first_name`, `last_name`: User name
- `phone_number`: Contact number
- `date_of_birth`: DOB
- `gender`: Gender
- `profile_picture`: Profile image URL
- `is_email_verified`: Email verification status
- `is_profile_complete`: Profile completion status
- `last_login`: Last login timestamp
- `created_at`, `updated_at`: Timestamps

### Email OTPs Table
- `id`: Primary Key
- `email`: Email address
- `otp_code`: 6-digit OTP
- `purpose`: 'email_verification' or 'password_reset'
- `is_verified`: Verification status
- `attempts`: Number of attempts
- `expires_at`: OTP expiry timestamp

### Refresh Tokens Table
- `id`: Primary Key
- `user_id`: References users table
- `token`: Token string
- `is_revoked`: Revocation status
- `expires_at`: Token expiry timestamp

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (only in development)"
}
```

## Success Responses

All success responses follow this format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## Setting Up Gmail for Email OTP

1. Enable 2-step verification in your Google Account
2. Generate an "App Password" for Gmail
3. Use the app password as `EMAIL_PASSWORD` in `.env`
4. Set `EMAIL_USER` to your Gmail address

## Features

✅ User Registration with email verification
✅ JWT-based Authentication
✅ Email OTP Verification
✅ Password Reset with OTP
✅ Change Password (Authenticated)
✅ Profile Completion
✅ Token Refresh
✅ User Logout
✅ Input Validation
✅ Password Hashing with Bcrypt
✅ Rate limiting ready
✅ CORS enabled
✅ Error handling middleware

## Development Notes

- The API automatically creates database tables on startup
- All timestamps are in UTC
- Email sending uses Nodemailer with Gmail
- Passwords are hashed with bcrypt (10 salt rounds)

## Support

For issues or questions, please contact the development team.

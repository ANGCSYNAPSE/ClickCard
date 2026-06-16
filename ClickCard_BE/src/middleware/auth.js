const { verifyAccessToken } = require('../utils/jwtUtils');
const { sendErrorResponse } = require('../utils/responseHandler');
const { User } = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return sendErrorResponse(res, 401, 'Access token required');
  }

  const verification = verifyAccessToken(token);
  if (!verification.valid) {
    return sendErrorResponse(res, 401, 'Invalid or expired access token');
  }

  try {
    const user = await User.findById(verification.decoded.userId);
    if (!user || user.is_blocked) {
      return sendErrorResponse(res, 403, user?.is_blocked ? 'Your account has been blocked. Please contact support.' : 'User not found');
    }

    req.user = verification.decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return sendErrorResponse(res, 500, 'Internal server error during authentication');
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendErrorResponse(res, 403, 'Admin access required');
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
};

/**
 * Tracking Middleware
 * Extracts visitor information for analytics
 */

const trackingMiddleware = (req, res, next) => {
  try {
    // Extract visitor information
    req.visitingData = {
      userAgent: req.get('user-agent') || '',
      clientIP: req.ip || req.connection.remoteAddress || 'unknown',
      referrer: req.get('referer') || 'direct',
      timestamp: new Date(),
    };

    next();
  } catch (err) {
    console.error('Error in tracking middleware:', err);
    next();
  }
};

module.exports = trackingMiddleware;

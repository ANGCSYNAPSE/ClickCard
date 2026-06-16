const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { createUserTable } = require('./models/User');
const { createNotificationTable } = require('./models/Notification');
const { createAnalyticsEventTable } = require('./models/AnalyticsEvent');
const { createStudioTemplateTable } = require('./models/StudioTemplate');
const { createPlanTable } = require('./models/Plan');
const userRoutes = require('./routes/userRoutes');
const shareLinkRoutes = require('./routes/shareLinkRoutes');
const publicRoutes = require('./routes/publicRoutes');
const socialRoutes = require('./routes/socialRoutes');
const adminRoutes = require('./routes/adminRoutes');
const referralRoutes = require('./routes/referralRoutes');
const billingRoutes = require('./routes/billingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const studioRoutes = require('./routes/studioRoutes');
const trackingMiddleware = require('./middleware/trackingMiddleware');
const swaggerSpec = require('./config/swagger');

const app = express();

// Middleware
app.use(cors());
// Capture raw body for webhook signature verification (Razorpay etc.).
app.use(bodyParser.json({
  verify: (req, _res, buf) => { req.rawBody = buf.toString('utf8'); },
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(trackingMiddleware);

// Swagger documentation
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { 
  swaggerOptions: {
    persistAuthorization: true,
  }
}));

// Initialize database tables
createUserTable()
  .then(() => createNotificationTable())
  .then(() => createAnalyticsEventTable())
  .then(() => createStudioTemplateTable())
  .then(() => createPlanTable())
  .catch((err) => console.error('Failed to create tables:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', socialRoutes);
app.use('/api/share', shareLinkRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/studio', studioRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ClickCard API is running' });
});

// API docs redirect
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;

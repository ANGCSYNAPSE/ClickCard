const Lead = require('../models/Lead');
const { User } = require('../models/User');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');
const socket = require('../utils/socket');
const { validateEmail } = require('../utils/validator');

class LeadController {
  // Public endpoint for submitting a lead via TapOne profile
  static async captureLead(req, res) {
    try {
      const { identifier } = req.params;
      const { name, email, phone, message } = req.body;

      // Validate inputs
      if (!name || !email) {
        return sendErrorResponse(res, 400, 'Name and email are required');
      }

      if (!validateEmail(email)) {
        return sendErrorResponse(res, 400, 'Invalid email format');
      }

      // Find user by identifier (can be username or id)
      let user = await User.findByUsername(identifier);
      if (!user && !isNaN(identifier)) {
        user = await User.findById(parseInt(identifier));
      }

      if (!user) {
        return sendErrorResponse(res, 404, 'Profile not found');
      }

      // Save lead
      const lead = await Lead.create(user.id, { name, email, phone, message });

      // Trigger real-time notification
      socket.sendNotification(user.id, 'new_lead', {
        title: 'New Connection Request',
        body: `${name} has just shared their contact details with you!`,
        lead: lead
      });

      // You could also trigger an email notification here using emailService if required

      return sendSuccessResponse(res, 201, 'Contact details submitted successfully');
    } catch (err) {
      console.error('Lead capture error:', err);
      return sendErrorResponse(res, 500, 'Failed to submit contact details');
    }
  }

  // Authenticated endpoint for a user to view their leads
  static async getUserLeads(req, res) {
    try {
      const userId = req.user.userId;
      const leads = await Lead.findByUserId(userId);
      
      return sendSuccessResponse(res, 200, 'Leads retrieved successfully', leads);
    } catch (err) {
      console.error('Get user leads error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve leads');
    }
  }
}

module.exports = LeadController;

const AdminService = require('../services/AdminService');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');

class AdminController {
  static async getDashboardStats(req, res) {
    try {
      const stats = await AdminService.getDashboardStats();
      return sendSuccessResponse(res, 200, 'Dashboard stats retrieved successfully', stats);
    } catch (err) {
      console.error('Admin Dashboard Stats Error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve dashboard stats');
    }
  }

  static async getUsers(req, res) {
    try {
      const users = await AdminService.getAllUsers();
      return sendSuccessResponse(res, 200, 'Users retrieved successfully', users);
    } catch (err) {
      console.error('Admin Get Users Error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve users');
    }
  }

  static async getRevenue(req, res) {
    try {
      const data = await AdminService.getRevenueStats();
      return sendSuccessResponse(res, 200, 'Revenue stats retrieved successfully', data);
    } catch (err) {
      console.error('Admin Revenue Stats Error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve revenue stats');
    }
  }

  static async getLeads(req, res) {
    try {
      const leads = await AdminService.getAllLeads();
      return sendSuccessResponse(res, 200, 'Leads retrieved successfully', leads);
    } catch (err) {
      console.error('Admin Get Leads Error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve leads');
    }
  }

  static async getUserDetails(req, res) {
    try {
      const { id } = req.params;
      const user = await AdminService.getUserDetails(id);
      if (!user) return sendErrorResponse(res, 404, 'User not found');
      return sendSuccessResponse(res, 200, 'User details retrieved successfully', user);
    } catch (err) {
      console.error('Admin Get User Details Error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve user details');
    }
  }

  static async blockUser(req, res) {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;
      const result = await AdminService.updateUserBlockStatus(id, isBlocked);
      return sendSuccessResponse(res, 200, `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`, result);
    } catch (err) {
      console.error('Admin Block User Error:', err);
      return sendErrorResponse(res, 500, 'Failed to update block status');
    }
  }

  static async moderateUser(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // approved, rejected, pending
      const result = await AdminService.updateUserModerationStatus(id, status);
      return sendSuccessResponse(res, 200, `User content ${status} successfully`, result);
    } catch (err) {
      console.error('Admin Moderation Error:', err);
      return sendErrorResponse(res, 500, 'Failed to update moderation status');
    }
  }

  static async getSettings(req, res) {
    try {
      const settings = await AdminService.getSystemSettings();
      return sendSuccessResponse(res, 200, 'System settings retrieved successfully', settings);
    } catch (err) {
      console.error('Admin Get Settings Error:', err);
      return sendErrorResponse(res, 500, 'Failed to retrieve system settings');
    }
  }

  static async updateSetting(req, res) {
    try {
      const { key, value } = req.body;
      if (!key) return sendErrorResponse(res, 400, 'Setting key is required');
      const result = await AdminService.updateSystemSetting(key, value);
      return sendSuccessResponse(res, 200, 'System setting updated successfully', result);
    } catch (err) {
      console.error('Admin Update Setting Error:', err);
      return sendErrorResponse(res, 500, 'Failed to update system setting');
    }
  }
}

module.exports = AdminController;

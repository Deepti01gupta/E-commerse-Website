const ReturnRefundService = require('../services/returnRefund.service');
const OrderService = require('../services/order.service');

/**
 * Return Controller - Handles return request API endpoints
 */
class ReturnController {
  /**
   * POST /returns - Create return request
   */
  static async createReturnRequest(req, res) {
    try {
      const { orderId, reason, items, comments } = req.body;
      
      // Verify order exists and belongs to user
      const order = await OrderService.getOrderDetails(orderId);
      
      if (order.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      // Check eligibility
      const eligibility = ReturnRefundService.checkReturnEligibility(order);
      
      if (!eligibility.eligible) {
        return res.status(400).json({
          success: false,
          message: eligibility.reason
        });
      }
      
      const returnRequest = await ReturnRefundService.createReturnRequest({
        orderId: order._id,
        userId: req.user.id,
        reason,
        items,
        comments,
        returnAmount: order.pricing.total // For now, full refund on return
      });
      
      res.status(201).json({
        success: true,
        message: 'Return request created successfully',
        data: returnRequest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /returns - Get user's return requests
   */
  static async getUserReturns(req, res) {
    try {
      const { status } = req.query;
      
      const returns = await ReturnRefundService.getUserReturnRequests(req.user.id, {
        status
      });
      
      res.json({
        success: true,
        count: returns.length,
        data: returns
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /returns/:returnId - Get return details
   */
  static async getReturnDetails(req, res) {
    try {
      const Return = require('../models/Return');
      const returnRequest = await Return.findById(req.params.returnId)
        .populate('orderId');
      
      if (!returnRequest) {
        return res.status(404).json({
          success: false,
          message: 'Return not found'
        });
      }
      
      // Verify ownership
      if (returnRequest.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      res.json({
        success: true,
        data: returnRequest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PATCH /returns/:returnId/approve - Approve return (Admin)
   */
  static async approveReturn(req, res) {
    try {
      const { notes } = req.body;
      
      const returnRequest = await ReturnRefundService.approveReturn(
        req.params.returnId,
        req.user.id,
        notes
      );
      
      res.json({
        success: true,
        message: 'Return approved successfully',
        data: returnRequest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PATCH /returns/:returnId/reject - Reject return (Admin)
   */
  static async rejectReturn(req, res) {
    try {
      const { reason } = req.body;
      
      const returnRequest = await ReturnRefundService.rejectReturn(
        req.params.returnId,
        req.user.id,
        reason
      );
      
      res.json({
        success: true,
        message: 'Return rejected',
        data: returnRequest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PATCH /returns/:returnId/status - Update return status
   */
  static async updateReturnStatus(req, res) {
    try {
      const { status, message } = req.body;
      
      const returnRequest = await ReturnRefundService.updateReturnStatus(
        req.params.returnId,
        status,
        message,
        req.user.role === 'admin' ? req.user.id : null
      );
      
      res.json({
        success: true,
        message: 'Return status updated',
        data: returnRequest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /returns/:returnId/initiate-refund - Create refund for approved return
   */
  static async initiateRefund(req, res) {
    try {
      const refund = await ReturnRefundService.createRefund(
        req.params.returnId,
        'Product return approved'
      );
      
      res.status(201).json({
        success: true,
        message: 'Refund initiated',
        data: refund
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /returns/check-eligibility/:orderId - Check if order is eligible for return
   */
  static async checkReturnEligibility(req, res) {
    try {
      const order = await OrderService.getOrderDetails(req.params.orderId);
      
      // Verify order belongs to user
      if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      const eligibility = ReturnRefundService.checkReturnEligibility(order);
      
      res.json({
        success: true,
        eligibility: eligibility.eligible,
        details: eligibility
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ReturnController;

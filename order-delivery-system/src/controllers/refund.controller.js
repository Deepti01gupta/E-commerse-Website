const ReturnRefundService = require('../services/returnRefund.service');
const Refund = require('../models/Refund');
const Order = require('../models/Order');

/**
 * Refund Controller - Handles refund-related API requests
 */
class RefundController {
  /**
   * GET /refunds/:refundId - Get refund details
   */
  static async getRefundDetails(req, res) {
    try {
      const refund = await Refund.findById(req.params.refundId)
        .populate('orderId')
        .populate('returnId');
      
      if (!refund) {
        return res.status(404).json({
          success: false,
          message: 'Refund not found'
        });
      }
      
      // Verify ownership
      if (refund.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      res.json({
        success: true,
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
   * GET /refunds - Get user's refunds
   */
  static async getUserRefunds(req, res) {
    try {
      const { status } = req.query;
      
      const refunds = await ReturnRefundService.getUserRefunds(req.user.id, {
        status
      });
      
      res.json({
        success: true,
        count: refunds.length,
        data: refunds
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /refunds/order/:orderId - Get refunds for specific order
   */
  static async getOrderRefunds(req, res) {
    try {
      // Verify order exists and belongs to user
      const order = await Order.findById(req.params.orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      const refunds = await Refund.find({ orderId: req.params.orderId })
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        count: refunds.length,
        data: refunds
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PATCH /refunds/:refundId/process - Process refund (Admin)
   */
  static async processRefund(req, res) {
    try {
      const { transactionId } = req.body;
      
      const refund = await ReturnRefundService.processRefund(
        req.params.refundId,
        transactionId
      );
      
      res.json({
        success: true,
        message: 'Refund processed successfully',
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
   * PATCH /refunds/:refundId/complete - Mark refund as completed (Admin)
   */
  static async completeRefund(req, res) {
    try {
      const refund = await ReturnRefundService.completeRefund(req.params.refundId);
      
      res.json({
        success: true,
        message: 'Refund completed successfully',
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
   * PATCH /refunds/:refundId/status - Update refund status
   */
  static async updateRefundStatus(req, res) {
    try {
      const { status, message } = req.body;
      
      const refund = await Refund.findById(req.params.refundId);
      
      if (!refund) {
        return res.status(404).json({
          success: false,
          message: 'Refund not found'
        });
      }
      
      await refund.updateStatus(status, message);
      
      res.json({
        success: true,
        message: 'Refund status updated',
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
   * GET /refunds/:refundId/track - Track refund status
   */
  static async trackRefund(req, res) {
    try {
      const refund = await Refund.findById(req.params.refundId);
      
      if (!refund) {
        return res.status(404).json({
          success: false,
          message: 'Refund not found'
        });
      }
      
      // Verify ownership
      if (refund.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      res.json({
        success: true,
        data: {
          refundId: refund.refundId,
          status: refund.status,
          amount: refund.amount,
          statusHistory: refund.statusHistory,
          transactionId: refund.refundTransactionId,
          createdAt: refund.createdAt,
          completedAt: refund.completedAt
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /refunds - Create manual/standalone refund (Admin only)
   */
  static async createManualRefund(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can create manual refunds'
        });
      }
      
      const { orderId, amount, reason } = req.body;
      
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      const refund = new Refund({
        refundId: `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        userId: order.userId,
        amount,
        reason,
        originalPaymentId: order.paymentId,
        originalPaymentMethod: order.paymentMethod,
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(),
            message: `Manual refund: ${reason}`
          }
        ]
      });
      
      await refund.save();
      
      res.status(201).json({
        success: true,
        message: 'Manual refund created',
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
   * GET /refunds/stats/summary - Get refund statistics (Admin)
   */
  static async getRefundStats(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      const stats = await Refund.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);
      
      const totalRefunds = await Refund.countDocuments();
      const totalRefundAmount = await Refund.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      res.json({
        success: true,
        data: {
          totalRefunds,
          totalRefundAmount: totalRefundAmount[0]?.total || 0,
          byStatus: stats
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = RefundController;

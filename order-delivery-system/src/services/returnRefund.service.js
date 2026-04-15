const Return = require('../models/Return');
const Refund = require('../models/Refund');
const Order = require('../models/Order');
const { RETURN_STATUS } = require('../models/Return');
const { REFUND_STATUS } = require('../models/Refund');
const { v4: uuidv4 } = require('uuid');

/**
 * Return & Refund Service - Handles return requests and refund processing
 */
class ReturnRefundService {
  /**
   * Check if order is eligible for return
   * @param {Object} order - Order document
   * @returns {Object} - Eligibility status and reason
   */
  static checkReturnEligibility(order) {
    const isDelivered = order.status === 'delivered';
    const deliveryDate = order.actualDeliveryDate || order.statusHistory.find(h => h.status === 'delivered')?.timestamp;
    
    if (!isDelivered) {
      return { eligible: false, reason: 'Order not yet delivered' };
    }
    
    if (!deliveryDate) {
      return { eligible: false, reason: 'Delivery date not recorded' };
    }
    
    const daysSinceDelivery = Math.ceil((Date.now() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceDelivery > 7) {
      return { eligible: false, reason: `Return window expired (${daysSinceDelivery} days since delivery)` };
    }
    
    return { eligible: true, reason: null, daysSinceDelivery, daysRemaining: 7 - daysSinceDelivery };
  }

  /**
   * Create a return request
   * @param {Object} returnData - Return request details
   * @returns {Promise<Return>}
   */
  static async createReturnRequest(returnData) {
    try {
      // Check order eligibility
      const order = await Order.findById(returnData.orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      const eligibility = this.checkReturnEligibility(order);
      
      const returnId = `RET_${Date.now()}_${uuidv4().slice(0, 8)}`;
      
      const returnRequest = new Return({
        ...returnData,
        returnId,
        isEligible: eligibility.eligible,
        eligibilityCheckNotes: eligibility.reason,
        statusHistory: [
          {
            status: RETURN_STATUS.INITIATED,
            timestamp: new Date(),
            message: 'Return request submitted'
          }
        ]
      });
      
      await returnRequest.save();
      return returnRequest;
    } catch (error) {
      throw new Error(`Failed to create return request: ${error.message}`);
    }
  }

  /**
   * Get user's return requests
   * @param {String} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  static async getUserReturnRequests(userId, filters = {}) {
    try {
      let query = { userId };
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      const returns = await Return.find(query)
        .populate('orderId', 'orderId totalPrice items createdAt')
        .sort({ createdAt: -1 });
      
      return returns;
    } catch (error) {
      throw new Error(`Failed to fetch return requests: ${error.message}`);
    }
  }

  /**
   * Approve return request (Admin action)
   * @param {String} returnId - Return ID
   * @param {String} adminId - Admin user ID
   * @param {String} notes - Admin notes
   * @returns {Promise<Return>}
   */
  static async approveReturn(returnId, adminId, notes = '') {
    try {
      const returnRequest = await Return.findById(returnId);
      
      if (!returnRequest) {
        throw new Error('Return request not found');
      }
      
      if (returnRequest.status !== RETURN_STATUS.INITIATED) {
        throw new Error(`Cannot approve return with status: ${returnRequest.status}`);
      }
      
      await returnRequest.updateStatus(
        RETURN_STATUS.APPROVED,
        'Return approved by admin',
        adminId,
        notes
      );
      
      returnRequest.adminApprovalNotes = notes;
      await returnRequest.save();
      
      return returnRequest;
    } catch (error) {
      throw new Error(`Failed to approve return: ${error.message}`);
    }
  }

  /**
   * Reject return request (Admin action)
   * @param {String} returnId - Return ID
   * @param {String} adminId - Admin user ID
   * @param {String} reason - Rejection reason
   * @returns {Promise<Return>}
   */
  static async rejectReturn(returnId, adminId, reason = '') {
    try {
      const returnRequest = await Return.findById(returnId);
      
      if (!returnRequest) {
        throw new Error('Return request not found');
      }
      
      if (returnRequest.status !== RETURN_STATUS.INITIATED) {
        throw new Error(`Cannot reject return with status: ${returnRequest.status}`);
      }
      
      await returnRequest.updateStatus(
        RETURN_STATUS.REJECTED,
        'Return rejected',
        adminId,
        reason
      );
      
      returnRequest.rejectionReason = reason;
      await returnRequest.save();
      
      return returnRequest;
    } catch (error) {
      throw new Error(`Failed to reject return: ${error.message}`);
    }
  }

  /**
   * Update return status
   * @param {String} returnId - Return ID
   * @param {String} newStatus - New status
   * @param {String} message - Status message
   * @param {String} adminId - Admin ID (optional)
   * @returns {Promise<Return>}
   */
  static async updateReturnStatus(returnId, newStatus, message, adminId = null) {
    try {
      const returnRequest = await Return.findById(returnId);
      
      if (!returnRequest) {
        throw new Error('Return request not found');
      }
      
      await returnRequest.updateStatus(newStatus, message, adminId);
      return returnRequest;
    } catch (error) {
      throw new Error(`Failed to update return status: ${error.message}`);
    }
  }

  /**
   * Create refund for approved return
   * @param {String} returnId - Return ID
   * @param {String} reason - Refund reason
   * @returns {Promise<Refund>}
   */
  static async createRefund(returnId, reason = 'Product return') {
    try {
      const returnRequest = await Return.findById(returnId);
      
      if (!returnRequest) {
        throw new Error('Return request not found');
      }
      
      if (returnRequest.status !== RETURN_STATUS.APPROVED) {
        throw new Error('Cannot create refund for non-approved returns');
      }
      
      const order = await Order.findById(returnRequest.orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Check if refund already exists
      const existingRefund = await Refund.findOne({ returnId });
      if (existingRefund) {
        throw new Error('Refund already created for this return');
      }
      
      const refundId = `REF_${Date.now()}_${uuidv4().slice(0, 8)}`;
      
      const refund = new Refund({
        refundId,
        orderId: order._id,
        returnId,
        userId: order.userId,
        amount: returnRequest.returnAmount,
        reason,
        originalPaymentId: order.paymentId,
        originalPaymentMethod: order.paymentMethod,
        statusHistory: [
          {
            status: REFUND_STATUS.PENDING,
            timestamp: new Date(),
            message: 'Refund initiated'
          }
        ]
      });
      
      await refund.save();
      return refund;
    } catch (error) {
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  /**
   * Process refund (Admin action)
   * @param {String} refundId - Refund ID
   * @param {String} transactionId - Payment gateway transaction ID
   * @returns {Promise<Refund>}
   */
  static async processRefund(refundId, transactionId = null) {
    try {
      const refund = await Refund.findById(refundId);
      
      if (!refund) {
        throw new Error('Refund not found');
      }
      
      if (refund.status !== REFUND_STATUS.PENDING) {
        throw new Error(`Cannot process refund with status: ${refund.status}`);
      }
      
      // Simulate payment gateway refund processing
      // In production, call actual payment gateway API
      const simulatedTransactionId = transactionId || `TXN_${Date.now()}_${uuidv4().slice(0, 8)}`;
      
      await refund.updateStatus(
        REFUND_STATUS.PROCESSED,
        'Refund processed',
        simulatedTransactionId
      );
      
      refund.refundTransactionId = simulatedTransactionId;
      await refund.save();
      
      return refund;
    } catch (error) {
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * Complete refund (when payment gateway confirms)
   * @param {String} refundId - Refund ID
   * @returns {Promise<Refund>}
   */
  static async completeRefund(refundId) {
    try {
      const refund = await Refund.findById(refundId);
      
      if (!refund) {
        throw new Error('Refund not found');
      }
      
      if (refund.status !== REFUND_STATUS.PROCESSED) {
        throw new Error(`Cannot complete refund with status: ${refund.status}`);
      }
      
      await refund.updateStatus(
        REFUND_STATUS.COMPLETED,
        'Refund completed successfully'
      );
      
      // Update order payment status
      await Order.findByIdAndUpdate(refund.orderId, {
        paymentStatus: 'refunded'
      });
      
      return refund;
    } catch (error) {
      throw new Error(`Failed to complete refund: ${error.message}`);
    }
  }

  /**
   * Get user's refunds
   * @param {String} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  static async getUserRefunds(userId, filters = {}) {
    try {
      let query = { userId };
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      const refunds = await Refund.find(query)
        .populate('orderId', 'orderId total createdAt')
        .sort({ createdAt: -1 });
      
      return refunds;
    } catch (error) {
      throw new Error(`Failed to fetch refunds: ${error.message}`);
    }
  }
}

module.exports = ReturnRefundService;

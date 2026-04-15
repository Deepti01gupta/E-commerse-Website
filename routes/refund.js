const express = require('express');
const router = express.Router();
const Refund = require('../models/Refund');
const Order = require('../models/Order');
const Return = require('../models/Return');
const { v4: uuidv4 } = require('uuid');

/**
 * Refunds Routes - Handle refund processing
 */

// GET /api/refunds - Get available endpoints
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Refunds API Endpoints',
    endpoints: {
      'POST /api/refunds': 'Create a refund (Admin only)',
      'GET /api/refunds': 'Get all user refunds (with optional status filter)',
      'GET /api/refunds/:refundId': 'Get refund details',
      'PATCH /api/refunds/:refundId/process': 'Process refund with transaction ID (Admin)',
      'PATCH /api/refunds/:refundId/complete': 'Complete/finalize refund (Admin)'
    }
  });
});

// POST /api/refunds - Create refund (Admin or system triggered)
router.post('/', async (req, res) => {
  try {
    const { orderId, returnId, amount, reason, refundType } = req.body;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create refund document
    const refund = new Refund({
      refundId: `REF-${Date.now()}-${uuidv4().slice(0, 8)}`,
      orderId,
      returnId: returnId || null,
      userId: order.userId,
      amount: amount || order.pricing.total,
      reason,
      refundType: refundType || 'full',
      originalPaymentId: order.paymentId,
      originalPaymentMethod: order.paymentMethod,
      status: 'pending'
    });

    await refund.save();

    res.status(201).json({
      success: true,
      message: 'Refund initiated',
      data: refund
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/refunds - Get user's refunds
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    let query = { userId };
    if (status) query.status = status;

    const refunds = await Refund.find(query)
      .populate('orderId', 'orderId')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: refunds.length,
      data: refunds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/refunds/:refundId - Get refund details
router.get('/:refundId', async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.refundId)
      .populate('orderId')
      .lean();

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund not found'
      });
    }

    // Verify ownership
    if (refund.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/refunds/:refundId/process - Process refund (Admin only)
router.patch('/:refundId/process', async (req, res) => {
  try {
    const { transactionId } = req.body;

    const refund = await Refund.findById(req.params.refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund not found'
      });
    }

    // In real implementation, would call payment gateway API here
    // For now, just update status
    await refund.updateStatus('processed', 'Refund processed by admin', transactionId);

    res.json({
      success: true,
      message: 'Refund processed',
      data: refund
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/refunds/:refundId/complete - Complete refund (Mark as completed)
router.patch('/:refundId/complete', async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund not found'
      });
    }

    await refund.updateStatus('completed', 'Refund completed and credited to customer account');

    // Update order payment status to refunded
    await Order.findByIdAndUpdate(refund.orderId, {
      paymentStatus: 'refunded'
    });

    res.json({
      success: true,
      message: 'Refund completed',
      data: refund
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

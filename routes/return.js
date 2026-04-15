const express = require('express');
const router = express.Router();
const Return = require('../models/Return');
const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

/**
 * Returns Routes - Handle return requests
 */

// GET /api/returns - Get available endpoints
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Returns API Endpoints',
    endpoints: {
      'POST /api/returns': 'Create a return request',
      'GET /api/returns': 'Get all user return requests (with optional status filter)',
      'GET /api/returns/:returnId': 'Get return details',
      'GET /api/returns/check-eligibility/:orderId': 'Check if order is eligible for return',
      'PATCH /api/returns/:returnId/approve': 'Approve return (Admin only)',
      'PATCH /api/returns/:returnId/reject': 'Reject return (Admin only)'
    }
  });
});

// POST /api/returns - Create return request
router.post('/', async (req, res) => {
  try {
    const { orderId, reason, items, description } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!orderId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and reason are required'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check return eligibility (within 7 days of delivery)
    if (!order.returnEligible || new Date() > order.returnDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Order is not eligible for return. Return window has expired.'
      });
    }

    // Create return request
    const returnRequest = new Return({
      returnId: `RET-${Date.now()}-${uuidv4().slice(0, 8)}`,
      orderId: order._id,
      userId,
      reason,
      items,
      description,
      returnAmount: order.pricing.total,
      status: 'initiated',
      isEligible: true
    });

    await returnRequest.save();

    res.status(201).json({
      success: true,
      message: 'Return request created successfully',
      data: returnRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/returns - Get user's return requests
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    let query = { userId };
    if (status) query.status = status;

    const returns = await Return.find(query)
      .populate('orderId', 'orderId')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: returns.length,
      data: returns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/returns/:returnId - Get return details
router.get('/:returnId', async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.returnId)
      .populate('orderId')
      .lean();

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    // Verify ownership
    if (returnRequest.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/returns/check-eligibility/:orderId - Check if order is eligible for return
router.get('/check-eligibility/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const isEligible = order.returnEligible && new Date() <= order.returnDeadline;

    res.json({
      success: true,
      data: {
        eligible: isEligible,
        returnDeadline: order.returnDeadline,
        daysRemaining: isEligible ? Math.ceil((order.returnDeadline - new Date()) / (1000 * 60 * 60 * 24)) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/returns/:returnId/approve - Approve return (Admin only)
router.patch('/:returnId/approve', async (req, res) => {
  try {
    const { notes } = req.body;

    const returnRequest = await Return.findById(req.params.returnId);

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    await returnRequest.updateStatus('approved', 'Approved by admin', req.user._id, notes);

    res.json({
      success: true,
      message: 'Return approved',
      data: returnRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/returns/:returnId/reject - Reject return (Admin only)
router.patch('/:returnId/reject', async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const returnRequest = await Return.findById(req.params.returnId);

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    await returnRequest.updateStatus('rejected', 'Rejected by admin', req.user._id, rejectionReason);

    res.json({
      success: true,
      message: 'Return rejected',
      data: returnRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

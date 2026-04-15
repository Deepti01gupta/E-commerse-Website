const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const TrackingUpdate = require('../models/TrackingUpdate');
const { v4: uuidv4 } = require('uuid');

/**
 * Orders Routes - Integrated with main e-commerce app
 */

// GET /api/orders - Get available endpoints
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Orders API Endpoints',
    endpoints: {
      'POST /api/orders': 'Create a new order',
      'GET /api/orders': 'Get all user orders (with optional status filter)',
      'GET /api/orders/:orderId': 'Get single order details',
      'GET /api/orders/:orderId/track': 'Get tracking information for an order',
      'PATCH /api/orders/:orderId/status': 'Update order status (Admin only)',
      'POST /api/orders/:orderId/cancel': 'Cancel an order'
    }
  });
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentId, pricing } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Create order document
    const order = new Order({
      orderId: `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`,
      userId,
      items,
      shippingAddress,
      paymentMethod,
      paymentId,
      pricing,
      status: 'placed',
      paymentStatus: 'pending',
      trackingNumber: `TRK-${uuidv4().slice(0, 12).toUpperCase()}`
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/orders - Get user's orders
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    let query = { userId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/orders/:orderId - Get order details
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'username email')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership (allow admins to view any order)
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/orders/:orderId/track - Get order tracking information
router.get('/:orderId/track', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const trackingUpdates = await TrackingUpdate.find({ orderId: order._id })
      .sort({ timestamp: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDeliveryDate,
        currentLocation: order.currentLocation,
        trackingHistory: trackingUpdates,
        progress: order.getProgressPercentage()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/orders/:orderId/status - Update order status (Admin only)
router.patch('/:orderId/status', async (req, res) => {
  try {
    // Admin check would be handled by middleware in actual implementation
    const { newStatus, message, location } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Use the order method to update status
    await order.addStatusUpdate(newStatus, message, location);

    // Emit socket event for real-time update
    // io.to(order.userId.toString()).emit('orderStatusUpdate', order);

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/orders/:orderId/cancel - Cancel order
router.post('/:orderId/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Only allow cancellation if order status is 'placed' or 'confirmed'
    if (!['placed', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    await order.addStatusUpdate('cancelled', 'Cancelled by customer');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

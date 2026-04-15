const express = require('express');
const router = express.Router();
const TrackingUpdate = require('../models/TrackingUpdate');
const Order = require('../models/Order');

/**
 * Tracking Routes - Handle real-time order tracking
 */

// GET /api/tracking - Get all available tracking endpoints
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Tracking API Endpoints',
    endpoints: {
      'GET /api/tracking/:orderId/latest': 'Get latest tracking location for an order',
      'GET /api/tracking/:orderId/timeline': 'Get complete tracking timeline/history for an order',
      'GET /api/tracking/:orderId/stats': 'Get tracking statistics for an order',
      'POST /api/tracking': 'Add new tracking update (Admin only)'
    },
    example: {
      orderId: 'ORD-1234567890-abc123'
    }
  });
});

// GET /api/tracking/:orderId/latest - Get latest tracking location
router.get('/:orderId/latest', async (req, res) => {
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

    const latestTracking = await TrackingUpdate.findOne({ orderId: order._id })
      .sort({ timestamp: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        currentLocation: order.currentLocation,
        latestUpdate: latestTracking,
        status: order.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/tracking/:orderId/timeline - Get tracking timeline
router.get('/:orderId/timeline', async (req, res) => {
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

    const trackingUpdates = await TrackingUpdate.find({ orderId: order._id })
      .sort({ timestamp: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory,
        trackingUpdates,
        estimatedDelivery: order.estimatedDeliveryDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/tracking - Add tracking update (Admin/System)
router.post('/', async (req, res) => {
  try {
    const { orderId, event, message, location, source } = req.body;

    if (!orderId || !event) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and event are required'
      });
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create tracking update
    const trackingUpdate = new TrackingUpdate({
      orderId,
      event,
      message,
      location,
      source: source || 'manual',
      timestamp: new Date()
    });

    await trackingUpdate.save();

    // Update order's current location if provided
    if (location) {
      order.currentLocation = {
        ...location,
        updatedAt: new Date()
      };
      await order.save();
    }

    // Emit socket event for real-time update
    // io.to(order.userId.toString()).emit('trackingUpdate', trackingUpdate);

    res.status(201).json({
      success: true,
      message: 'Tracking update added',
      data: trackingUpdate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/tracking/:orderId/stats - Get tracking statistics
router.get('/:orderId/stats', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const trackingUpdates = await TrackingUpdate.find({ orderId: order._id })
      .lean();

    const stats = {
      totalUpdates: trackingUpdates.length,
      eventBreakdown: {
        pickup: trackingUpdates.filter(u => u.event === 'pickup').length,
        in_transit: trackingUpdates.filter(u => u.event === 'in_transit').length,
        checkpoint: trackingUpdates.filter(u => u.event === 'checkpoint').length,
        out_for_delivery: trackingUpdates.filter(u => u.event === 'out_for_delivery').length,
        delivered: trackingUpdates.filter(u => u.event === 'delivered').length
      },
      firstUpdate: trackingUpdates.length > 0 ? trackingUpdates[trackingUpdates.length - 1].timestamp : null,
      lastUpdate: trackingUpdates.length > 0 ? trackingUpdates[0].timestamp : null,
      deliveryProgress: order.getProgressPercentage()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

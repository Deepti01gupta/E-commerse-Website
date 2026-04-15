const TrackingService = require('../services/tracking.service');
const Order = require('../models/Order');

/**
 * Tracking Controller - Handles real-time location tracking API requests
 */
class TrackingController {
  /**
   * POST /tracking - Add location update
   */
  static async addLocationUpdate(req, res) {
    try {
      const { orderId, location, event, message, eventDescription, source } = req.body;
      
      const tracking = await TrackingService.addLocationUpdate(orderId, {
        location,
        event,
        message,
        eventDescription,
        source: source || 'manual'
      });
      
      res.status(201).json({
        success: true,
        message: 'Location update added',
        data: tracking
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /tracking/:orderId/latest - Get latest location
   */
  static async getLatestLocation(req, res) {
    try {
      const location = await TrackingService.getLatestLocation(req.params.orderId);
      
      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /tracking/:orderId/timeline - Get tracking timeline
   */
  static async getTrackingTimeline(req, res) {
    try {
      const { limit } = req.query;
      
      const timeline = await TrackingService.getTrackingTimeline(
        req.params.orderId,
        limit ? parseInt(limit) : 50
      );
      
      res.json({
        success: true,
        count: timeline.length,
        data: timeline
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /tracking/:orderId/delivery-attempt - Log delivery attempt
   */
  static async logDeliveryAttempt(req, res) {
    try {
      const { status, notes } = req.body;
      
      const tracking = await TrackingService.logDeliveryAttempt(
        req.params.orderId,
        status,
        notes
      );
      
      res.json({
        success: true,
        data: tracking
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /tracking/:orderId/estimate-delivery - Set estimated delivery time
   */
  static async setEstimatedDelivery(req, res) {
    try {
      const { estimatedHours } = req.body;
      
      const result = await TrackingService.setEstimatedDelivery(
        req.params.orderId,
        estimatedHours || 24
      );
      
      res.json({
        success: true,
        message: 'Estimated delivery time set',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /tracking/:orderId/stats - Get tracking statistics
   */
  static async getTrackingStats(req, res) {
    try {
      const stats = await TrackingService.getTrackingStats(req.params.orderId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /tracking/:orderId/simulate - Simulate tracking updates (Development)
   */
  static async simulateTrackingUpdates(req, res) {
    try {
      const updates = await TrackingService.simulateTrackingUpdates(req.params.orderId);
      
      res.json({
        success: true,
        message: 'Tracking simulated successfully',
        count: updates.length,
        data: updates
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /tracking/:orderId/geofence - Get delivery geofence data
   */
  static async getDeliveryGeofence(req, res) {
    try {
      const geofence = await TrackingService.getDeliveryZoneGeofence(req.params.orderId);
      
      res.json({
        success: true,
        data: geofence
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /tracking/:orderId/mark-delivered - Mark order as delivered
   */
  static async markAsDelivered(req, res) {
    try {
      const { location, signature, notes } = req.body;
      
      const order = await Order.findById(req.params.orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // Add delivery update
      const tracking = await TrackingService.addLocationUpdate(req.params.orderId, {
        event: 'delivered',
        message: 'Package delivered',
        eventDescription: notes || 'Package successfully delivered',
        location,
        source: 'delivery_provider'
      });
      
      // Update order status
      const Order_Model = require('../models/Order');
      await Order_Model.findByIdAndUpdate(req.params.orderId, {
        status: 'delivered',
        actualDeliveryDate: new Date(),
        deliverySignature: signature
      });
      
      res.json({
        success: true,
        message: 'Order marked as delivered',
        data: tracking
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = TrackingController;

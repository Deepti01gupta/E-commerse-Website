const OrderService = require('../services/order.service');
const TrackingService = require('../services/tracking.service');

/**
 * Order Controller - Handles order-related API requests
 */
class OrderController {
  /**
   * POST /orders - Create new order
   */
  static async createOrder(req, res) {
    try {
      const { items, shippingAddress, paymentDetails } = req.body;
      
      const order = await OrderService.createOrder({
        userId: req.user.id,
        items,
        shippingAddress,
        paymentDetails,
        status: 'placed',
        paymentStatus: 'pending'
      });
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /orders - Get user's order history
   */
  static async getUserOrders(req, res) {
    try {
      const { status, startDate, endDate } = req.query;
      
      const filters = {
        status,
        startDate,
        endDate
      };
      
      const orders = await OrderService.getUserOrderHistory(req.user.id, filters);
      
      res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /orders/:orderId - Get order details
   */
  static async getOrderDetails(req, res) {
    try {
      const order = await OrderService.getOrderDetails(req.params.orderId);
      
      // Verify order belongs to user
      if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
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
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PATCH /orders/:orderId/status - Update order status (Admin)
   */
  static async updateOrderStatus(req, res) {
    try {
      const { newStatus, message, location } = req.body;
      
      const order = await OrderService.updateOrderStatus(
        req.params.orderId,
        newStatus,
        message,
        location
      );
      
      res.json({
        success: true,
        message: 'Order status updated',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /orders/:orderId/track - Get tracking information
   */
  static async getOrderTracking(req, res) {
    try {
      const order = await OrderService.getOrderDetails(req.params.orderId);
      
      // Verify order belongs to user
      if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      const tracking = await TrackingService.getTrackingTimeline(order._id);
      const latestLocation = await TrackingService.getLatestLocation(order._id);
      const stats = await TrackingService.getTrackingStats(order._id);
      
      res.json({
        success: true,
        data: {
          orderId: order.orderId,
          status: order.status,
          tracking,
          latestLocation,
          stats
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
   * POST /orders/:orderId/location - Update order location
   */
  static async updateLocation(req, res) {
    try {
      const { location } = req.body;
      
      const order = await OrderService.updateOrderLocation(
        req.params.orderId,
        location
      );
      
      res.json({
        success: true,
        message: 'Location updated',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /orders/search/tracking - Search order by tracking number
   */
  static async searchByTrackingNumber(req, res) {
    try {
      const { trackingNumber } = req.query;
      
      if (!trackingNumber) {
        return res.status(400).json({
          success: false,
          message: 'Tracking number required'
        });
      }
      
      const order = await OrderService.getOrderByTrackingNumber(trackingNumber);
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /orders/:orderId/simulate-tracking - Simulate tracking (Development)
   */
  static async simulateTracking(req, res) {
    try {
      const tracking = await OrderService.simulateTrackingUpdate(req.params.orderId);
      
      res.json({
        success: true,
        message: 'Tracking simulated',
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
   * POST /orders/:orderId/cancel - Cancel order
   */
  static async cancelOrder(req, res) {
    try {
      const order = await OrderService.updateOrderStatus(
        req.params.orderId,
        'cancelled',
        'Order cancelled by customer'
      );
      
      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = OrderController;

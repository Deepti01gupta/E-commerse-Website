const Order = require('../models/Order');
const TrackingUpdate = require('../models/TrackingUpdate');
const { ORDER_STATUS } = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

/**
 * Order Service - Handles all order-related business logic
 */
class OrderService {
  /**
   * Create a new order
   * @param {Object} orderData - Order details
   * @returns {Promise<Order>}
   */
  static async createOrder(orderData) {
    try {
      const orderId = `ORD_${Date.now()}_${uuidv4().slice(0, 8)}`;
      
      const order = new Order({
        ...orderData,
        orderId,
        statusHistory: [
          {
            status: ORDER_STATUS.PLACED,
            timestamp: new Date(),
            message: 'Order placed successfully'
          }
        ]
      });
      
      await order.save();
      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Get user's order history with filters
   * @param {String} userId - User ID
   * @param {Object} filters - Filter options (status, dateRange, etc.)
   * @returns {Promise<Array>}
   */
  static async getUserOrderHistory(userId, filters = {}) {
    try {
      let query = { userId };
      
      // Apply status filter
      if (filters.status) {
        query.status = filters.status;
      }
      
      // Apply date range filter
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }
      
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .select('-statusHistory -currentLocation'); // Exclude heavy fields
      
      return orders;
    } catch (error) {
      throw new Error(`Failed to fetch order history: ${error.message}`);
    }
  }

  /**
   * Get detailed order information
   * @param {String} orderId - Order ID
   * @returns {Promise<Order>}
   */
  static async getOrderDetails(orderId) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      return order;
    } catch (error) {
      throw new Error(`Failed to fetch order details: ${error.message}`);
    }
  }

  /**
   * Update order status
   * @param {String} orderId - Order ID
   * @param {String} newStatus - New status
   * @param {String} message - Status update message
   * @param {String} location - Current location (optional)
   * @returns {Promise<Order>}
   */
  static async updateOrderStatus(orderId, newStatus, message, location = null) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Validate status transition
      const validTransitions = {
        [ORDER_STATUS.PLACED]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.OUT_FOR_DELIVERY],
        [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED],
        [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RETURNED],
        [ORDER_STATUS.CANCELLED]: [],
        [ORDER_STATUS.RETURNED]: []
      };
      
      if (!validTransitions[order.status]?.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
      }
      
      await order.addStatusUpdate(newStatus, message, location);
      
      return order;
    } catch (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  /**
   * Update order location for live tracking
   * @param {String} orderId - Order ID
   * @param {Object} location - Location coordinates and address
   * @returns {Promise<Order>}
   */
  static async updateOrderLocation(orderId, location) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      order.currentLocation = {
        ...location,
        updatedAt: new Date()
      };
      
      await order.save();
      return order;
    } catch (error) {
      throw new Error(`Failed to update order location: ${error.message}`);
    }
  }

  /**
   * Get order by tracking number
   * @param {String} trackingNumber - Tracking number
   * @returns {Promise<Order>}
   */
  static async getOrderByTrackingNumber(trackingNumber) {
    try {
      const order = await Order.findOne({ trackingNumber });
      
      if (!order) {
        throw new Error('Order not found with this tracking number');
      }
      
      return order;
    } catch (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  }

  /**
   * Simulate delivery tracking updates (for development/testing)
   * @param {String} orderId - Order ID
   * @returns {Promise<Object>}
   */
  static async simulateTrackingUpdate(orderId) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Simulate location update
      const locations = [
        { latitude: 28.6139, longitude: 77.2090, address: 'New Delhi Distribution Center', city: 'New Delhi', state: 'Delhi' },
        { latitude: 28.5500, longitude: 77.2000, address: 'In Transit - Highway', city: 'Gurgaon', state: 'Haryana' },
        { latitude: 28.4500, longitude: 77.3000, address: 'Local Delivery Hub', city: 'Noida', state: 'Uttar Pradesh' },
        { latitude: 28.4000, longitude: 77.3500, address: 'Out for Delivery', city: 'Noida', state: 'Uttar Pradesh' }
      ];
      
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      
      const tracking = new TrackingUpdate({
        orderId: order._id,
        location: randomLocation,
        event: 'in_transit',
        message: `Package is ${randomLocation.address}`,
        source: 'simulated'
      });
      
      await tracking.save();
      return tracking;
    } catch (error) {
      throw new Error(`Failed to simulate tracking: ${error.message}`);
    }
  }

  /**
   * Get tracking history for an order
   * @param {String} orderId - Order ID
   * @returns {Promise<Array>}
   */
  static async getTrackingHistory(orderId) {
    try {
      const updates = await TrackingUpdate.find({ orderId })
        .sort({ timestamp: -1 })
        .limit(50);
      
      return updates;
    } catch (error) {
      throw new Error(`Failed to fetch tracking history: ${error.message}`);
    }
  }
}

module.exports = OrderService;

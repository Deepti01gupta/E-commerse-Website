const TrackingUpdate = require('../models/TrackingUpdate');
const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

/**
 * Tracking Service - Handles real-time location tracking and delivery updates
 */
class TrackingService {
  /**
   * Add location update to order tracking
   * @param {String} orderId - Order ID
   * @param {Object} locationData - Location details
   * @returns {Promise<TrackingUpdate>}
   */
  static async addLocationUpdate(orderId, locationData) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      const tracking = new TrackingUpdate({
        orderId,
        location: locationData.location,
        event: locationData.event || 'checkpoint',
        message: locationData.message,
        eventDescription: locationData.eventDescription,
        source: locationData.source || 'manual'
      });
      
      if (locationData.accuracy) {
        tracking.accuracy = locationData.accuracy;
      }
      
      await tracking.save();
      
      // Update order's current location
      await Order.findByIdAndUpdate(orderId, {
        'currentLocation.latitude': locationData.location.latitude,
        'currentLocation.longitude': locationData.location.longitude,
        'currentLocation.address': locationData.location.address,
        'currentLocation.city': locationData.location.city,
        'currentLocation.state': locationData.location.state,
        'currentLocation.updatedAt': new Date()
      });
      
      return tracking;
    } catch (error) {
      throw new Error(`Failed to add location update: ${error.message}`);
    }
  }

  /**
   * Get latest location for order
   * @param {String} orderId - Order ID
   * @returns {Promise<Object>}
   */
  static async getLatestLocation(orderId) {
    try {
      const tracking = await TrackingUpdate.findOne({ orderId })
        .sort({ timestamp: -1 })
        .select('location event timestamp message');
      
      if (!tracking) {
        // Return last known location from order
        const order = await Order.findById(orderId);
        return {
          location: order?.currentLocation,
          event: 'unknown',
          timestamp: null,
          message: 'Location data not available'
        };
      }
      
      return tracking;
    } catch (error) {
      throw new Error(`Failed to fetch latest location: ${error.message}`);
    }
  }

  /**
   * Get complete tracking timeline for order
   * @param {String} orderId - Order ID
   * @param {Number} limit - Limit results
   * @returns {Promise<Array>}
   */
  static async getTrackingTimeline(orderId, limit = 50) {
    try {
      const updates = await TrackingUpdate.find({ orderId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('event message location timestamp eventDescription');
      
      return updates.reverse(); // Return in chronological order
    } catch (error) {
      throw new Error(`Failed to fetch tracking timeline: ${error.message}`);
    }
  }

  /**
   * Log delivery attempt
   * @param {String} orderId - Order ID
   * @param {String} status - Attempt status (success/failed/no_answer)
   * @param {String} notes - Additional notes
   * @returns {Promise<TrackingUpdate>}
   */
  static async logDeliveryAttempt(orderId, status, notes = '') {
    try {
      const eventMessages = {
        success: 'Package delivered successfully',
        failed: 'Delivery attempt failed',
        no_answer: 'No one available at delivery address'
      };
      
      const tracking = new TrackingUpdate({
        orderId,
        event: 'out_for_delivery',
        message: eventMessages[status] || 'Delivery attempt recorded',
        eventDescription: notes,
        source: 'delivery_provider'
      });
      
      await tracking.save();
      return tracking;
    } catch (error) {
      throw new Error(`Failed to log delivery attempt: ${error.message}`);
    }
  }

  /**
   * Generate estimated delivery time
   * @param {String} orderId - Order ID
   * @param {Number} estimatedHours - Estimated hours for delivery
   * @returns {Promise<Object>}
   */
  static async setEstimatedDelivery(orderId, estimatedHours = 24) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      const estimatedDeliveryTime = new Date(Date.now() + estimatedHours * 60 * 60 * 1000);
      
      order.estimatedDeliveryDate = estimatedDeliveryTime;
      await order.save();
      
      return {
        orderId: order.orderId,
        estimatedDeliveryDate: estimatedDeliveryTime,
        estimatedHours
      };
    } catch (error) {
      throw new Error(`Failed to set estimated delivery: ${error.message}`);
    }
  }

  /**
   * Get tracking statistics for order
   * @param {String} orderId - Order ID
   * @returns {Promise<Object>}
   */
  static async getTrackingStats(orderId) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      const updates = await TrackingUpdate.find({ orderId });
      
      const eventCounts = {};
      updates.forEach(update => {
        eventCounts[update.event] = (eventCounts[update.event] || 0) + 1;
      });
      
      const firstUpdate = updates[updates.length - 1]?.timestamp;
      const lastUpdate = updates[0]?.timestamp;
      const totalTime = firstUpdate && lastUpdate 
        ? Math.round((lastUpdate - firstUpdate) / (1000 * 60)) 
        : 0;
      
      return {
        orderId: order.orderId,
        totalUpdates: updates.length,
        eventCounts,
        firstUpdate,
        lastUpdate,
        totalTimeMinutes: totalTime,
        currentStatus: order.status,
        estimatedDelivery: order.estimatedDeliveryDate
      };
    } catch (error) {
      throw new Error(`Failed to fetch tracking stats: ${error.message}`);
    }
  }

  /**
   * Simulate real-time tracking (for development)
   * @param {String} orderId - Order ID
   * @returns {Promise<Array>}
   */
  static async simulateTrackingUpdates(orderId) {
    try {
      const updates = [
        {
          event: 'pickup',
          message: 'Package picked up from seller',
          location: { latitude: 28.6139, longitude: 77.2090, address: 'Seller Warehouse', city: 'New Delhi', state: 'Delhi' }
        },
        {
          event: 'in_transit',
          message: 'Package in transit to distribution center',
          location: { latitude: 28.5500, longitude: 77.2000, address: 'Highway Route', city: 'Gurgaon', state: 'Haryana' }
        },
        {
          event: 'checkpoint',
          message: 'Package reached distribution center',
          location: { latitude: 28.5200, longitude: 77.2500, address: 'Distribution Center', city: 'Gurgaon', state: 'Haryana' }
        },
        {
          event: 'in_transit',
          message: 'Package in transit to delivery hub',
          location: { latitude: 28.4500, longitude: 77.3000, address: 'Local Delivery Hub', city: 'Noida', state: 'Uttar Pradesh' }
        },
        {
          event: 'out_for_delivery',
          message: 'Package out for delivery today',
          location: { latitude: 28.4000, longitude: 77.3500, address: 'Out For Delivery', city: 'Noida', state: 'Uttar Pradesh' }
        }
      ];
      
      const savedUpdates = [];
      
      for (const update of updates) {
        const tracking = await this.addLocationUpdate(orderId, {
          event: update.event,
          message: update.message,
          location: update.location,
          source: 'simulated'
        });
        savedUpdates.push(tracking);
        
        // Add delay between updates for realistic simulation
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return savedUpdates;
    } catch (error) {
      throw new Error(`Failed to simulate tracking: ${error.message}`);
    }
  }

  /**
   * Get geofencing data for delivery zone
   * @param {String} orderId - Order ID
   * @returns {Promise<Object>}
   */
  static async getDeliveryZoneGeofence(orderId) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Extract coordinates from shipping address
      const deliveryAddress = order.shippingAddress;
      
      // Simulated geofence center and radius (250m)
      const geofence = {
        center: {
          latitude: deliveryAddress?.latitude || 28.4595,
          longitude: deliveryAddress?.longitude || 77.3426
        },
        radius: 250, // meters
        address: deliveryAddress?.address,
        city: deliveryAddress?.city,
        state: deliveryAddress?.state,
        zipCode: deliveryAddress?.zipCode
      };
      
      return geofence;
    } catch (error) {
      throw new Error(`Failed to fetch geofence data: ${error.message}`);
    }
  }
}

module.exports = TrackingService;

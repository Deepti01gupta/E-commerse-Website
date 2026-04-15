const Order = require('../models/Order');
const Return = require('../models/Return');
const Refund = require('../models/Refund');
const TrackingUpdate = require('../models/TrackingUpdate');

/**
 * Analytics Service - Provides insights and analytics for orders, returns, and refunds
 */
class AnalyticsService {
  /**
   * Get dashboard statistics
   * @param {Object} dateRange - Date range filter
   * @returns {Promise<Object>}
   */
  static async getDashboardStats(dateRange = {}) {
    try {
      const query = {};
      
      if (dateRange.startDate || dateRange.endDate) {
        query.createdAt = {};
        if (dateRange.startDate) {
          query.createdAt.$gte = new Date(dateRange.startDate);
        }
        if (dateRange.endDate) {
          query.createdAt.$lte = new Date(dateRange.endDate);
        }
      }
      
      // Revenue metrics
      const orders = await Order.find(query);
      const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Order status breakdown
      const ordersByStatus = await Order.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // Return metrics
      const returnsData = await Return.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$returnAmount' }
          }
        }
      ]);
      
      const totalReturns = returnsData.reduce((sum, item) => sum + item.count, 0);
      const totalReturnAmount = returnsData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
      const returnRate = totalOrders > 0 ? (totalReturns / totalOrders) * 100 : 0;
      
      // Refund metrics
      const refundData = await Refund.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);
      
      const totalRefunds = refundData.reduce((sum, item) => sum + item.count, 0);
      const totalRefundAmount = refundData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
      
      return {
        revenue: {
          total: totalRevenue,
          average: averageOrderValue
        },
        orders: {
          total: totalOrders,
          byStatus: ordersByStatus
        },
        returns: {
          total: totalReturns,
          rate: returnRate.toFixed(2),
          byStatus: returnsData,
          totalAmount: totalReturnAmount
        },
        refunds: {
          total: totalRefunds,
          byStatus: refundData,
          totalAmount: totalRefundAmount
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  }

  /**
   * Get delivery performance metrics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>}
   */
  static async getDeliveryMetrics(filters = {}) {
    try {
      const query = { status: 'delivered' };
      
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }
      
      const deliveredOrders = await Order.find(query);
      const totalDelivered = deliveredOrders.length;
      
      // Calculate average delivery time
      let totalDeliveryTime = 0;
      let onTimeDeliveries = 0;
      
      deliveredOrders.forEach(order => {
        const createdDate = new Date(order.createdAt);
        const deliveredDate = new Date(order.actualDeliveryDate);
        const deliveryTime = Math.ceil((deliveredDate - createdDate) / (1000 * 60 * 60 * 24));
        
        totalDeliveryTime += deliveryTime;
        
        if (order.estimatedDeliveryDate && deliveredDate <= order.estimatedDeliveryDate) {
          onTimeDeliveries++;
        }
      });
      
      const averageDeliveryTime = totalDelivered > 0 ? totalDeliveryTime / totalDelivered : 0;
      const onTimeRate = totalDelivered > 0 ? (onTimeDeliveries / totalDelivered) * 100 : 0;
      
      // Reasons for failed deliveries
      const failedAttempts = await TrackingUpdate.aggregate([
        { $match: { event: 'out_for_delivery' } },
        { $group: { _id: '$eventDescription', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      return {
        totalDelivered,
        averageDeliveryTimeInDays: averageDeliveryTime.toFixed(2),
        onTimeDeliveries,
        onTimeRate: onTimeRate.toFixed(2),
        failedAttempts
      };
    } catch (error) {
      throw new Error(`Failed to fetch delivery metrics: ${error.message}`);
    }
  }

  /**
   * Get return reason analysis
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  static async getReturnReasonAnalysis(filters = {}) {
    try {
      const query = {};
      
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }
      
      const analysis = await Return.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$reason',
            count: { $sum: 1 },
            totalAmount: { $sum: '$returnAmount' },
            avgAmount: { $avg: '$returnAmount' }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      return analysis;
    } catch (error) {
      throw new Error(`Failed to fetch return analysis: ${error.message}`);
    }
  }

  /**
   * Get customer-level analytics
   * @param {String} userId - User ID
   * @returns {Promise<Object>}
   */
  static async getCustomerAnalytics(userId) {
    try {
      const orders = await Order.find({ userId });
      const returns = await Return.find({ userId });
      const refunds = await Refund.find({ userId });
      
      const totalSpent = orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
      const totalOrderCount = orders.length;
      const averageOrderValue = totalOrderCount > 0 ? totalSpent / totalOrderCount : 0;
      
      // Order frequency (average days between orders)
      let averageDaysBetweenOrders = 0;
      if (orders.length > 1) {
        const sortedOrders = orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        let totalDays = 0;
        for (let i = 1; i < sortedOrders.length; i++) {
          const daysBetween = (new Date(sortedOrders[i].createdAt) - new Date(sortedOrders[i - 1].createdAt)) / (1000 * 60 * 60 * 24);
          totalDays += daysBetween;
        }
        averageDaysBetweenOrders = totalDays / (orders.length - 1);
      }
      
      const returnRate = totalOrderCount > 0 ? (returns.length / totalOrderCount) * 100 : 0;
      const totalRefunded = refunds.reduce((sum, refund) => sum + refund.amount, 0);
      
      // Last order date
      const lastOrder = orders.length > 0 ? orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;
      
      return {
        totalOrderCount,
        totalSpent: totalSpent.toFixed(2),
        averageOrderValue: averageOrderValue.toFixed(2),
        averageDaysBetweenOrders: averageDaysBetweenOrders.toFixed(2),
        returnRate: returnRate.toFixed(2),
        returnCount: returns.length,
        refundCount: refunds.length,
        totalRefunded: totalRefunded.toFixed(2),
        lastOrderDate: lastOrder?.createdAt,
        customerLifetimeValue: totalSpent.toFixed(2)
      };
    } catch (error) {
      throw new Error(`Failed to fetch customer analytics: ${error.message}`);
    }
  }

  /**
   * Get trending products (based on order frequency)
   * @param {Number} limit - Number of products to return
   * @returns {Promise<Array>}
   */
  static async getTrendingProducts(limit = 10) {
    try {
      const products = await Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: limit }
      ]);
      
      return products;
    } catch (error) {
      throw new Error(`Failed to fetch trending products: ${error.message}`);
    }
  }
}

module.exports = AnalyticsService;

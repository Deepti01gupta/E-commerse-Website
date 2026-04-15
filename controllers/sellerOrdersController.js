/**
 * Seller Orders Controller
 * Handles seller-specific order operations with proper authorization
 */

const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Get all orders for a specific seller
 * Only returns orders containing products from this seller
 * Supports filtering by status and date range
 */
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Build match condition for MongoDB aggregation
    const matchCondition = {
      'items.sellerId': new mongoose.Types.ObjectId(sellerId)
    };

    // Add status filter if provided
    if (status) {
      matchCondition['items.sellerStatus'] = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      matchCondition.createdAt = {};
      if (startDate) {
        matchCondition.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchCondition.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    // MongoDB aggregation pipeline to fetch seller orders
    const orders = await Order.aggregate([
      {
        $match: matchCondition
      },
      {
        // Project only items belonging to this seller
        $addFields: {
          items: {
            $filter: {
              input: '$items',
              as: 'item',
              cond: {
                $eq: ['$$item.sellerId', new mongoose.Types.ObjectId(sellerId)]
              }
            }
          }
        }
      },
      {
        // Lookup user details (buyer)
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'buyer'
        }
      },
      {
        // Unwind buyer array to merge with main document
        $unwind: {
          path: '$buyer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        // Sort by creation date (newest first)
        $sort: { createdAt: -1 }
      },
      {
        // Pagination
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Get total count for pagination
    const totalOrders = await Order.aggregate([
      {
        $match: matchCondition
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);

    const total = totalOrders.length > 0 ? totalOrders[0].count : 0;

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          total,
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller orders',
      error: error.message
    });
  }
};

/**
 * Get single order details for a seller
 * Ensures seller only sees their own products in the order
 */
exports.getSellerOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sellerId = req.user._id;

    // Find order with seller's items only
    const order = await Order.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(orderId),
          'items.sellerId': new mongoose.Types.ObjectId(sellerId)
        }
      },
      {
        $addFields: {
          items: {
            $filter: {
              input: '$items',
              as: 'item',
              cond: {
                $eq: ['$$item.sellerId', new mongoose.Types.ObjectId(sellerId)]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'buyer'
        }
      },
      {
        $unwind: {
          path: '$buyer',
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    if (!order || order.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    res.json({
      success: true,
      data: order[0]
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order detail',
      error: error.message
    });
  }
};

/**
 * Update seller status for their products in an order
 * Seller can update status from: pending -> processing -> shipped -> delivered
 */
exports.updateSellerItemStatus = async (req, res) => {
  try {
    const { orderId, itemIndex } = req.params;
    const { status, note } = req.body;
    const sellerId = req.user._id;

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get the item
    const item = order.items[itemIndex];

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in order'
      });
    }

    // Verify seller ownership
    if (item.sellerId.toString() !== sellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update your own products'
      });
    }

    // Validate status progression
    const statusProgression = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStatusIndex = statusProgression.indexOf(item.sellerStatus);
    const newStatusIndex = statusProgression.indexOf(status);

    if (newStatusIndex < currentStatusIndex) {
      return res.status(400).json({
        success: false,
        message: 'Cannot move to a previous status'
      });
    }

    // Update item status
    item.sellerStatus = status;
    item.sellerStatusHistory.push({
      status,
      timestamp: new Date(),
      note: note || ''
    });

    // Save order
    await order.save();

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: {
        orderId: order._id,
        itemIndex,
        newStatus: status,
        statusHistory: item.sellerStatusHistory
      }
    });
  } catch (error) {
    console.error('Error updating seller item status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

/**
 * Get seller dashboard statistics
 * Returns summary of orders, revenue, etc.
 */
exports.getSellerDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    const matchCondition = {
      'items.sellerId': new mongoose.Types.ObjectId(sellerId)
    };

    if (Object.keys(dateFilter).length > 0) {
      matchCondition.createdAt = dateFilter;
    }

    // Get statistics using aggregation
    const stats = await Order.aggregate([
      {
        $match: matchCondition
      },
      {
        $addFields: {
          items: {
            $filter: {
              input: '$items',
              as: 'item',
              cond: {
                $eq: ['$$item.sellerId', new mongoose.Types.ObjectId(sellerId)]
              }
            }
          }
        }
      },
      {
        $facet: {
          totalOrders: [
            {
              $count: 'count'
            }
          ],
          totalRevenue: [
            {
              $group: {
                _id: null,
                revenue: {
                  $sum: { $sum: '$items.subtotal' }
                }
              }
            }
          ],
          statusBreakdown: [
            {
              $unwind: '$items'
            },
            {
              $group: {
                _id: '$items.sellerStatus',
                count: { $sum: 1 }
              }
            }
          ],
          topProducts: [
            {
              $unwind: '$items'
            },
            {
              $group: {
                _id: '$items.productId',
                productName: { $first: '$items.name' },
                totalSold: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.subtotal' }
              }
            },
            {
              $sort: { totalSold: -1 }
            },
            {
              $limit: 5
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders: stats[0].totalOrders[0]?.count || 0,
        totalRevenue: stats[0].totalRevenue[0]?.revenue || 0,
        statusBreakdown: stats[0].statusBreakdown,
        topProducts: stats[0].topProducts
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Get orders by status for a seller
 */
exports.getOrdersByStatus = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { status } = req.params;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const orders = await Order.aggregate([
      {
        $match: {
          'items.sellerId': new mongoose.Types.ObjectId(sellerId),
          'items.sellerStatus': status
        }
      },
      {
        $addFields: {
          items: {
            $filter: {
              input: '$items',
              as: 'item',
              cond: {
                $and: [
                  { $eq: ['$$item.sellerId', new mongoose.Types.ObjectId(sellerId)] },
                  { $eq: ['$$item.sellerStatus', status] }
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'buyer'
        }
      },
      {
        $unwind: {
          path: '$buyer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        status,
        count: orders.length,
        orders
      }
    });
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders by status',
      error: error.message
    });
  }
};

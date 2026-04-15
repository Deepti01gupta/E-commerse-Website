/**
 * Seller Orders Routes
 * All routes protected with seller RBAC
 */

const express = require('express');
const router = express.Router();
const sellerOrdersController = require('../controllers/sellerOrdersController');
const { isSeller } = require('../middleware/rbac');

/**
 * Protect all routes - only sellers and admins can access
 */
router.use(isSeller);

/**
 * GET /api/seller/orders
 * Get all orders for the seller with filtering and pagination
 * Query Params:
 *   - status: Filter by seller item status (pending, processing, shipped, delivered)
 *   - startDate: Filter orders from this date
 *   - endDate: Filter orders until this date
 *   - page: Pagination page (default: 1)
 *   - limit: Items per page (default: 10)
 */
router.get('/orders', sellerOrdersController.getSellerOrders);

/**
 * GET /api/seller/orders/:orderId
 * Get detailed information about a specific order
 * Only returns products belonging to the seller
 */
router.get('/orders/:orderId', sellerOrdersController.getSellerOrderDetail);

/**
 * PATCH /api/seller/orders/:orderId/items/:itemIndex/status
 * Update the status of a specific product in an order
 * Seller can only update their own products
 * Body:
 *   - status: New status (pending, processing, shipped, delivered)
 *   - note: Optional note about the status update
 */
router.patch('/orders/:orderId/items/:itemIndex/status', sellerOrdersController.updateSellerItemStatus);

/**
 * GET /api/seller/dashboard/stats
 * Get dashboard statistics for the seller
 * Query Params:
 *   - startDate: Filter from this date
 *   - endDate: Filter until this date
 * Returns:
 *   - totalOrders: Total orders count
 *   - totalRevenue: Total revenue from seller's products
 *   - statusBreakdown: Orders grouped by status
 *   - topProducts: Top 5 selling products
 */
router.get('/dashboard/stats', sellerOrdersController.getSellerDashboardStats);

/**
 * GET /api/seller/orders/status/:status
 * Get all orders with a specific status
 * Status: pending, processing, shipped, delivered
 */
router.get('/orders/status/:status', sellerOrdersController.getOrdersByStatus);

/**
 * GET /api/seller/orders - Info endpoint
 * Returns documentation about seller orders API
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Seller Orders API',
    endpoints: {
      'GET /api/seller/orders': 'Get all seller orders with filtering',
      'GET /api/seller/orders/:orderId': 'Get order details',
      'PATCH /api/seller/orders/:orderId/items/:itemIndex/status': 'Update product status',
      'GET /api/seller/dashboard/stats': 'Get dashboard statistics',
      'GET /api/seller/orders/status/:status': 'Get orders by status'
    }
  });
});

module.exports = router;

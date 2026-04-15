const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { orderValidators } = require('../validators/validators');

/**
 * Public Routes
 */

/**
 * Protected Routes (Authenticated Users)
 */

// Create order
router.post('/', authenticate, validate(orderValidators.createOrder), OrderController.createOrder);

// Get user's orders
router.get('/', authenticate, OrderController.getUserOrders);

// Get order details
router.get('/:orderId', authenticate, OrderController.getOrderDetails);

// Get order tracking information
router.get('/:orderId/track', authenticate, OrderController.getOrderTracking);

// Update order location
router.post('/:orderId/location', authenticate, validate(orderValidators.updateLocation), OrderController.updateLocation);

// Cancel order
router.post('/:orderId/cancel', authenticate, OrderController.cancelOrder);

// Search order by tracking number
router.get('/search/tracking', authenticate, OrderController.searchByTrackingNumber);

/**
 * Admin Routes
 */

// Update order status (Admin)
router.patch('/:orderId/status', authenticate, isAdmin, validate(orderValidators.updateOrderStatus), OrderController.updateOrderStatus);

// Simulate tracking updates (Development)
router.post('/:orderId/simulate-tracking', authenticate, isAdmin, OrderController.simulateTracking);

module.exports = router;

const express = require('express');
const router = express.Router();

// Import route files
const orderRoutes = require('./order.routes');
const returnRoutes = require('./return.routes');
const refundRoutes = require('./refund.routes');
const trackingRoutes = require('./tracking.routes');

/**
 * API Routes Configuration
 */

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Order & Delivery Management API is running',
    timestamp: new Date()
  });
});

// Mount route modules
router.use('/orders', orderRoutes);
router.use('/returns', returnRoutes);
router.use('/refunds', refundRoutes);
router.use('/tracking', trackingRoutes);

/**
 * API Documentation
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Order & Delivery Management API',
    version: '1.0.0',
    endpoints: {
      orders: '/api/orders',
      returns: '/api/returns',
      refunds: '/api/refunds',
      tracking: '/api/tracking'
    },
    auth: 'JWT Bearer Token required',
    baseUrl: '/api/v1'
  });
});

module.exports = router;

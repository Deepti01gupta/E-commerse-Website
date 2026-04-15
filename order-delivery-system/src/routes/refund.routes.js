const express = require('express');
const router = express.Router();
const RefundController = require('../controllers/refund.controller');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { refundValidators } = require('../validators/validators');

/**
 * Protected Routes (Authenticated Users)
 */

// Get user's refunds
router.get('/', authenticate, RefundController.getUserRefunds);

// Get refund details
router.get('/:refundId', authenticate, RefundController.getRefundDetails);

// Track refund status
router.get('/:refundId/track', authenticate, RefundController.trackRefund);

// Get refunds for specific order
router.get('/order/:orderId', authenticate, RefundController.getOrderRefunds);

/**
 * Admin Routes
 */

// Create manual refund (Admin only)
router.post('/', authenticate, isAdmin, validate(refundValidators.createManualRefund), RefundController.createManualRefund);

// Process refund (Admin)
router.patch('/:refundId/process', authenticate, isAdmin, validate(refundValidators.processRefund), RefundController.processRefund);

// Complete refund (Admin)
router.patch('/:refundId/complete', authenticate, isAdmin, RefundController.completeRefund);

// Update refund status (Admin)
router.patch('/:refundId/status', authenticate, isAdmin, validate(refundValidators.updateRefundStatus), RefundController.updateRefundStatus);

// Get refund statistics (Admin)
router.get('/stats/summary', authenticate, isAdmin, RefundController.getRefundStats);

module.exports = router;

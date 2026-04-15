const express = require('express');
const router = express.Router();
const TrackingController = require('../controllers/tracking.controller');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { trackingValidators } = require('../validators/validators');

/**
 * Public Routes (No auth required for tracking by tracking number)
 */

/**
 * Protected Routes (Authenticated Users)
 */

// Get latest location for order
router.get('/:orderId/latest', authenticate, TrackingController.getLatestLocation);

// Get tracking timeline
router.get('/:orderId/timeline', authenticate, TrackingController.getTrackingTimeline);

// Get tracking statistics
router.get('/:orderId/stats', authenticate, TrackingController.getTrackingStats);

// Get delivery geofence data
router.get('/:orderId/geofence', authenticate, TrackingController.getDeliveryGeofence);

/**
 * Admin/Delivery Partner Routes
 */

// Add location update (Admin/Delivery Partner)
router.post('/', authenticate, validate(trackingValidators.addLocationUpdate), TrackingController.addLocationUpdate);

// Log delivery attempt (Admin/Delivery Partner)
router.post('/:orderId/delivery-attempt', authenticate, validate(trackingValidators.logDeliveryAttempt), TrackingController.logDeliveryAttempt);

// Set estimated delivery time (Admin/Delivery Partner)
router.post('/:orderId/estimate-delivery', authenticate, validate(trackingValidators.setEstimatedDelivery), TrackingController.setEstimatedDelivery);

// Mark order as delivered (Admin/Delivery Partner)
router.post('/:orderId/mark-delivered', authenticate, validate(trackingValidators.markAsDelivered), TrackingController.markAsDelivered);

/**
 * Development Routes
 */

// Simulate tracking updates
router.post('/:orderId/simulate', authenticate, isAdmin, TrackingController.simulateTrackingUpdates);

module.exports = router;

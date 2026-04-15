const express = require('express');
const router = express.Router();
const ReturnController = require('../controllers/return.controller');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { returnValidators } = require('../validators/validators');

/**
 * Protected Routes (Authenticated Users)
 */

// Create return request
router.post('/', authenticate, validate(returnValidators.createReturnRequest), ReturnController.createReturnRequest);

// Get user's return requests
router.get('/', authenticate, ReturnController.getUserReturns);

// Check return eligibility for order
router.get('/check-eligibility/:orderId', authenticate, ReturnController.checkReturnEligibility);

// Get return details
router.get('/:returnId', authenticate, ReturnController.getReturnDetails);

// Update return status
router.patch('/:returnId/status', authenticate, validate(returnValidators.updateReturnStatus), ReturnController.updateReturnStatus);

/**
 * Admin Routes
 */

// Approve return (Admin)
router.patch('/:returnId/approve', authenticate, isAdmin, validate(returnValidators.approveReturn), ReturnController.approveReturn);

// Reject return (Admin)
router.patch('/:returnId/reject', authenticate, isAdmin, validate(returnValidators.rejectReturn), ReturnController.rejectReturn);

// Initiate refund for approved return
router.post('/:returnId/initiate-refund', authenticate, isAdmin, ReturnController.initiateRefund);

module.exports = router;

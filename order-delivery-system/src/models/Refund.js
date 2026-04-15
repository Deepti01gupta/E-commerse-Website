const mongoose = require('mongoose');

// Refund Status Enum
const REFUND_STATUS = {
  PENDING: 'pending',
  PROCESSED: 'processed',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

const refundSchema = new mongoose.Schema(
  {
    refundId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    returnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Return',
      required: false
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    // Refund Details
    amount: {
      type: Number,
      required: true
    },
    reason: String, // e.g., "Product return", "Order cancellation"
    refundType: {
      type: String,
      enum: ['full', 'partial'],
      default: 'full'
    },
    
    // Status Tracking
    status: {
      type: String,
      enum: Object.values(REFUND_STATUS),
      default: REFUND_STATUS.PENDING,
      index: true
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        message: String,
        transactionId: String
      }
    ],
    
    // Payment Gateway Details
    originalPaymentId: String,
    originalPaymentMethod: String,
    refundTransactionId: String,
    
    // Timestamps
    initiatedAt: { type: Date, default: Date.now },
    processedAt: Date,
    completedAt: Date,
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Method to update refund status
refundSchema.methods.updateStatus = function (status, message, transactionId = null) {
  this.status = status;
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    message,
    transactionId
  });
  
  if (status === REFUND_STATUS.PROCESSED) {
    this.processedAt = new Date();
  } else if (status === REFUND_STATUS.COMPLETED) {
    this.completedAt = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('Refund', refundSchema);
module.exports.REFUND_STATUS = REFUND_STATUS;

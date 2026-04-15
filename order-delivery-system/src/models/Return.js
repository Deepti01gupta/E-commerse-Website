const mongoose = require('mongoose');

// Return Status Enum
const RETURN_STATUS = {
  INITIATED: 'initiated',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SHIPPED_BACK: 'shipped_back',
  RECEIVED: 'received',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const returnSchema = new mongoose.Schema(
  {
    returnId: {
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    // Return Request Details
    reason: {
      type: String,
      required: true,
      enum: [
        'defective_product',
        'not_as_described',
        'damaged_in_shipping',
        'wrong_item_received',
        'changed_mind',
        'other'
      ]
    },
    description: String,
    
    // Return Items
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        quantity: Number,
        price: Number
      }
    ],
    returnAmount: Number, // Amount to be refunded
    
    // Status Tracking
    status: {
      type: String,
      enum: Object.values(RETURN_STATUS),
      default: RETURN_STATUS.INITIATED,
      index: true
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        message: String,
        adminNote: String,
        updatedBy: mongoose.Schema.Types.ObjectId // Admin ID
      }
    ],
    
    // Return Address (where to send product back)
    returnAddress: {
      fullName: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      phone: String
    },
    
    // Return Shipping
    returnTrackingNumber: String,
    returnCarrier: String,
    
    // Admin Actions
    adminApprovalNotes: String,
    rejectionReason: String,
    
    // Eligibility Checks
    isEligible: Boolean,
    eligibilityCheckNotes: String,
    
    // Timestamps
    initiatedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    completedAt: Date,
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Method to update status
returnSchema.methods.updateStatus = function (newStatus, message, adminId = null, adminNote = null) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    message,
    adminNote,
    updatedBy: adminId
  });
  
  if (newStatus === RETURN_STATUS.APPROVED) {
    this.approvedAt = new Date();
  } else if (newStatus === RETURN_STATUS.COMPLETED) {
    this.completedAt = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('Return', returnSchema);
module.exports.RETURN_STATUS = RETURN_STATUS;

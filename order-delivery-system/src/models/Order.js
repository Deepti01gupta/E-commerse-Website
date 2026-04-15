const mongoose = require('mongoose');

// Order Status Enum
const ORDER_STATUS = {
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
};

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        subtotal: Number
      }
    ],
    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    },
    pricing: {
      subtotal: Number,
      tax: Number,
      shippingCharge: Number,
      discountAmount: Number,
      couponCode: String,
      total: Number
    },
    paymentMethod: String, // razorpay, stripe, upi, wallet
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentId: String,
    
    // Order Status Tracking
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
      index: true
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        message: String,
        location: String // for delivery tracking
      }
    ],
    
    // Tracking Information
    trackingNumber: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    carrier: String, // courier name
    
    // Delivery Location (for live tracking simulation)
    currentLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
      updatedAt: Date
    },
    
    // Return & Refund
    returnEligible: {
      type: Boolean,
      default: false
    },
    returnDeadline: Date,
    
    // Timestamps
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Middleware to update updatedAt
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add status update
orderSchema.methods.addStatusUpdate = function (status, message, location = null) {
  this.status = status;
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    message,
    location
  });
  
  // Auto-set dates
  if (status === ORDER_STATUS.DELIVERED) {
    this.actualDeliveryDate = new Date();
    this.returnEligible = true;
    this.returnDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  }
  
  return this.save();
};

// Method to get order progress percentage
orderSchema.methods.getProgressPercentage = function () {
  const statusProgression = [
    ORDER_STATUS.PLACED,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED
  ];
  
  const statusIndex = statusProgression.indexOf(this.status);
  return statusIndex === -1 ? 0 : ((statusIndex + 1) / statusProgression.length) * 100;
};

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUS = ORDER_STATUS;

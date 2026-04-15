const mongoose = require('mongoose');

// Booked Order Status Enum
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  CONVERTED_TO_PURCHASE: 'converted_to_purchase'
};

const bookedOrderSchema = new mongoose.Schema(
  {
    bookingId: {
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
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        sellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        subtotal: Number
      }
    ],
    bookingDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    expectedBookingDate: {
      type: Date,
      required: true
    },
    bookingAddress: {
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
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
      index: true
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        message: String
      }
    ],
    notes: String,
    convertedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    // Timestamps
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Middleware to update updatedAt
bookedOrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add status update
bookedOrderSchema.methods.addStatusUpdate = function (status, message) {
  this.status = status;
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    message
  });
  return this.save();
};

// Method to convert booking to actual order
bookedOrderSchema.methods.convertToOrder = function (orderId) {
  this.status = BOOKING_STATUS.CONVERTED_TO_PURCHASE;
  this.convertedOrderId = orderId;
  this.statusHistory.push({
    status: BOOKING_STATUS.CONVERTED_TO_PURCHASE,
    timestamp: new Date(),
    message: 'Booking converted to purchase order'
  });
  return this.save();
};

// Method to cancel booking
bookedOrderSchema.methods.cancelBooking = function (reason = '') {
  this.status = BOOKING_STATUS.CANCELLED;
  this.statusHistory.push({
    status: BOOKING_STATUS.CANCELLED,
    timestamp: new Date(),
    message: reason || 'Booking cancelled by user'
  });
  return this.save();
};

module.exports = mongoose.model('BookedOrder', bookedOrderSchema);

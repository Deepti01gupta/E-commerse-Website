const mongoose = require("mongoose");

// Order status: pending -> processing -> completed OR failed
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    orderId: {
      type: String,
      unique: true,
      required: true
    },
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        quantity: Number,
        subtotal: Number
      }
    ],
    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      street: String,
      city: String,
      pincode: String,
      state: String,
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
    paymentMethod: {
      type: String,
      enum: ["stripe", "razorpay", "upi", "netbanking", "wallet"],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
      index: true
    },
    paymentId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    stripePaymentIntentId: String,
    invoiceUrl: String,
    invoiceGenerated: {
      type: Boolean,
      default: false
    },
    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

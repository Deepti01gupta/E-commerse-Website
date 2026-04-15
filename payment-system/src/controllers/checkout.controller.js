const Order = require("../models/Order");
const { generateOrderId, calculateTax, calculateOrderTotal } = require("../utils/helpers");
const { validateCoupon } = require("../services/coupon.service");
const { calculateShippingCharge } = require("../services/delivery.service");
const stripeService = require("../services/stripe.service");
const razorpayService = require("../services/razorpay.service");

const initiateCheckout = async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotalRounded = Math.round(subtotal * 100) / 100;

  // Apply coupon if provided
  let discountAmount = 0;
  if (couponCode) {
    const couponResult = await validateCoupon({
      code: couponCode,
      cartTotal: subtotalRounded
    });

    if (!couponResult.valid) {
      return res.status(400).json({
        success: false,
        message: couponResult.message
      });
    }

    discountAmount = couponResult.discountAmount;
  }

  // Calculate shipping
  const shippingResult = await calculateShippingCharge({
    pincode: shippingAddress.pincode,
    cartTotal: subtotalRounded,
    productWeight: 0
  });

  if (!shippingResult.charge && shippingResult.message) {
    return res.status(400).json({
      success: false,
      message: shippingResult.message
    });
  }

  // Calculate tax
  const taxableAmount = subtotalRounded - discountAmount;
  const tax = calculateTax(taxableAmount);

  // Calculate total
  const total = calculateOrderTotal({
    subtotal: subtotalRounded,
    tax,
    shippingCharge: shippingResult.charge,
    discountAmount
  });

  const orderId = generateOrderId();

  // Create new order
  const order = new Order({
    userId: req.user?._id,
    orderId,
    items,
    shippingAddress,
    pricing: {
      subtotal: subtotalRounded,
      tax,
      shippingCharge: shippingResult.charge,
      discountAmount,
      couponCode: couponCode || null,
      total
    },
    paymentMethod,
    paymentStatus: "pending"
  });

  await order.save();

  // Initialize payment based on method
  let paymentData = {};

  if (paymentMethod === "stripe") {
    const intent = await stripeService.createPaymentIntent({
      amount: total,
      metadata: { orderId: order._id }
    });

    paymentData = {
      clientSecret: intent.client_secret,
      stripePaymentIntentId: intent.id
    };

    order.stripePaymentIntentId = intent.id;
    await order.save();
  } else if (paymentMethod === "razorpay") {
    const razorpayOrder = await razorpayService.createOrder({
      amount: total,
      orderId: order._id,
      userEmail: shippingAddress.email,
      userName: shippingAddress.fullName
    });

    paymentData = {
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    };

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
  }

  return res.status(200).json({
    success: true,
    message: "Checkout initiated",
    order: {
      _id: order._id,
      orderId: order.orderId,
      total: order.pricing.total,
      paymentMethod: order.paymentMethod
    },
    paymentData
  });
};

const verifyRazorpayPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  // Verify Razorpay signature
  const isSignatureValid = razorpayService.verifySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isSignatureValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment signature"
    });
  }

  // Fetch payment details from Razorpay
  const payment = await razorpayService.fetchPayment(razorpayPaymentId);

  if (payment.status !== "captured") {
    return res.status(400).json({
      success: false,
      message: "Payment not captured"
    });
  }

  // Update order
  const order = await Order.findOne({ orderId });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found"
    });
  }

  order.paymentStatus = "completed";
  order.razorpayPaymentId = razorpayPaymentId;
  order.paymentId = razorpayPaymentId;
  await order.save();

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    order
  });
};

module.exports = {
  initiateCheckout,
  verifyRazorpayPayment
};

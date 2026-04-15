/**
 * Notification Event Emitter
 * Triggers notifications on various order and delivery events
 */

const EventEmitter = require('events');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
const User = require('../models/User');
const DeviceToken = require('../models/DeviceToken');

const emailService = require('./emailService');
const { PushNotificationService } = require('./pushNotificationService');
const SMSService = require('./smsService');

class NotificationEmitter extends EventEmitter {
  constructor() {
    super();
    this.setupListeners();
  }

  /**
   * Setup all event listeners
   */
  setupListeners() {
    // Order events
    this.on('order:created', this.handleOrderCreated.bind(this));
    this.on('order:confirmed', this.handleOrderConfirmed.bind(this));
    this.on('order:shipped', this.handleOrderShipped.bind(this));
    this.on('order:delivered', this.handleOrderDelivered.bind(this));

    // Delivery events
    this.on('delivery:delayed', this.handleDeliveryDelayed.bind(this));
    this.on('delivery:updated', this.handleDeliveryUpdated.bind(this));

    // Return events
    this.on('return:initiated', this.handleReturnInitiated.bind(this));
    this.on('return:approved', this.handleReturnApproved.bind(this));

    // Refund events
    this.on('refund:processed', this.handleRefundProcessed.bind(this));

    // User events
    this.on('user:passwordReset', this.handlePasswordReset.bind(this));
    this.on('user:registered', this.handleUserRegistered.bind(this));

    // Offer events
    this.on('offer:available', this.handleOfferAvailable.bind(this));

    // Review events
    this.on('review:requested', this.handleReviewRequested.bind(this));
  }

  /**
   * Send notification via all enabled channels
   */
  async sendNotification(userId, notificationData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error('User not found:', userId);
        return;
      }

      // Get user preferences
      const prefs = user.notificationPreferences || {};

      // Get user's devices
      const deviceTokens = await DeviceToken.getActiveTokens(userId);

      // Create notification record
      const notification = await Notification.createNotification({
        userId,
        ...notificationData,
        recipient: {
          email: user.email,
          phone: user.phone
        }
      });

      // Send email if enabled
      if (prefs.email?.[notificationData.eventType] !== false) {
        try {
          await emailService.send(
            user.email,
            notificationData.subject,
            notificationData.htmlContent || notificationData.message
          );
          console.log('✅ Email notification sent:', notification._id);
        } catch (error) {
          console.error('❌ Email notification failed:', error.message);
        }
      }

      // Send SMS if enabled
      if (prefs.sms?.[notificationData.eventType] !== false && user.phone) {
        try {
          await SMSService.send(
            user.phone,
            notificationData.message
          );
          console.log('✅ SMS notification sent:', notification._id);
        } catch (error) {
          console.error('❌ SMS notification failed:', error.message);
        }
      }

      // Send push if enabled and devices available
      if (prefs.push?.[notificationData.eventType] !== false && deviceTokens.length > 0) {
        try {
          await PushNotificationService.sendToMultiple(
            deviceTokens.map(dt => dt.token),
            notificationData.subject,
            notificationData.message,
            notificationData.data || {}
          );
          console.log('✅ Push notification sent:', notification._id);
        } catch (error) {
          console.error('❌ Push notification failed:', error.message);
        }
      }

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * ============ ORDER EVENTS ============
   */

  /**
   * Handle order creation
   */
  async handleOrderCreated(orderData) {
    console.log('📢 Event: order:created', orderData.orderId);

    const order = await Order.findById(orderData.orderId).populate('userId');
    if (!order) return;

    await this.sendNotification(order.userId._id, {
      type: 'email',
      eventType: 'order_placed',
      subject: `✅ Order Received - Order #${order._id}`,
      message: `Your order #${order._id} has been received. We'll notify you when it ships!`,
      htmlContent: `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total:</strong> ₹${order.totalPrice}</p>
        <p><strong>Items:</strong> ${order.items.length}</p>
        <p>We'll ship your order soon!</p>
      `,
      data: {
        orderId: order._id.toString(),
        orderTotal: order.totalPrice
      }
    });
  }

  /**
   * Handle order confirmation
   */
  async handleOrderConfirmed(orderData) {
    console.log('📢 Event: order:confirmed', orderData.orderId);

    const order = await Order.findById(orderData.orderId).populate('userId');
    if (!order) return;

    await this.sendNotification(order.userId._id, {
      type: 'email',
      eventType: 'order_confirmed',
      subject: `✅ Order Confirmed - #${order._id}`,
      message: `Order #${order._id} is confirmed and being prepared.`,
      htmlContent: `
        <h1>Order Confirmed</h1>
        <p>Your order has been confirmed!</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p>Status: Ready to ship</p>
      `,
      data: {
        orderId: order._id.toString()
      }
    });
  }

  /**
   * Handle order shipment
   */
  async handleOrderShipped(shippingData) {
    console.log('📢 Event: order:shipped', shippingData.orderId);

    const order = await Order.findById(shippingData.orderId).populate('userId');
    if (!order) return;

    await this.sendNotification(order.userId._id, {
      type: 'email',
      eventType: 'order_shipped',
      subject: `📦 Your Order Has Shipped - #${order._id}`,
      message: `Order #${order._id} has shipped! Tracking: ${shippingData.trackingNumber}`,
      htmlContent: `
        <h1>Order Shipped</h1>
        <p>Great news! Your order is on the way.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Carrier:</strong> ${shippingData.carrier}</p>
        <p><strong>Tracking Number:</strong> ${shippingData.trackingNumber}</p>
        <a href="${process.env.FRONTEND_URL}/track/${shippingData.trackingNumber}">Track Your Order</a>
      `,
      data: {
        orderId: order._id.toString(),
        trackingNumber: shippingData.trackingNumber,
        carrier: shippingData.carrier
      }
    });
  }

  /**
   * Handle order delivery
   */
  async handleOrderDelivered(deliveryData) {
    console.log('📢 Event: order:delivered', deliveryData.orderId);

    const order = await Order.findById(deliveryData.orderId).populate('userId');
    if (!order) return;

    await this.sendNotification(order.userId._id, {
      type: 'email',
      eventType: 'order_delivered',
      subject: `🎉 Order Delivered - #${order._id}`,
      message: `Order #${order._id} has been delivered! Please leave a review.`,
      htmlContent: `
        <h1>Order Delivered</h1>
        <p>Your order has arrived!</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Delivered On:</strong> ${new Date(deliveryData.deliveredAt).toLocaleDateString()}</p>
        <a href="${process.env.FRONTEND_URL}/review/${order._id}">Leave a Review</a>
      `,
      data: {
        orderId: order._id.toString(),
        deliveryDate: new Date(deliveryData.deliveredAt).toLocaleDateString()
      }
    });
  }

  /**
   * ============ DELIVERY EVENTS ============
   */

  /**
   * Handle delivery delay
   */
  async handleDeliveryDelayed(delayData) {
    console.log('📢 Event: delivery:delayed', delayData.orderId);

    const order = await Order.findById(delayData.orderId).populate('userId');
    if (!order) return;

    await this.sendNotification(order.userId._id, {
      type: 'email',
      eventType: 'delivery_delayed',
      subject: `⏰ Delivery Delay Notification - #${order._id}`,
      message: `Your delivery is delayed. New expected date: ${delayData.newEstimatedDate}`,
      htmlContent: `
        <h1>Delivery Delay</h1>
        <p>Unfortunately, your order delivery is delayed.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Original Expected:</strong> ${delayData.originalDate}</p>
        <p><strong>New Expected:</strong> ${delayData.newEstimatedDate}</p>
        <p>We apologize for the inconvenience.</p>
      `,
      data: {
        orderId: order._id.toString(),
        newEstimatedDate: delayData.newEstimatedDate
      }
    });
  }

  /**
   * Handle delivery update
   */
  async handleDeliveryUpdated(updateData) {
    console.log('📢 Event: delivery:updated', updateData.orderId);

    const order = await Order.findById(updateData.orderId).populate('userId');
    if (!order) return;

    await this.sendNotification(order.userId._id, {
      type: 'email',
      eventType: 'delivery_updated',
      subject: `📍 Delivery Update - #${order._id}`,
      message: `Your order update: ${updateData.status}. Est. ${updateData.estimatedTime}`,
      htmlContent: `
        <h1>Delivery Update</h1>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Status:</strong> ${updateData.status}</p>
        <p><strong>Estimated Delivery:</strong> ${updateData.estimatedTime}</p>
      `,
      data: {
        orderId: order._id.toString(),
        status: updateData.status
      }
    });
  }

  /**
   * ============ RETURN EVENTS ============
   */

  /**
   * Handle return initiation
   */
  async handleReturnInitiated(returnData) {
    console.log('📢 Event: return:initiated', returnData.returnId);

    const order = await Order.findById(returnData.orderId).populate('userId');
    if (!order) return;

    await this.sendNotification(order.userId._id, {
      type: 'email',
      eventType: 'return_initiated',
      subject: `📋 Return Request Initiated - #${returnData.returnId}`,
      message: `Your return request has been initiated.`,
      htmlContent: `
        <h1>Return Request</h1>
        <p>Your return request has been recorded.</p>
        <p><strong>Return ID:</strong> ${returnData.returnId}</p>
        <p><strong>Order ID:</strong> ${returnData.orderId}</p>
        <p>We'll contact you with pickup details soon.</p>
      `,
      data: {
        returnId: returnData.returnId,
        orderId: returnData.orderId
      }
    });
  }

  /**
   * Handle return approval
   */
  async handleReturnApproved(returnData) {
    console.log('📢 Event: return:approved', returnData.returnId);

    const order = await Order.findById(returnData.orderId).populate('userId');
    if (!order) return;

    await this.sendNotification(order.userId._id, {
      type: 'email',
      eventType: 'return_approved',
      subject: `✅ Return Approved - #${returnData.returnId}`,
      message: `Your return has been approved. Generate pickup label.`,
      htmlContent: `
        <h1>Return Approved</h1>
        <p>Your return request has been <strong>approved</strong>!</p>
        <p><strong>Return ID:</strong> ${returnData.returnId}</p>
        <p><a href="${process.env.FRONTEND_URL}/generate-label/${returnData.returnId}">Generate Pickup Label</a></p>
      `,
      data: {
        returnId: returnData.returnId,
        orderId: returnData.orderId
      }
    });
  }

  /**
   * ============ REFUND EVENTS ============
   */

  /**
   * Handle refund processing
   */
  async handleRefundProcessed(refundData) {
    console.log('📢 Event: refund:processed', refundData.refundId);

    const order = await Order.findById(refundData.orderId).populate('userId');
    if (!order) return;

    await this.sendNotification(order.userId._id, {
      type: 'email',
      eventType: 'refund_processed',
      subject: `💰 Refund Processed - ₹${refundData.amount}`,
      message: `Your refund of ₹${refundData.amount} has been initiated.`,
      htmlContent: `
        <h1>Refund Processed</h1>
        <p>Your refund has been processed successfully!</p>
        <p><strong>Refund Amount:</strong> ₹${refundData.amount}</p>
        <p><strong>Refund ID:</strong> ${refundData.refundId}</p>
        <p>The amount will appear in your account within 3-5 business days.</p>
      `,
      data: {
        refundId: refundData.refundId,
        amount: refundData.amount
      }
    });
  }

  /**
   * ============ USER EVENTS ============
   */

  /**
   * Handle password reset request
   */
  async handlePasswordReset(userData) {
    console.log('📢 Event: user:passwordReset', userData.userId);

    const user = await User.findById(userData.userId);
    if (!user) return;

    await this.sendNotification(user._id, {
      type: 'email',
      eventType: 'password_reset',
      subject: '🔐 Reset Your Password',
      message: 'Click the link below to reset your password. Valid for 24 hours.',
      htmlContent: `
        <h1>Password Reset</h1>
        <p>We received a request to reset your password.</p>
        <p><a href="${userData.resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">Reset Password</a></p>
        <p>Valid for 24 hours. If you didn't request this, ignore this email.</p>
      `,
      data: {
        resetToken: userData.resetToken
      }
    });
  }

  /**
   * Handle user registration
   */
  async handleUserRegistered(userData) {
    console.log('📢 Event: user:registered', userData.userId);

    const user = await User.findById(userData.userId);
    if (!user) return;

    await this.sendNotification(user._id, {
      type: 'email',
      eventType: 'user_registered',
      subject: '👋 Welcome to Our Platform!',
      message: 'Welcome! Your account has been created successfully.',
      htmlContent: `
        <h1>Welcome to Our Platform!</h1>
        <p>Hi ${user.firstName},</p>
        <p>Your account has been created successfully.</p>
        <p><a href="${process.env.FRONTEND_URL}/shop">Start Shopping</a></p>
      `,
      data: {}
    });
  }

  /**
   * ============ OFFER EVENTS ============
   */

  /**
   * Handle offer availability
   */
  async handleOfferAvailable(offerData) {
    console.log('📢 Event: offer:available', offerData.offerId);

    // Send to all users subscribed to offers topic
    await PushNotificationService.sendToTopic(
      'offers',
      '🎁 Special Offer!',
      `Get ${offerData.discountPercentage}% off on ${offerData.offerTitle}`,
      {
        type: 'offer_available',
        offerId: offerData.offerId
      }
    );
  }

  /**
   * ============ REVIEW EVENTS ============
   */

  /**
   * Handle review request
   */
  async handleReviewRequested(reviewData) {
    console.log('📢 Event: review:requested', reviewData.orderId);

    const order = await Order.findById(reviewData.orderId).populate('userId');
    if (!order) return;

    await this.sendNotification(order.userId._id, {
      type: 'email',
      eventType: 'review_requested',
      subject: '⭐ Share Your Feedback',
      message: `How was your experience? Please leave a review.`,
      htmlContent: `
        <h1>We'd Love Your Feedback!</h1>
        <p>Order #${order._id} has been delivered. How was your experience?</p>
        <p><a href="${process.env.FRONTEND_URL}/review/${order._id}">Leave a Review</a></p>
      `,
      data: {
        orderId: order._id.toString()
      }
    });
  }
}

// Create and export singleton instance
module.exports = new NotificationEmitter();

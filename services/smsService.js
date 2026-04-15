/**
 * SMS Notification Service
 * Handles sending SMS via Twilio
 */

const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * SMS Templates
 */
const templates = {
  orderConfirmation: ({ orderId, orderTotal }) => 
    `Hi! Your order #${orderId} has been confirmed. Total: ₹${orderTotal}. Track it at ${process.env.FRONTEND_URL}/track`,

  orderShipped: ({ orderId, trackingNumber, carrier }) =>
    `Your order #${orderId} has been shipped with ${carrier}. Tracking: ${trackingNumber}. Link: ${process.env.FRONTEND_URL}/track/${trackingNumber}`,

  orderDelivered: ({ orderId }) =>
    `Great! Your order #${orderId} has been delivered. Rate your experience: ${process.env.FRONTEND_URL}/review/${orderId}`,

  deliveryUpdate: ({ orderId, status, estimatedTime }) =>
    `Order #${orderId} update: ${status}. Expected delivery: ${estimatedTime}. Track: ${process.env.FRONTEND_URL}/track`,

  returnInitiated: ({ orderId, returnId }) =>
    `Return request for order #${orderId} has been initiated (ID: ${returnId}). Status: ${process.env.FRONTEND_URL}/returns`,

  refundProcessed: ({ orderId, amount }) =>
    `Your refund of ₹${amount} for order #${orderId} is being processed. It will appear in 3-5 business days.`,

  offerAlert: ({ offerTitle, discountPercentage, expiryDays }) =>
    `🎁 Special Offer! Get ${discountPercentage}% off on ${offerTitle}. Valid for ${expiryDays} days. Shop: ${process.env.FRONTEND_URL}/offers`,

  passwordReset: ({ resetLink }) =>
    `Click here to reset your password: ${resetLink}. Valid for 24 hours. Don't share this link.`
};

/**
 * SMS Service Functions
 */
const SMSService = {
  /**
   * Send SMS to phone number
   * Phone format: +919876543210 (with country code)
   */
  send: async (phoneNumber, message) => {
    try {
      // Validate phone number format
      if (!phoneNumber.startsWith('+')) {
        throw new Error('Phone number must include country code (e.g., +919876543210)');
      }

      // Ensure message length is within SMS limits (160 chars for basic, 1530 for concatenated)
      if (message.length > 1530) {
        throw new Error('Message exceeds maximum length');
      }

      const smsResponse = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      console.log('✅ SMS sent:', smsResponse.sid);

      return {
        success: true,
        sid: smsResponse.sid,
        status: smsResponse.status,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ SMS send failed:', error.message);
      return {
        success: false,
        error: {
          code: error.code || 'SMS_ERROR',
          message: error.message
        }
      };
    }
  },

  /**
   * Send order confirmation SMS
   */
  sendOrderConfirmation: async (phoneNumber, orderData) => {
    const message = templates.orderConfirmation({
      orderId: orderData.orderId,
      orderTotal: orderData.orderTotal
    });

    return SMSService.send(phoneNumber, message);
  },

  /**
   * Send order shipped SMS with tracking
   */
  sendOrderShipped: async (phoneNumber, shippingData) => {
    const message = templates.orderShipped({
      orderId: shippingData.orderId,
      trackingNumber: shippingData.trackingNumber,
      carrier: shippingData.carrier || 'Standard Shipping'
    });

    return SMSService.send(phoneNumber, message);
  },

  /**
   * Send order delivered SMS
   */
  sendOrderDelivered: async (phoneNumber, deliveryData) => {
    const message = templates.orderDelivered({
      orderId: deliveryData.orderId
    });

    return SMSService.send(phoneNumber, message);
  },

  /**
   * Send delivery update SMS
   */
  sendDeliveryUpdate: async (phoneNumber, updateData) => {
    const message = templates.deliveryUpdate({
      orderId: updateData.orderId,
      status: updateData.status,
      estimatedTime: updateData.estimatedTime
    });

    return SMSService.send(phoneNumber, message);
  },

  /**
   * Send return initiated SMS
   */
  sendReturnInitiated: async (phoneNumber, returnData) => {
    const message = templates.returnInitiated({
      orderId: returnData.orderId,
      returnId: returnData.returnId
    });

    return SMSService.send(phoneNumber, message);
  },

  /**
   * Send refund processed SMS
   */
  sendRefundProcessed: async (phoneNumber, refundData) => {
    const message = templates.refundProcessed({
      orderId: refundData.orderId,
      amount: refundData.amount
    });

    return SMSService.send(phoneNumber, message);
  },

  /**
   * Send offer alert SMS
   */
  sendOfferAlert: async (phoneNumber, offerData) => {
    const message = templates.offerAlert({
      offerTitle: offerData.offerTitle,
      discountPercentage: offerData.discountPercentage,
      expiryDays: offerData.expiryDays || 7
    });

    return SMSService.send(phoneNumber, message);
  },

  /**
   * Send password reset SMS
   */
  sendPasswordReset: async (phoneNumber, resetData) => {
    const message = templates.passwordReset({
      resetLink: resetData.resetLink
    });

    return SMSService.send(phoneNumber, message);
  },

  /**
   * Get SMS status
   */
  getStatus: async (smsId) => {
    try {
      const message = await client.messages(smsId).fetch();
      return {
        success: true,
        status: message.status,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated
      };
    } catch (error) {
      console.error('❌ Failed to get SMS status:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Test connection
   */
  verifyConnection: async () => {
    try {
      // Test by fetching account info
      const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      console.log('✅ SMS service (Twilio) is ready');
      return true;
    } catch (error) {
      console.error('❌ SMS service error:', error.message);
      return false;
    }
  }
};

module.exports = SMSService;

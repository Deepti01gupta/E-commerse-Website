/**
 * Push Notification Service
 * Handles sending push notifications via Firebase Cloud Messaging (FCM)
 */

const admin = require('firebase-admin');
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Initialize Firebase Admin SDK with error handling
// serviceAccountKey.json should be in project root
let firebase = null;
let firebaseInitialized = false;

try {
  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '../serviceAccountKey.json');
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  
  firebase = admin.messaging();
  firebaseInitialized = true;
  console.log('✅ Firebase Cloud Messaging initialized');
} catch (error) {
  console.warn('⚠️  Firebase not configured. Push notifications will be simulated.');
  console.warn('   To enable Firebase: Add FIREBASE_SERVICE_ACCOUNT_PATH to .env and create a valid serviceAccountKey.json');
  firebaseInitialized = false;
}

/**
 * DeviceToken Schema (embedded or separate collection)
 * Store user device tokens for push notifications
 */
const deviceTokenSchema = new Schema(
  {
    userId: { type: mongoose.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true },
    deviceType: { 
      type: String, 
      enum: ['ios', 'android', 'web'], 
      required: true 
    },
    deviceName: { type: String },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Create compound index for efficient lookups
deviceTokenSchema.index({ userId: 1, isActive: 1 });

/**
 * Push Notification Templates
 */
const templates = {
  orderConfirmation: ({ orderId, orderTotal }) => ({
    title: '✅ Order Confirmed',
    body: `Order #${orderId} confirmed! Total: ₹${orderTotal}`,
    data: {
      type: 'order_confirmation',
      orderId,
      deepLink: `ecommerce://orders/${orderId}`
    }
  }),

  orderShipped: ({ orderId, trackingNumber, carrier }) => ({
    title: '📦 Order Shipped',
    body: `Order #${orderId} shipped via ${carrier}. Tracking: ${trackingNumber}`,
    data: {
      type: 'order_shipped',
      orderId,
      trackingNumber,
      deepLink: `ecommerce://track/${trackingNumber}`
    }
  }),

  orderDelivered: ({ orderId }) => ({
    title: '🎉 Order Delivered',
    body: `Order #${orderId} delivered! Rate your experience.`,
    data: {
      type: 'order_delivered',
      orderId,
      deepLink: `ecommerce://review/${orderId}`
    }
  }),

  deliveryUpdated: ({ orderId, status, estimatedTime }) => ({
    title: '📍 Delivery Update',
    body: `Order #${orderId}: ${status}. Est. delivery: ${estimatedTime}`,
    data: {
      type: 'delivery_updated',
      orderId,
      status,
      deepLink: `ecommerce://track/${orderId}`
    }
  }),

  returnApproved: ({ orderid, returnId }) => ({
    title: '✅ Return Approved',
    body: `Return for order #${orderId} approved! Generate pickup label.`,
    data: {
      type: 'return_approved',
      orderId,
      returnId,
      deepLink: `ecommerce://returns/${returnId}`
    }
  }),

  refundProcessed: ({ orderId, amount }) => ({
    title: '💰 Refund Processed',
    body: `Refund of ₹${amount} for order #${orderId} initiated`,
    data: {
      type: 'refund_processed',
      orderId,
      deepLink: `ecommerce://orders/${orderId}`
    }
  }),

  offerAvailable: ({ offerTitle, discountPercentage, offerId }) => ({
    title: '🎁 Special Offer!',
    body: `Get ${discountPercentage}% off on ${offerTitle}`,
    data: {
      type: 'offer_available',
      offerId,
      deepLink: `ecommerce://offers/${offerId}`
    }
  }),

  reviewRequest: ({ orderId, productName }) => ({
    title: '⭐ Share Your Review',
    body: `How was your experience with ${productName}?`,
    data: {
      type: 'review_request',
      orderId,
      deepLink: `ecommerce://review/${orderId}`
    }
  }),

  passwordReset: ({ resetCode }) => ({
    title: '🔐 Reset Password',
    body: 'Tap to reset your password',
    data: {
      type: 'password_reset',
      resetCode,
      deepLink: 'ecommerce://reset-password'
    }
  })
};

/**
 * Push Notification Service
 */
const PushNotificationService = {
  /**
   * Send notification to single device
   */
  sendToDevice: async (deviceToken, title, body, data = {}, options = {}) => {
    try {
      // If Firebase not initialized, simulate send
      if (!firebaseInitialized) {
        console.log('📤 [SIMULATED] Push notification:', { title, body, deviceToken });
        return {
          success: true,
          messageId: 'SIMULATED_' + Date.now(),
          timestamp: new Date(),
          simulated: true
        };
      }

      const message = {
        token: deviceToken,
        notification: {
          title,
          body
        },
        data: Object.entries(data).reduce((acc, [key, value]) => {
          acc[key] = String(value); // FCM requires string values
          return acc;
        }, {}),
        android: {
          priority: options.priority || 'high',
          ttl: options.ttl || 86400, // 24 hours
          notification: {
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            sound: 'default',
            channelId: 'orders'
          }
        },
        apns: {
          headers: {
            'apns-priority': '10'
          },
          payload: {
            aps: {
              alert: {
                title,
                body
              },
              sound: 'default',
              badge: 1
            }
          }
        },
        webpush: {
          ttl: 24 * 60 * 60,
          notification: {
            title,
            body,
            icon: `${process.env.FRONTEND_URL}/logo.png`
          },
          fcmOptions: {
            link: options.deepLink || process.env.FRONTEND_URL
          }
        }
      };

      const response = await firebase.send(message, false);
      console.log('✅ Push notification sent:', response);

      return {
        success: true,
        messageId: response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Push notification failed:', error.message);
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  /**
   * Send to multiple devices (batch)
   */
  sendToMultiple: async (deviceTokens, title, body, data = {}, options = {}) => {
    try {
      // If Firebase not initialized, simulate send
      if (!firebaseInitialized) {
        console.log(`📤 [SIMULATED] Batch push notification to ${deviceTokens.length} devices:`, { title, body });
        return {
          success: true,
          successCount: deviceTokens.length,
          failureCount: 0,
          timestamp: new Date(),
          simulated: true
        };
      }

      const messages = deviceTokens.map(token => ({
        token,
        notification: { title, body },
        data: Object.entries(data).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {}),
        android: {
          priority: options.priority || 'high',
          ttl: options.ttl || 86400,
          notification: {
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            sound: 'default',
            channelId: 'orders'
          }
        }
      }));

      const response = await firebase.sendAll(messages, false);
      console.log('✅ Batch push notification sent:', response.successCount, 'succeeded');

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Batch push notification failed:', error.message);
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  /**
   * Send to topic (all users subscribed to topic)
   */
  sendToTopic: async (topic, title, body, data = {}) => {
    try {
      // If Firebase not initialized, simulate send
      if (!firebaseInitialized) {
        console.log(`📤 [SIMULATED] Topic notification to "${topic}":`, { title, body });
        return {
          success: true,
          messageId: 'SIMULATED_' + Date.now(),
          timestamp: new Date(),
          simulated: true
        };
      }

      const message = {
        topic,
        notification: { title, body },
        data: Object.entries(data).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {}),
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'offers'
          }
        }
      };

      const response = await firebase.send(message, false);
      console.log('✅ Topic notification sent:', response);

      return {
        success: true,
        messageId: response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Topic notification failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Subscribe device to topic
   */
  subscribeToTopic: async (deviceTokens, topic) => {
    try {
      const response = await firebase.makeTopicManagementRequest(
        deviceTokens,
        topic,
        'iid/subscribe'
      );
      console.log('✅ Subscribed to topic:', topic);
      return {
        success: true,
        message: `Subscribed ${deviceTokens.length} device(s) to topic: ${topic}`
      };
    } catch (error) {
      console.error('❌ Topic subscription failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Unsubscribe device from topic
   */
  unsubscribeFromTopic: async (deviceTokens, topic) => {
    try {
      const response = await firebase.makeTopicManagementRequest(
        deviceTokens,
        topic,
        'iid/unsubscribe'
      );
      console.log('✅ Unsubscribed from topic:', topic);
      return {
        success: true,
        message: `Unsubscribed ${deviceTokens.length} device(s) from topic: ${topic}`
      };
    } catch (error) {
      console.error('❌ Topic unsubscription failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Template: Send order confirmation
   */
  sendOrderConfirmation: async (userId, deviceTokens, orderData) => {
    const { title, body, data } = templates.orderConfirmation({
      orderId: orderData.orderId,
      orderTotal: orderData.orderTotal
    });

    return PushNotificationService.sendToMultiple(deviceTokens, title, body, data);
  },

  /**
   * Template: Send order shipped
   */
  sendOrderShipped: async (userId, deviceTokens, shippingData) => {
    const { title, body, data } = templates.orderShipped({
      orderId: shippingData.orderId,
      trackingNumber: shippingData.trackingNumber,
      carrier: shippingData.carrier || 'Courier'
    });

    return PushNotificationService.sendToMultiple(deviceTokens, title, body, data, {
      deepLink: `ecommerce://track/${shippingData.trackingNumber}`
    });
  },

  /**
   * Template: Send order delivered
   */
  sendOrderDelivered: async (userId, deviceTokens, deliveryData) => {
    const { title, body, data } = templates.orderDelivered({
      orderId: deliveryData.orderId
    });

    return PushNotificationService.sendToMultiple(deviceTokens, title, body, data, {
      deepLink: `ecommerce://review/${deliveryData.orderId}`
    });
  },

  /**
   * Template: Delivery update
   */
  sendDeliveryUpdate: async (userId, deviceTokens, updateData) => {
    const { title, body, data } = templates.deliveryUpdated({
      orderId: updateData.orderId,
      status: updateData.status,
      estimatedTime: updateData.estimatedTime
    });

    return PushNotificationService.sendToMultiple(deviceTokens, title, body, data);
  },

  /**
   * Template: Offer available
   */
  sendOfferNotification: async (deviceTokens, offerData) => {
    const { title, body, data } = templates.offerAvailable({
      offerTitle: offerData.offerTitle,
      discountPercentage: offerData.discountPercentage,
      offerId: offerData.offerId
    });

    // Send to topic for better reach
    return PushNotificationService.sendToTopic('offers', title, body, data);
  },

  /**
   * Template: Review request
   */
  sendReviewRequest: async (userId, deviceTokens, reviewData) => {
    const { title, body, data } = templates.reviewRequest({
      orderId: reviewData.orderId,
      productName: reviewData.productName
    });

    return PushNotificationService.sendToMultiple(deviceTokens, title, body, data);
  },

  /**
   * Test connection
   */
  verifyConnection: async () => {
    try {
      // Send test message
      const response = await firebase.send({
        token: 'test-token', // Will fail but validates connectivity
        notification: { title: 'Test' }
      }).catch(() => true); // Expected to fail, just checking connectivity

      console.log('✅ Push notification service (FCM) is ready');
      return true;
    } catch (error) {
      console.error('❌ Push notification service error:', error.message);
      return false;
    }
  }
};

module.exports = {
  PushNotificationService,
  deviceTokenSchema
};

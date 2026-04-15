/**
 * Notification Schema
 * Stores all notifications sent to users across all channels
 * (email, push, SMS)
 */

const mongoose = require('mongoose');

// Notification Status Enum
const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  DELIVERED: 'delivered',
  BOUNCED: 'bounced'
};

// Notification Type Enum
const NOTIFICATION_TYPE = {
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms',
  IN_APP: 'in_app'
};

// Event Type Enum
const EVENT_TYPE = {
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  PAYMENT_RECEIVED: 'payment_received',
  PASSWORD_RESET: 'password_reset',
  OFFER_AVAILABLE: 'offer_available',
  DISCOUNT_ALERT: 'discount_alert',
  RETURN_INITIATED: 'return_initiated',
  REFUND_PROCESSED: 'refund_processed',
  DELIVERY_DELAYED: 'delivery_delayed',
  NEW_REVIEW: 'new_review'
};

const notificationSchema = new mongoose.Schema(
  {
    // Reference to user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Notification metadata
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
      index: true
    },

    eventType: {
      type: String,
      enum: Object.values(EVENT_TYPE),
      required: true
    },

    // Notification content
    subject: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    htmlContent: String, // For email HTML templates

    // Recipient information
    recipient: {
      email: String,
      phone: String,
      fcmToken: String
    },

    // Related entity references
    relatedData: {
      orderId: mongoose.Schema.Types.ObjectId,
      returnId: mongoose.Schema.Types.ObjectId,
      refundId: mongoose.Schema.Types.ObjectId,
      userId: mongoose.Schema.Types.ObjectId
    },

    // Tracking and status
    status: {
      type: String,
      enum: Object.values(NOTIFICATION_STATUS),
      default: NOTIFICATION_STATUS.PENDING,
      index: true
    },

    // For in-app notifications
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    // Retry tracking
    retryCount: {
      type: Number,
      default: 0
    },

    maxRetries: {
      type: Number,
      default: 3
    },

    lastRetryAt: Date,

    // Error information
    error: {
      code: String,
      message: String,
      details: String
    },

    // Provider-specific tracking
    externalId: String, // Email message ID, SMS SID, FCM message ID
    providerId: String, // Email provider ID, etc.

    // Delivery feedback
    deliveredAt: Date,
    readAt: Date,
    clickedAt: Date,

    // Tags for organization
    tags: [String],

    // Metadata for analytics
    metadata: mongoose.Schema.Types.Mixed,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    sentAt: Date,
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, status: 1 });
notificationSchema.index({ status: 1, createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as sent
notificationSchema.methods.markAsSent = function (externalId = null) {
  this.status = NOTIFICATION_STATUS.SENT;
  this.sentAt = new Date();
  if (externalId) {
    this.externalId = externalId;
  }
  return this.save();
};

// Method to mark as failed
notificationSchema.methods.markAsFailed = function (error) {
  this.status = NOTIFICATION_STATUS.FAILED;
  this.error = {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message,
    details: error.details
  };
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function (notificationData) {
  return new this(notificationData);
};

// Static method to find unread notifications for user
notificationSchema.statics.findUnread = function (userId) {
  return this.find({
    userId,
    isRead: false,
    type: { $ne: 'email' } // Email is not shown as unread in app
  }).sort({ createdAt: -1 });
};

// Static method to get notification history
notificationSchema.statics.getHistory = function (userId, limit = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_STATUS = NOTIFICATION_STATUS;
module.exports.NOTIFICATION_TYPE = NOTIFICATION_TYPE;
module.exports.EVENT_TYPE = EVENT_TYPE;

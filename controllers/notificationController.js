/**
 * Notification Controller
 * Handles notification operations and business logic
 */

const Notification = require('../models/Notification');
const DeviceToken = require('../models/DeviceToken');
const User = require('../models/User');
const Order = require('../models/Order');

const emailService = require('../services/emailService');
const { PushNotificationService } = require('../services/pushNotificationService');
const SMSService = require('../services/smsService');

/**
 * Get user notifications with pagination and filtering
 */
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, isRead } = req.query;
    const userId = req.user._id;

    // Build filter
    const filter = { userId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    // Count total
    const total = await Notification.countDocuments(filter);

    // Fetch paginated results
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get count of unread notifications
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get unread notifications
 */
exports.getUnreadNotifications = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user._id;

    const notifications = await Notification.findUnread(userId)
      .limit(limit * 1)
      .sort({ createdAt: -1 });

    const count = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount: count
    });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get full notification history for user
 */
exports.getNotificationHistory = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const userId = req.user._id;

    const notifications = await Notification.getHistory(userId, limit);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Mark single notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Verify ownership
    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Verify ownership
    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Notification.deleteOne({ _id: notificationId });

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Send test notification to user
 */
exports.sendTestNotification = async (req, res) => {
  try {
    const { type, channel } = req.body; // type: email/push/sms, channel: all channels or specific
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const testNotification = {
      userId,
      type: channel || 'email',
      eventType: 'test_notification',
      subject: '🧪 Test Notification',
      message: 'This is a test notification from our platform',
      recipient: {
        email: user.email,
        phone: user.phone || '+919999999999'
      }
    };

    // Send via email
    if (channel === 'email' || !channel) {
      await emailService.send(
        user.email,
        'Test Notification from Our Platform',
        '<h1>Test Notification</h1><p>This is a test email notification.</p>'
      );
    }

    // Send via SMS
    if (channel === 'sms' || !channel) {
      await SMSService.send(
        user.phone || '+919999999999',
        '🧪 Test SMS from our platform. Your orders, offers, and updates here.'
      );
    }

    // Send via push
    if (channel === 'push' || !channel) {
      const deviceTokens = await DeviceToken.getActiveTokens(userId);
      if (deviceTokens.length > 0) {
        await PushNotificationService.sendToMultiple(
          deviceTokens.map(dt => dt.token),
          '🧪 Test Notification',
          'This is a test push notification'
        );
      }
    }

    // Log in notification model
    await Notification.createNotification({
      userId,
      type: channel || 'email',
      eventType: 'test_notification',
      subject: 'Test Notification',
      message: 'Test notification sent',
      recipient: testNotification.recipient
    });

    res.status(200).json({
      success: true,
      message: `Test ${channel || 'multi-channel'} notification sent to ${user.email}`
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Resend failed notification
 */
exports.resendNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Verify ownership
    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Check retry limit
    if (notification.retryCount >= notification.maxRetries) {
      return res.status(400).json({ 
        success: false, 
        error: 'Maximum retry attempts exceeded' 
      });
    }

    // Resend based on type
    let result;
    try {
      if (notification.type === 'email') {
        result = await emailService.send(
          notification.recipient.email,
          notification.subject,
          notification.htmlContent
        );
      } else if (notification.type === 'sms') {
        result = await SMSService.send(
          notification.recipient.phone,
          notification.message
        );
      } else if (notification.type === 'push') {
        const deviceTokens = await DeviceToken.getActiveTokens(userId);
        result = await PushNotificationService.sendToMultiple(
          deviceTokens.map(dt => dt.token),
          notification.subject,
          notification.message
        );
      }

      // Update notification
      notification.retryCount += 1;
      notification.lastRetryAt = new Date();
      
      if (result.success) {
        notification.status = 'sent';
      } else {
        notification.status = 'failed';
        notification.error = result.error;
      }

      await notification.save();

      res.status(200).json({
        success: true,
        message: 'Notification resent',
        data: notification
      });
    } catch (sendError) {
      notification.status = 'failed';
      notification.error = {
        code: 'RESEND_ERROR',
        message: sendError.message
      };
      notification.retryCount += 1;
      notification.lastRetryAt = new Date();
      await notification.save();

      res.status(500).json({
        success: false,
        error: sendError.message
      });
    }
  } catch (error) {
    console.error('Error resending notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user notification preferences
 */
exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('notificationPreferences');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      preferences: user.notificationPreferences || {
        email: {
          orderUpdates: true,
          offers: true,
          newsletter: false
        },
        sms: {
          orderUpdates: true,
          offers: false
        },
        push: {
          orderUpdates: true,
          offers: true
        }
      }
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update notification preferences
 */
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const preferences = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    ).select('notificationPreferences');

    res.status(200).json({
      success: true,
      message: 'Preferences updated',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Register device for push notifications
 */
exports.registerDevice = async (req, res) => {
  try {
    const { token, deviceType, deviceData } = req.body;
    const userId = req.user._id;

    if (!token || !deviceType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and deviceType required' 
      });
    }

    const deviceToken = await DeviceToken.registerDevice(
      userId,
      token,
      deviceType,
      deviceData
    );

    res.status(200).json({
      success: true,
      message: 'Device registered for push notifications',
      data: deviceToken
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Unregister device
 */
exports.unregisterDevice = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token required' 
      });
    }

    await DeviceToken.removeToken(token);

    res.status(200).json({
      success: true,
      message: 'Device unregistered'
    });
  } catch (error) {
    console.error('Error unregistering device:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user devices
 */
exports.getUserDevices = async (req, res) => {
  try {
    const userId = req.user._id;

    const devices = await DeviceToken.find({ userId, isActive: true });

    res.status(200).json({
      success: true,
      data: devices,
      count: devices.length
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get notification statistics
 */
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const stats = await Notification.aggregate([
      {
        $match: {
          userId: new (require('mongoose').Types.ObjectId)(userId),
          createdAt: { $gte: cutoffDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          sent: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          read: {
            $sum: { $cond: ['$isRead', 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats,
      period: `Last ${days} days`
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;

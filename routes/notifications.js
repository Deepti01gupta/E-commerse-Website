/**
 * Notification Routes
 * API endpoints for notification management
 */

const express = require('express');
const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  getUnreadNotifications,
  getNotificationHistory,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendTestNotification,
  resendNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  registerDevice,
  unregisterDevice,
  getUserDevices,
  getNotificationStats
} = require('../controllers/notificationController');

const { isLoggedIn } = require('../middleware');

/**
 * All routes require authentication
 */
router.use(isLoggedIn);

/**
 * GET /api/notifications
 * Get user's notifications with pagination
 * Query params: page, limit, type, status, isRead
 */
router.get('/', getNotifications);

/**
 * GET /api/notifications/unread/count
 * Get count of unread notifications
 */
router.get('/unread/count', getUnreadCount);

/**
 * GET /api/notifications/unread
 * Get unread notifications
 * Query params: limit
 */
router.get('/unread', getUnreadNotifications);

/**
 * GET /api/notifications/history
 * Get full notification history
 * Query params: limit
 */
router.get('/history', getNotificationHistory);

/**
 * GET /api/notifications/stats
 * Get notification statistics
 * Query params: days
 */
router.get('/stats', getNotificationStats);

/**
 * PATCH /api/notifications/:notificationId/read
 * Mark single notification as read
 */
router.patch('/:notificationId/read', markAsRead);

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', markAllAsRead);

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
router.delete('/:notificationId', deleteNotification);

/**
 * POST /api/notifications/resend/:notificationId
 * Resend failed notification
 */
router.post('/resend/:notificationId', resendNotification);

/**
 * POST /api/notifications/test
 * Send test notification
 * Body: { type: 'email|sms|push', channel: 'email|sms|push|all' }
 */
router.post('/test', sendTestNotification);

/**
 * Preferences Routes
 */

/**
 * GET /api/notifications/preferences
 * Get user notification preferences
 */
router.get('/preferences', getNotificationPreferences);

/**
 * PATCH /api/notifications/preferences
 * Update notification preferences
 */
router.patch('/preferences', updateNotificationPreferences);

/**
 * Device Token Routes
 */

/**
 * POST /api/notifications/devices/register
 * Register device for push notifications
 * Body: { token, deviceType, deviceData: { deviceName, deviceModel, osVersion, appVersion } }
 */
router.post('/devices/register', registerDevice);

/**
 * POST /api/notifications/devices/unregister
 * Unregister device from push notifications
 * Body: { token }
 */
router.post('/devices/unregister', unregisterDevice);

/**
 * GET /api/notifications/devices
 * Get user's registered devices
 */
router.get('/devices', getUserDevices);

/**
 * Root endpoint documentation
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Notification API Endpoints',
    endpoints: {
      'GET /api/notifications': 'Get user notifications (paginated)',
      'GET /api/notifications/unread': 'Get unread notifications',
      'GET /api/notifications/unread/count': 'Get unread count',
      'GET /api/notifications/history': 'Get full notification history',
      'GET /api/notifications/stats': 'Get notification statistics',
      'PATCH /api/notifications/:id/read': 'Mark notification as read',
      'PATCH /api/notifications/read-all': 'Mark all as read',
      'DELETE /api/notifications/:id': 'Delete notification',
      'POST /api/notifications/resend/:id': 'Resend failed notification',
      'POST /api/notifications/test': 'Send test notification',
      'GET /api/notifications/preferences': 'Get notification preferences',
      'PATCH /api/notifications/preferences': 'Update preferences',
      'POST /api/notifications/devices/register': 'Register device for push',
      'POST /api/notifications/devices/unregister': 'Unregister device',
      'GET /api/notifications/devices': 'Get user devices'
    }
  });
});

module.exports = router;

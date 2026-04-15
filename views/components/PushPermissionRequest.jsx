/**
 * PushPermissionRequest Component
 * Handles requesting and managing push notification permissions
 */

import React, { useState, useEffect } from 'react';
import './PushPermissionRequest.css';

const PushPermissionRequest = ({ userId, onPermissionGranted }) => {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [deviceToken, setDeviceToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkPushPermission();
    // Check if Firebase is available
    if (!window.firebase) {
      console.warn('Firebase not loaded');
      return;
    }
  }, []);

  /**
   * Check current push notification permission status
   */
  const checkPushPermission = async () => {
    try {
      // Check browser support
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setPermissionStatus('unsupported');
        return;
      }

      const permission = Notification.permission;
      setPermissionStatus(permission);

      if (permission === 'granted') {
        registerPushNotifications();
      }
    } catch (err) {
      console.error('Error checking push permission:', err);
    }
  };

  /**
   * Request notification permission from user
   */
  const requestPushPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        registerPushNotifications();
      } else if (permission === 'denied') {
        setError('Push notifications permission denied. You can enable them later in browser settings.');
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
      setError('Failed to request push notification permission');
    }
  };

  /**
   * Register device for push notifications
   */
  const registerPushNotifications = async () => {
    try {
      if (!window.firebase || !window.firebase.messaging) {
        console.warn('Firebase messaging not available');
        return;
      }

      const messaging = window.firebase.messaging();

      // Get FCM token
      const token = await messaging.getToken({
        vapidKey: window.VAPID_PUBLIC_KEY || process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      if (token) {
        setDeviceToken(token);
        
        // Register device on backend
        await registerDeviceOnBackend(token);

        // Set up message handler
        messaging.onMessage((payload) => {
          console.log('Foreground message received:', payload);
          // Show notification banner when app is in foreground
          if (payload.notification) {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: '/logo.png',
              badge: '/badge.png'
            });
          }
        });

        if (onPermissionGranted) {
          onPermissionGranted(token);
        }

        setShowPrompt(false);
      }
    } catch (err) {
      console.error('Error registering push notifications:', err);
      setError('Failed to enable push notifications');
    }
  };

  /**
   * Register device token on backend
   */
  const registerDeviceOnBackend = async (token) => {
    try {
      const response = await fetch('/api/notifications/devices/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          token,
          deviceType: getDeviceType(),
          deviceData: {
            deviceName: `${getBrowserName()} on ${getOSName()}`,
            deviceModel: navigator.userAgent.split('(')[1]?.split(')')[0],
            osVersion: getOSVersion(),
            appVersion: process.env.REACT_APP_VERSION || '1.0.0'
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Device registered for push notifications');
      }
    } catch (err) {
      console.error('Error registering device on backend:', err);
    }
  };

  /**
   * Disable push notifications
   */
  const disablePushNotifications = async () => {
    try {
      if (!deviceToken) {
        console.warn('No device token to unregister');
        return;
      }

      const response = await fetch('/api/notifications/devices/unregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ token: deviceToken })
      });

      const data = await response.json();
      if (data.success) {
        setDeviceToken(null);
        
        // Also revoke permission
        if (Notification.permission === 'granted') {
          console.log('Push notifications disabled');
        }
      }
    } catch (err) {
      console.error('Error disabling push notifications:', err);
    }
  };

  /**
   * Utility functions
   */
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
      return /iphone|ipad/i.test(ua) ? 'ios' : 'android';
    }
    return 'web';
  };

  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    return 'Browser';
  };

  const getOSName = () => {
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('like Mac') > -1) return 'iOS';
    return 'Unknown OS';
  };

  const getOSVersion = () => {
    const ua = navigator.userAgent;
    const match = ua.match(/OS X [\d._]+|Windows NT [\d.]+|Android [\d.]+/);
    return match ? match[0] : 'Unknown';
  };

  // Don't show anything if browser doesn't support
  if (permissionStatus === 'unsupported') {
    return null;
  }

  return (
    <div className="push-permission-container">
      {/* Show prompt if permission not yet decided */}
      {permissionStatus === 'default' && (
        <div className="permission-prompt">
          <div className="prompt-content">
            <p>🔔 Get notifications about your orders, offers, and updates!</p>
            <button 
              className="btn btn-enable"
              onClick={requestPushPermission}
            >
              Enable Notifications
            </button>
            <button 
              className="btn btn-dismiss"
              onClick={() => setShowPrompt(false)}
            >
              Not Now
            </button>
          </div>
        </div>
      )}

      {/* Show status message if permission granted */}
      {permissionStatus === 'granted' && (
        <div className="permission-status granted">
          <span>✅ Push notifications enabled</span>
          <button 
            className="btn-disable"
            onClick={disablePushNotifications}
            title="Disable push notifications"
          >
            ✕
          </button>
        </div>
      )}

      {/* Show error if permission denied */}
      {permissionStatus === 'denied' && (
        <div className="permission-status denied">
          <span>⚠️ Push notifications disabled</span>
          <small>Enable in browser settings to receive notifications</small>
        </div>
      )}

      {/* Show error message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button 
            className="btn-close"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default PushPermissionRequest;

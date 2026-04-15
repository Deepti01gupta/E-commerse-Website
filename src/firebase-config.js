/**
 * Firebase Configuration
 * Initialize Firebase and setup messaging
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';

// Firebase configuration
// Get these from Firebase Console: Project Settings
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging = null;

try {
  messaging = getMessaging(app);

  // Handle messages when app is in foreground
  onMessage(messaging, (payload) => {
    console.log('📩 Foreground message received:', payload);

    // Show notification even when app is open
    if (payload.notification) {
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/logo.png',
        badge: '/badge.png',
        tag: payload.data?.notificationId || 'notification',
        data: {
          deepLink: payload.data?.deepLink || '/',
          orderId: payload.data?.orderId,
          type: payload.data?.type
        }
      };

      // Show notification using Notification API
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notificationTitle, notificationOptions);
      }

      // You could also dispatch an event to update your app UI
      window.dispatchEvent(
        new CustomEvent('notification', {
          detail: payload
        })
      );
    }
  });

  console.log('✅ Firebase Messaging initialized');
} catch (error) {
  console.warn('⚠️ Firebase Messaging not available:', error.message);
  // Push notifications not available (e.g., HTTP instead of HTTPS)
}

export { app, messaging };

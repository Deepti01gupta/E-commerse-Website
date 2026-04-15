/**
 * Firebase Cloud Messaging Service Worker
 * Handles push notifications in the background
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Firebase configuration - Replace with your config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

/**
 * Handle background messages
 * This callback is triggered when app is in background/closed
 */
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Background message received:', payload);

  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: payload.notification?.icon || '/logo.png',
    badge: '/badge.png',
    tag: payload.data?.notificationId || 'notification',
    data: {
      notificationId: payload.data?.notificationId,
      deepLink: payload.data?.deepLink || '/',
      orderId: payload.data?.orderId,
      type: payload.data?.type
    },
    // Vibrate on Android
    vibrate: [200, 100, 200],
    // Sound for notification
    sound: '/notification-sound.mp3',
    // Make it sticky (stays until dismissed)
    requireInteraction: false,
    // Action buttons
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handle notification click
 */
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification);

  // Close the notification
  event.notification.close();

  const data = event.notification.data;
  const deepLink = data.deepLink || '/';

  // Handle based on action
  if (event.action === 'close') {
    return;
  }

  // Open window with deep link
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === deepLink && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open new window
      if (clients.openWindow) {
        return clients.openWindow(deepLink);
      }
    })
  );
});

/**
 * Handle notification close
 */
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notification closed:', event.notification);
  // Could track analytics here
});

/**
 * Handle push events (fallback)
 */
self.addEventListener('push', (event) => {
  console.log('📨 Push event received:', event);

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data:', data);
    } catch (e) {
      console.log('Push text:', event.data.text());
    }
  }
});

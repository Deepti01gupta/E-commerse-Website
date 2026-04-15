# Notification System Integration Guide

## Overview

The complete Notification System has been implemented with support for:
- ✅ Email Notifications (Nodemailer with multiple SMTP backends)
- ✅ SMS Notifications (Twilio)
- ✅ Push Notifications (Firebase Cloud Messaging)
- ✅ Event-Driven Architecture (NodeJS EventEmitter)
- ✅ Notification History & Management
- ✅ React Components for UI

---

## Part 1: Environment Setup

### 1.1 Install Dependencies

Add these packages to `package.json`:

```bash
npm install nodemailer twilio firebase-admin dotenv mongoose express-validator helmet express-rate-limit
```

### 1.2 Create `.env` File

```env
# Email Service Configuration
EMAIL_SERVICE=gmail  # or sendgrid, or smtp
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
# OR for SendGrid
SENDGRID_API_KEY=SG.xxxxxxxx

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications (Firebase)
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
VAPID_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

# App Configuration
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key
```

---

## Part 2: Database Setup

### 2.1 Update User Model

Add notification preferences to `models/User.js`:

```javascript
const userSchema = new Schema({
  // ... existing fields ...
  
  notificationPreferences: {
    email: {
      orderUpdates: { type: Boolean, default: true },
      offers: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false }
    },
    sms: {
      orderUpdates: { type: Boolean, default: true },
      offers: { type: Boolean, default: false }
    },
    push: {
      orderUpdates: { type: Boolean, default: true },
      offers: { type: Boolean, default: true }
    }
  }
});
```

### 2.2 Verify Models Are Created

Ensure these models exist:
- ✅ `models/Notification.js` - CREATED
- ✅ `models/DeviceToken.js` - CREATED
- Existing models: Order, User, Product, Review

---

## Part 3: Service Integration

### 3.1 Verify Services Directory

Create `services/` directory if it doesn't exist:

```
services/
├── emailService.js           ✅ CREATED
├── smsService.js            ✅ CREATED
├── pushNotificationService.js ✅ CREATED
└── notificationEmitter.js    ✅ CREATED
```

---

## Part 4: Express App Setup

### 4.1 Update `app.js`

Add these imports at the top:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Import routes
const notificationRoutes = require('./routes/notifications');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');
const returnRoutes = require('./routes/return');
const refundRoutes = require('./routes/refund');
const trackingRoutes = require('./routes/tracking');
const reviewRoutes = require('./routes/review');
const sellerRoutes = require('./routes/seller');

// Import event emitter
const notificationEmitter = require('./services/notificationEmitter');

// Mount routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seller', sellerRoutes);

// Root endpoint documentation
app.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce API with Notification System',
    endpoints: {
      notifications: '/api/notifications',
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/auth',
      seller: '/api/seller'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email Service: ${process.env.EMAIL_SERVICE}`);
  console.log(`💬 SMS Service: Twilio`);
  console.log(`🔔 Push Service: Firebase Cloud Messaging`);
});

module.exports = app;
```

---

## Part 5: Event Triggers

### 5.1 Order Creation Event

Update your order creation endpoint in `routes/order.js`:

```javascript
const notificationEmitter = require('../services/notificationEmitter');

// In order creation handler
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // ... create order logic ...
    
    const newOrder = await order.save();
    
    // ✨ TRIGGER NOTIFICATION
    notificationEmitter.emit('order:created', {
      orderId: newOrder._id,
      userId: newOrder.userId
    });
    
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 5.2 Order Shipment Event

Update order shipment endpoint:

```javascript
// When order is shipped
router.put('/:orderId/ship', isSeller, async (req, res) => {
  try {
    const { trackingNumber, carrier } = req.body;
    
    // ... update order logic ...
    
    order.status = 'shipped';
    await order.save();
    
    // ✨ TRIGGER NOTIFICATION
    notificationEmitter.emit('order:shipped', {
      orderId: order._id,
      trackingNumber,
      carrier
    });
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 5.3 Order Delivery Event

Update delivery update endpoint in `routes/tracking.js`:

```javascript
// When package is delivered
router.put('/:orderId/delivered', isAdmin, async (req, res) => {
  try {
    // ... update tracking logic ...
    
    // ✨ TRIGGER NOTIFICATION
    notificationEmitter.emit('order:delivered', {
      orderId,
      deliveredAt: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 5.4 User Registration Event

Update signup endpoint in `routes/auth.js`:

```javascript
router.post('/signup', async (req, res) => {
  try {
    // ... create user logic ...
    
    const newUser = await user.save();
    
    // ✨ TRIGGER NOTIFICATION
    notificationEmitter.emit('user:registered', {
      userId: newUser._id
    });
    
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## Part 6: React Frontend Setup

### 6.1 Install Firebase SDK

```bash
npm install firebase
```

### 6.2 Create Firebase Configuration

Create `src/firebase-config.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('Message received in foreground:', payload);
  // Show notification
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo.png'
  });
});
```

### 6.3 Create `.env.local` File

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=xxxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxxxx
REACT_APP_FIREBASE_PROJECT_ID=xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxxxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxxxx
REACT_APP_FIREBASE_APP_ID=xxxxx
REACT_APP_VERSION=1.0.0
```

### 6.4 Update App.jsx/App.js

```javascript
import React, { useEffect } from 'react';
import NotificationBell from './components/NotificationBell';
import PushPermissionRequest from './components/PushPermissionRequest';

function App() {
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Initialize Firebase messaging
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }
  }, []);

  return (
    <div className="app">
      <header>
        {/* Your navbar */}
        <nav>
          <NotificationBell userId={userId} />
        </nav>
      </header>

      <main>
        <PushPermissionRequest userId={userId} />
        {/* Your main content */}
      </main>
    </div>
  );
}

export default App;
```

### 6.5 Create Service Worker

Create `public/firebase-messaging-sw.js`:

```javascript
// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png',
    badge: '/badge.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.deepLink || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
```

---

## Part 7: Testing

### 7.1 Test Email Service

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"channel": "email"}'
```

### 7.2 Test SMS Service

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"channel": "sms"}'
```

### 7.3 Test Push Notifications

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"channel": "push"}'
```

---

## Part 8: File Structure Verification

```
project-root/
├── app.js                          ✅ Updated
├── models/
│   ├── User.js                     ⚠️ Add notification preferences
│   ├── Order.js                    ✅ Existing
│   ├── Product.js                  ✅ Existing
│   ├── Notification.js             ✅ CREATED
│   └── DeviceToken.js              ✅ CREATED
├── controllers/
│   └── notificationController.js   ✅ CREATED
├── routes/
│   ├── notifications.js            ✅ CREATED
│   ├── order.js                    ⚠️ Add event triggers
│   ├── auth.js                     ⚠️ Add event triggers
│   └── ... (other routes)
├── services/
│   ├── emailService.js             ✅ CREATED
│   ├── smsService.js               ✅ CREATED
│   ├── pushNotificationService.js  ✅ CREATED
│   └── notificationEmitter.js      ✅ CREATED
├── middleware/
│   └── auth.js                     ✅ Existing
├── views/components/
│   ├── NotificationBell.jsx        ✅ CREATED
│   ├── NotificationCenter.jsx      ✅ CREATED
│   └── PushPermissionRequest.jsx   ✅ CREATED
├── public/
│   ├── css/
│   │   ├── NotificationBell.css    ✅ CREATED
│   │   ├── NotificationCenter.css  ✅ CREATED
│   │   ├── PushPermissionRequest.css ✅ CREATED
│   └── firebase-messaging-sw.js    ⚠️ CREATE THIS
└── .env                            ⚠️ Create and configure
```

---

## Part 9: Troubleshooting

### Issue: Email Not Sending
- Verify Gmail app password (not regular password)
- Check `GMAIL_EMAIL` matches sender address
- For SendGrid: verify API key in `SENDGRID_API_KEY`

### Issue: SMS Not Sending
- Verify Twilio credentials in `.env`
- Check phone number format: `+919876543210`
- Ensure account has balance/credits

### Issue: Push Notifications Not Received
- Verify `serviceAccountKey.json` is valid
- Check browser allows notifications
- Confirm device token is registered
- Verify VAPID keys are correct

### Issue: Notifications Not Showing in MongoDB
- Connect to MongoDB directly: `mongo`
- Check if `use ecommerce` database exists
- Query: `db.notifications.find()`

---

## Part 10: Production Deployment Checklist

- [ ] All environment variables set in production
- [ ] MongoDB Atlas connected (not localhost)
- [ ] Email service verified (Gmail/SendGrid test email sent)
- [ ] Twilio account has sufficient balance
- [ ] Firebase project created and credentials set
- [ ] HTTPS enabled on frontend and backend
- [ ] CORS configured for production domains
- [ ] Rate limiting configured
- [ ] Error logging setup (LogRocket, Sentry)
- [ ] Database backups enabled
- [ ] Notification event triggers tested end-to-end
- [ ] React components built and optimized
- [ ] Service worker registered
- [ ] Push notification permissions tested on devices
- [ ] Email templates tested with real data
- [ ] SMS message templates verified
- [ ] Load testing done for notification volume

---

## API Endpoints Summary

```
NOTIFICATIONS
GET     /api/notifications                    - Get notifications (paginated)
GET     /api/notifications/unread             - Get unread notifications
GET     /api/notifications/unread/count       - Get unread count
GET     /api/notifications/history            - Get full history
GET     /api/notifications/stats              - Get statistics
PATCH   /api/notifications/:id/read           - Mark as read
PATCH   /api/notifications/read-all           - Mark all as read
DELETE  /api/notifications/:id                - Delete notification
POST    /api/notifications/resend/:id         - Resend failed
POST    /api/notifications/test               - Send test notification

PREFERENCES
GET     /api/notifications/preferences        - Get preferences
PATCH   /api/notifications/preferences        - Update preferences

DEVICES
POST    /api/notifications/devices/register   - Register device
POST    /api/notifications/devices/unregister - Unregister device
GET     /api/notifications/devices            - Get user devices
```

---

## Next Steps

1. ✅ Update `app.js` with all imports and routes
2. ✅ Add notification preferences to User model
3. ✅ Add event triggers to order routes
4. ✅ Set up Firebase project and download credentials
5. ✅ Configure `.env` with all credentials
6. ✅ Test each service individually
7. ✅ Integrate React components in frontend
8. ✅ Test end-to-end notifications
9. ✅ Deploy to production

---

## Support Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Twilio SMS API](https://www.twilio.com/docs/sms/api)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [Express.js Guide](https://expressjs.com/)

# Firebase Setup Guide for Push Notifications

## Overview

This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in your e-commerce platform.

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
1. Visit https://console.firebase.google.com
2. Click "Add project"
3. Enter project name (e.g., "ECommerce-Notifications")
4. Follow the setup wizard
5. Click "Create project"

### 1.2 Wait for Project Setup
- Takes 1-2 minutes to create
- You'll see a "Your new project is ready" message

---

## Step 2: Add Web App to Firebase

### 2.1 Register Web App
1. In Firebase Console, click the web icon (</>) 
2. Enter app nickname: "ecommerce-web"
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"

### 2.2 Copy Web Configuration
You'll see a config object like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project-abc123.firebaseapp.com",
  projectId: "your-project-abc123",
  storageBucket: "your-project-abc123.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

**Copy these values to `.env.local`:**
```
REACT_APP_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-abc123.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-abc123
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-abc123.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789abcdef
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Step 3: Generate VAPID Key Pair

### 3.1 Enable Cloud Messaging
1. In Firebase Console, go to "Cloud Messaging" tab
2. If not enabled, click "Enable Cloud Messaging API"
3. Wait for activation (1-2 minutes)

### 3.2 Generate Web Push Certificate
1. Under "Web Push certificates" section
2. Click "Generate Key Pair"
3. You'll get a public and private key

**Copy the public key:**
```
REACT_APP_VAPID_PUBLIC_KEY=BI4VCvxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save the private key to `.env`:**
```
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 4: Create Service Account

### 4.1 Generate Service Account Key
1. Go to Project Settings (gear icon)
2. Click "Service Accounts" tab
3. Select "Node.js" under SDK
4. Click "Generate New Private Key"
5. A JSON file will download: `serviceAccountKey.json`

### 4.2 Save Service Account Key
1. **Copy the entire JSON** from the downloaded file
2. Save to your project root as `serviceAccountKey.json`
3. Add to `.env`:
```
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

⚠️ **IMPORTANT: Never commit `serviceAccountKey.json` to git!**
Add to `.gitignore`:
```
serviceAccountKey.json
```

---

## Step 5: Configure Backend

### 5.1 Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### 5.2 Update .env
Fill in all Firebase variables:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
VAPID_PUBLIC_KEY=BI4VCvxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 6: Configure Frontend

### 6.1 Install Firebase SDK
```bash
npm install firebase
```

### 6.2 Create .env.local
Copy `.env.local.example` and fill in values:
```bash
cp .env.local.example .env.local
```

Fill in all Firebase values from Step 2.

### 6.3 Update App.jsx
```javascript
import { messaging } from './firebase-config';
import NotificationBell from './components/NotificationBell';
import PushPermissionRequest from './components/PushPermissionRequest';

function App() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(reg => console.log('✅ Service Worker registered'))
        .catch(err => console.error('❌ Service Worker error:', err));
    }
  }, []);

  return (
    <div className="app">
      <header>
        <NotificationBell userId={userId} />
      </header>
      <main>
        <PushPermissionRequest userId={userId} />
        {/* Your app content */}
      </main>
    </div>
  );
}
```

---

## Step 7: Test Setup

### 7.1 Start Backend
```bash
npm start
# Server running at http://localhost:8080
```

### 7.2 Start Frontend
```bash
cd path/to/react/app
npm start
# App running at http://localhost:3000
```

### 7.3 Test Notification Permission
1. Open app in browser
2. You should see "Allow Notifications" prompt
3. Click "Allow"
4. Check browser console for device token registration

### 7.4 Send Test Notification
```bash
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"channel": "push"}'
```

---

## Step 8: Test with Real Data

### 8.1 Create Test Order
1. Go to your app
2. Create a new order
3. Wait for email notification
4. Check push notification appears

### 8.2 Verify in Firebase Console
1. Go to Firebase Console > Cloud Messaging
2. You should see message statistics
3. Check delivery status

---

## Troubleshooting

### Issue: "Firebase initialization failed"
**Solution:**
- Verify all `.env.local` values are correct
- Check Firebase Console for typos in config
- Ensure `.env.local` file exists and has correct values

### Issue: "Service Worker registration failed"
**Solution:**
- Ensure backend is running (serviceAccountKey.json exists)
- Check browser console for errors
- App must be on HTTPS (or localhost)
- Clear browser cache and try again

### Issue: "Push notifications not received"
**Solution:**
- Verify browser allows notifications (Check in browser settings)
- Check "Notification" permission is "Allow"
- Verify device token is registered in database
- Check Firebase Console > Cloud Messaging for errors

### Issue: "Permission denied for notifications"
**Solution:**
- Go to browser settings
- Find your domain
- Change notification permission to "Ask"
- Refresh page and allow again

### Issue: "VAPID key mismatch"
**Solution:**
- Generate new key pair in Firebase Console
- Update both keys:
  - Backend: `VAPID_PRIVATE_KEY` in `.env`
  - Frontend: `REACT_APP_VAPID_PUBLIC_KEY` in `.env.local`
- Restart both backend and frontend

### Issue: Service Worker shows 404 error
**Solution:**
- Ensure `public/firebase-messaging-sw.js` exists
- Check file path is correct
- Restart backend server
- Clear browser cache

---

## Complete Checklist

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Firebase config copied to `.env.local`
- [ ] Cloud Messaging enabled
- [ ] VAPID key pair generated
- [ ] Public key in `.env.local`
- [ ] Private key in `.env`
- [ ] Service account key generated
- [ ] `serviceAccountKey.json` saved
- [ ] `serviceAccountKey.json` added to `.gitignore`
- [ ] Firebase Admin SDK installed
- [ ] Firebase SDK installed in React
- [ ] Service Worker file exists: `public/firebase-messaging-sw.js`
- [ ] Firebase config file exists: `src/firebase-config.js`
- [ ] App.jsx updated with components
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Notification permission prompt appears
- [ ] Device token appears in console
- [ ] Test notification sends successfully
- [ ] Push notification appears on device

---

## Files You Should Have

```
project-root/
├── .env (has Firebase backend config)
├── .env.local (has Firebase frontend config)
├── serviceAccountKey.json (NEVER commit!)
├── public/
│   └── firebase-messaging-sw.js ✅ CREATED
├── src/
│   ├── firebase-config.js ✅ CREATED
│   └── App.jsx (updated)
├── services/
│   └── pushNotificationService.js ✅
└── controllers/
    └── notificationController.js ✅
```

---

## Security Notes

✅ **Safe to expose (PUBLIC):**
- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `VAPID_PUBLIC_KEY`

❌ **NEVER expose (PRIVATE):**
- `serviceAccountKey.json`
- `VAPID_PRIVATE_KEY`
- Any contents of this file

---

## Next Steps

1. ✅ Setup Firebase project
2. ✅ Generate credentials
3. ✅ Update `.env` and `.env.local`
4. ✅ Test push notifications
5. ✅ Integrate with order events
6. ✅ Deploy to production

---

## Support Links

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push Protocol](https://datatracker.ietf.org/doc/html/draft-thomson-webpush-protocol)

---

**Setup Time: 15-20 minutes**
**Difficulty: Medium**
**Complexity: Moderate**

Last Updated: April 2026
Firebase Version: 10.8.0

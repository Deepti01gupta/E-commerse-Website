# Notification API Testing Guide

## Overview

This guide provides multiple methods to test the notification API:
- 🧪 Automated test script
- 📝 Manual curl commands
- 📮 Postman collection
- ✅ Validation checklist

---

## Method 1: Automated Test Script (Recommended)

### 1.1 Install Dependencies

```bash
npm install axios colors
```

### 1.2 Run Test Script

```bash
node test-notifications.js
```

This will run 10 comprehensive tests:
1. ✅ API Health Check
2. ✅ Environment Variables
3. ✅ Email Service
4. ✅ SMS Service
5. ✅ Push Notifications
6. ✅ Notification History
7. ✅ Unread Count
8. ✅ Preferences
9. ✅ Device Registration
10. ✅ Database Connection

### 1.3 Expected Output

```
NOTIFICATION SYSTEM - API TEST SUITE
============================================================

✅ API Health Check
   API is running

✅ Email Service
   Test email sent

✅ SMS Service
   Test SMS sent

✅ Push Notification Service
   Push notification sent

... (more tests)

TEST SUMMARY
Results: 10/10 tests passed (100%)
🎉 All tests passed!
```

---

## Method 2: Manual Testing with cURL

### Prerequisites

```bash
# Get your auth token from login
# Or use: POST /api/auth/login with credentials
```

### 2.1 Test Email Service

Send a test email:

```bash
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "email"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email notification sent to your-email@gmail.com"
}
```

### 2.2 Test SMS Service

Send a test SMS:

```bash
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "sms"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test SMS notification sent to +919876543210"
}
```

### 2.3 Test Push Notifications

Send a test push notification:

```bash
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "push"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test push notification sent to registered devices"
}
```

### 2.4 Get Notification History

Fetch all notifications:

```bash
curl -X GET "http://localhost:8080/api/notifications?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "type": "email",
      "subject": "Test Notification",
      "message": "This is a test",
      "status": "sent",
      "createdAt": "2026-04-15T..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1
  }
}
```

### 2.5 Get Unread Count

```bash
curl -X GET http://localhost:8080/api/notifications/unread/count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "unreadCount": 0
}
```

### 2.6 Mark Notification as Read

Replace `NOTIFICATION_ID` with actual ID:

```bash
curl -X PATCH http://localhost:8080/api/notifications/NOTIFICATION_ID/read \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2.7 Get Notification Preferences

```bash
curl -X GET http://localhost:8080/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "preferences": {
    "email": {
      "orderUpdates": true,
      "offers": true,
      "newsletter": false
    },
    "sms": {
      "orderUpdates": true,
      "offers": false
    },
    "push": {
      "orderUpdates": true,
      "offers": true
    }
  }
}
```

### 2.8 Update Preferences

```bash
curl -X PATCH http://localhost:8080/api/notifications/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": {
      "orderUpdates": true,
      "offers": false,
      "newsletter": true
    },
    "sms": {
      "orderUpdates": true,
      "offers": true
    },
    "push": {
      "orderUpdates": true,
      "offers": true
    }
  }'
```

---

## Method 3: Using Postman

### 3.1 Import Collection

Create a new Postman collection with these requests:

1. **Login** (GET TOKEN)
   ```
   POST http://localhost:8080/api/auth/login
   Body: {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```

2. **Test Email**
   ```
   POST http://localhost:8080/api/notifications/test
   Header: Authorization: Bearer {{token}}
   Body: {"channel": "email"}
   ```

3. **Test SMS**
   ```
   POST http://localhost:8080/api/notifications/test
   Header: Authorization: Bearer {{token}}
   Body: {"channel": "sms"}
   ```

4. **Test Push**
   ```
   POST http://localhost:8080/api/notifications/test
   Header: Authorization: Bearer {{token}}
   Body: {"channel": "push"}
   ```

5. **Get Notifications**
   ```
   GET http://localhost:8080/api/notifications
   Header: Authorization: Bearer {{token}}
   ```

### 3.2 Set Environment Variable

In Postman:
1. Click "Environment" (top left)
2. Add variable: `token` = your_jwt_token
3. Use `{{token}}` in requests

---

## Method 4: Step-by-Step Validation

### Step 1: Check Backend is Running

```bash
npm start
```

Expected output:
```
Server running at http://localhost:8080/login
✅ MongoDB connected
📧 Email Service: gmail
💬 SMS Service: Twilio
🔔 Push Service: Firebase Cloud Messaging
```

### Step 2: Check Environment Variables

Verify `.env` file has:
```
EMAIL_SERVICE=gmail
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### Step 3: Login and Get Token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Copy the `token` from response.

### Step 4: Test Each Service

Test email:
```bash
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  -d '{"channel": "email"}'
```

Check your email inbox for test message.

Test SMS:
```bash
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  -d '{"channel": "sms"}'
```

Check your phone for test SMS.

Test push:
```bash
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  -d '{"channel": "push"}'
```

Check browser notification permission dialog.

### Step 5: Verify in Database

Connect to MongoDB:
```bash
mongo
use shopping-sam-app
db.notifications.find().limit(5)
```

You should see test notifications with status "sent" or "pending".

---

## Troubleshooting

### Issue: "API is not responding"

**Solution:**
1. Check backend is running: `npm start`
2. Verify port 8080 is not in use
3. Check for errors in terminal
4. Verify MongoDB is running

### Issue: "Email failed to send"

**Solution:**
1. Verify GMAIL_EMAIL in .env
2. Check Gmail app password (not regular password)
3. Enable 2FA on Google Account
4. For SendGrid: verify API key starts with "SG."
5. Check internet connection

### Issue: "SMS failed to send"

**Solution:**
1. Verify Twilio credentials
2. Check TWILIO_PHONE_NUMBER format: +country-code-number
3. Ensure account has balance
4. Check phone number is valid for your region

### Issue: "Push notification failed"

**Solution:**
1. Verify serviceAccountKey.json exists
2. Check Firebase project is active
3. Verify Firebase config in .env.local
4. Clear browser cache and retry permission
5. Check browser supports Web Push (Chrome, Firefox, Edge)

### Issue: "Unauthorized"

**Solution:**
1. Get new token: POST /api/auth/login
2. Include token in Authorization header
3. Format: `Authorization: Bearer TOKEN_HERE`
4. Don't include angle brackets

---

## Performance Benchmarks

Expected response times:

| Endpoint | Time | Threshold |
|----------|------|-----------|
| GET /notifications | 100-200ms | < 500ms |
| GET /notifications/unread/count | 50-100ms | < 200ms |
| POST /notifications/test (email) | 500-2000ms | < 5s |
| POST /notifications/test (sms) | 1000-3000ms | < 5s |
| POST /notifications/test (push) | 200-500ms | < 2s |
| PATCH /notifications/preferences | 100-200ms | < 500ms |

---

## Full Test Checklist

### Pre-Testing
- [ ] Backend running: `npm start`
- [ ] MongoDB connected
- [ ] .env file configured with all services
- [ ] serviceAccountKey.json exists (for Firebase)
- [ ] User account created and logged in

### Email Testing
- [ ] Test email endpoint returns 200
- [ ] Email appears in inbox (2-5 minutes)
- [ ] Email subject matches
- [ ] Email body contains test message
- [ ] Email is from configured sender

### SMS Testing
- [ ] Test SMS endpoint returns 200
- [ ] SMS appears on phone (10-30 seconds)
- [ ] SMS text matches
- [ ] Message comes from TWILIO_PHONE_NUMBER

### Push Testing
- [ ] Test push endpoint returns 200
- [ ] Browser asks for notification permission
- [ ] After allowing, test device token stored in database
- [ ] Push notification appears on screen

### Data Retrieval Testing
- [ ] GET/notifications returns notification list
- [ ] Pagination works (page, limit params)
- [ ] Filtering works (type, status, isRead)
- [ ] Unread count is accurate
- [ ] Preferences retrieve correctly
- [ ] Preferences update correctly

### Cleanup
- [ ] Delete test notifications from database
- [ ] Verify counts reset to expected values

---

## Quick Start Commands

**All-in-one test:**
```bash
npm start & sleep 2 && node test-notifications.js
```

**Test specific service:**
```bash
# Email only
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"channel": "email"}'
```

**Check logs:**
```bash
# Terminal where backend is running shows real-time logs
# Look for: "✅ Email sent:", "✅ SMS sent:", "✅ Push sent:"
```

---

## Success Criteria

✅ **All services working when:**
- Email service receives test email in 2-5 minutes
- SMS service delivers test SMS in 10-30 seconds
- Push service registers device and shows notification
- Notification history displays all sent notifications
- Preferences are retrieved and can be updated
- API response times are within benchmarks
- Database contains notification records
- No errors in backend logs

❌ **Issues to resolve:**
- Any failed test in automated script
- Any service not responding in expected time
- Missing notifications from any channel
- API returning error status codes
- Database connection issues

---

## Next Steps After Testing

1. ✅ All tests pass
   - Proceed to production deployment
   - Setup monitoring and alerting
   - Configure scheduled cleanup jobs

2. ❌ Some tests fail
   - Review troubleshooting section
   - Check logs for specific errors
   - Verify all credentials are correct
   - Retry individual service tests

3. 🟡 Performance issues
   - Check database indexes
   - Optimize API queries
   - Consider caching frequently accessed data
   - Review MongoDB compound indexes

---

## Support Commands

**Check service status:**
```bash
# Email
curl http://localhost:8080/api/notifications/test

# SMS
nsed

# Push
firebase test
```

**View real-time logs:**
```bash
# Terminal where backend runs shows:
# ✅ Email notification sent
# ✅ SMS notification sent
# ✅ Push notification sent
```

**Database verification:**
```bash
# Connect to MongoDB
mongo shopping-sam-app

# Check notification count
db.notifications.count()

# Check recent notifications
db.notifications.find().sort({_id:-1}).limit(3).pretty()

# Check notification types
db.notifications.distinct("type")
```

---

## Common Test Patterns

### Test Complete Notification Flow

```bash
# 1. Create order (triggers order:created event)
POST /api/orders

# 2. Check notifications created
GET /api/notifications

# 3. Update order status (triggers order:shipped event)
PUT /api/orders/ORDER_ID/ship

# 4. Check new notification
GET /api/notifications

# 5. Mark as read
PATCH /api/notifications/NOTIF_ID/read

# 6. Check unread count decreased
GET /api/notifications/unread/count
```

### Test Notification Preferences

```bash
# 1. Get current preferences
GET /api/notifications/preferences

# 2. Update to disable emails
PATCH /api/notifications/preferences
{
  "email": {"orderUpdates": false}
}

# 3. Create order (should not send email now)
POST /api/orders

# 4. Verify no email received

# 5. Re-enable and retry
PATCH /api/notifications/preferences
{
  "email": {"orderUpdates": true}
}
```

---

**Testing Time: 30-45 minutes**
**Difficulty: Easy-Medium**
**Success Rate Target: 100%**

Last Updated: April 2026

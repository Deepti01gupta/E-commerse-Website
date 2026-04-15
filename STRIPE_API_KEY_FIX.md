# ⚠️ Stripe API Key Error - Solution Guide

## Issue
Error: `Invalid API Key provided: sk_test_**********************************_key`

**Root Cause**: The `.env` file has invalid/placeholder Stripe API keys.

---

## ✅ Quick Fix (3 Steps)

### Step 1: Get FREE Stripe Test Keys
1. Visit: https://dashboard.stripe.com/register
2. Create a **FREE account** (no credit card required)
3. Go to: **Developers → API Keys** (in the left sidebar)
4. You'll see two keys in "Standard keys":
   - **Publishable key** starts with `pk_test_`
   - **Secret key** starts with `sk_test_`

### Step 2: Copy Your Keys
Example:
```
Publishable: pk_test_51Q9W7LLhYKk1vN6cY0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0
Secret: sk_test_51Q9W7LLhYKk1vN6cY0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0
```

### Step 3: Update `.env` File

**Location**: Root directory → `.env`

Replace the placeholder keys with your actual keys:

```env
STRIPE_PUBLIC_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
```

**Example:**
```env
STRIPE_PUBLIC_KEY=pk_test_51Q9W7LLhYKk1vN6cY0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0
STRIPE_SECRET_KEY=sk_test_51Q9W7LLhYKk1vN6cY0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0
```

### Step 4: Restart Your Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
# Or if using node app.js
node app.js
```

---

## 🧪 Test the Payment Flow

Once configured, visit: **http://localhost:8080/checkout**

**Test with these fake card numbers** (only work in test mode):

| Card Type | Number | Exp | CVC |
|-----------|--------|-----|-----|
| Visa ✓ | `4242 4242 4242 4242` | Any future | Any 3 digits |
| Mastercard ✓ | `5555 5555 5555 4444` | Any future | Any 3 digits |
| With 3D Secure | `4000 0025 0000 3155` | Any future | Any 3 digits |
| Declined ✗ | `4000 0000 0000 0002` | Any future | Any 3 digits |

---

## 📝 Full `.env` Configuration

Here's what your complete `.env` file should look like:

```env
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY

# Optional: Session Secret
SESSION_SECRET=your_session_secret_key

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## ❓ Common Issues & Fixes

### "Still getting invalid key error"
**Solution**: 
1. Make sure you copied the **entire** key (don't miss characters)
2. Keys should start with `pk_test_` or `sk_test_`
3. Restart your server after updating `.env`
4. Make sure `.env` file is in the **root directory** of your project

### "STRIPE_SECRET_KEY is undefined"
**Solution**:
1. Verify `.env` file exists in project root
2. Check filename: must be `.env` (not `.env.txt` or `.env.example`)
3. After creating/editing `.env`, restart the server

### "Payment gateway is not configured"
**Solution**: Same as above - add `STRIPE_SECRET_KEY` to `.env`

---

## 🔒 Security Notes

✅ **DO:**
- Keep your `.env` file in `.gitignore`
- Use test keys (`pk_test_`, `sk_test_`) for development
- Use production keys (`pk_live_`, `sk_live_`) only for live site

❌ **DON'T:**
- Commit `.env` file to Git
- Share your secret keys with anyone
- Use production keys in development

---

## 📌 File Locations

```
Your Project Root/
├── .env                    ← UPDATE THIS FILE
├── app.js                  (main server file)
├── routes/
│   └── cart.js            (uses STRIPE_SECRET_KEY)
└── ... other files
```

---

## ✨ After Setup

Once you've added valid Stripe keys:

1. **Checkout page** works: http://localhost:8080/checkout
2. **Test payments** with fake card numbers
3. **View transactions** at: https://dashboard.stripe.com/test/payments
4. **Monitor events** at: https://dashboard.stripe.com/test/webhooks

---

## 💡 Alternative: Disable Stripe Temporarily

If you want to test without Stripe, edit `routes/cart.js`:

Find this section:
```javascript
if (!stripe) {
    req.flash('error', 'Payment gateway is not configured...');
    return res.redirect('/user/cart');
}
```

Replace with:
```javascript
if (!stripe) {
    // Temporarily skip Stripe
    console.log('Stripe not configured - payment processing skipped');
    // Continue with order instead of returning error
}
```

---

**Status**: Once you update the `.env` file and restart, your error should be resolved! ✅

Need more help? Check the main README or PAYMENT_SYSTEM_INTEGRATION.md

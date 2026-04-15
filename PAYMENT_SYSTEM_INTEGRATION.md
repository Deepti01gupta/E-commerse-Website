# Complete Payment System Integration Guide

This guide explains how to integrate and test your complete e-commerce payment system spanning the React frontend, secure auth backend, and payment processing backend.

## 📁 Project Structure

```
E_commerce website - Copy/
├── app.js (Main Express app - existing)
├── middleware.js (Existing middleware)
├── models/ (Existing MongoDB models)
├── routes/ (Existing routes)
├── views/ (Existing EJS templates)
├── schema.js (Existing validation)
│
├── react-ecommerce-ui/ (NEW - Frontend)
│   ├── src/
│   │   ├── components/
│   │   │   ├── checkout/
│   │   │   │   ├── AddressForm.jsx ✓
│   │   │   │   ├── CouponApplier.jsx ✓
│   │   │   │   ├── OrderSummary.jsx ✓
│   │   │   │   ├── PaymentMethodSelector.jsx ✓
│   │   │   │   └── ShippingCalculator.jsx ✓
│   │   │   ├── filters/, layout/, products/, search/ (Existing)
│   │   │   └── cart/
│   │   ├── pages/
│   │   │   ├── checkout/
│   │   │   │   ├── CheckoutPage.jsx ✓
│   │   │   │   ├── CheckoutSuccessPage.jsx ✓
│   │   │   │   └── CheckoutFailurePage.jsx ✓
│   │   │   ├── CartPage.jsx (Updated with checkout link)
│   │   │   ├── HomePage.jsx, WishlistPage.jsx (Existing)
│   │   ├── context/
│   │   │   └── StoreContext.jsx (Existing)
│   │   └── App.jsx (Updated with checkout routes)
│   ├── package.json
│   └── vite.config.js
│
├── secure-auth-api/ (NEW - Auth Backend)
│   ├── src/
│   │   ├── config/, controllers/, middleware/, models/, routes/, services/, utils/, validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
└── payment-system/ (NEW - Payment Backend)
    ├── src/
    │   ├── config/, controllers/, middleware/, models/, routes/, services/, utils/, validators/
    │   ├── app.js
    │   └── server.js
    ├── package.json
    └── .env.example
```

## 🚀 Getting Started

### Step 1: Setup Payment Backend

```bash
cd payment-system

# Copy and configure environment
cp .env.example .env

# Install dependencies
npm install
```

**Update `.env` with:**
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/ecommerce-payment
CLIENT_URL=http://localhost:5173

# Stripe
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY

# Razorpay
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET

# Email (Optional - for order notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=your.app.password
EMAIL_FROM="E-Commerce <support@ecommerce.com>"
```

**Start the payment service:**
```bash
npm start
# Server running at http://localhost:5001
```

### Step 2: Setup Auth Backend (Optional - for JWT auth)

```bash
cd secure-auth-api

# Copy and configure
cp .env.example .env
npm install
```

**Update `.env` with:**
```
PORT=5002
MONGO_URI=mongodb://localhost:27017/ecommerce-auth
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_key_min_32_chars
```

**Start:**
```bash
npm start
# Server running at http://localhost:5002
```

### Step 3: Start React Frontend

```bash
cd react-ecommerce-ui

npm install  # If not done
npm run dev
# Frontend at http://localhost:5173
```

## 💳 Payment Flow - User Journey

### Complete Checkout Flow

1. **User adds products to cart** → View in Cart page
2. **Click "Checkout" button** → Navigate to `/checkout`
3. **Fill Address Form**
   - Full Name, Email, Phone
   - Street, City, State, Pincode
4. **Select Payment Method**
   - Razorpay (UPI, Cards, Net Banking)
   - Stripe (International Cards)
5. **Check Shipping**
   - Enter pincode
   - System calculates shipping charge dynamically
   - Shows free delivery if applicable (> ₹2,500)
6. **Apply Coupon (Optional)**
   - Enter coupon code
   - Validates and applies discount
   - Updates order total
7. **Review Order Summary**
   - Subtotal
   - Tax (18% GST)
   - Shipping
   - Discount
   - **Final Total**
8. **Click "Proceed to Payment"**
   - Backend initiates payment intent/order
   - Frontend redirects to payment gateway
9. **Complete Payment**
   - For Razorpay: Checkout modal opens
   - For Stripe: Payment form appears
10. **Success or Failure**
    - Success → `/checkout/success` page
    - Failure → `/checkout/failure` page

## 🔄 API Endpoints Reference

### Checkout Flow Endpoints

**POST /api/checkout/initiate**
```json
{
  "items": [
    {
      "id": "product_1",
      "name": "Product Name",
      "price": 499,
      "quantity": 2,
      "subtotal": 998
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "street": "123 Main St",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "country": "India"
  },
  "paymentMethod": "razorpay",
  "couponCode": "WELCOME20"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "orderId": "ORD_1234567890",
    "total": 15999
  },
  "paymentData": {
    "razorpayOrderId": "order_ABC123",
    "razorpayKeyId": "rzp_test_KEY"
  }
}
```

**POST /api/checkout/verify-razorpay**
```json
{
  "razorpayOrderId": "order_ABC123",
  "razorpayPaymentId": "pay_ABC123",
  "razorpaySignature": "signature_hash",
  "orderId": "ORD_1234567890"
}
```

### Coupon Validation

**POST /api/coupons/apply**
```json
{
  "code": "WELCOME20",
  "cartTotal": 10000
}
```

**Response:**
```json
{
  "success": true,
  "discountAmount": 2000,
  "coupon": {
    "code": "WELCOME20",
    "discountType": "percentage",
    "discountValue": 20
  }
}
```

### Shipping Calculation

**POST /api/delivery/calculate**
```json
{
  "pincode": "110001",
  "cartTotal": 10000,
  "productWeight": 2.5
}
```

**Response:**
```json
{
  "success": true,
  "shippingCharge": 0,
  "isFreeDelivery": true,
  "processingDays": 2-3
}
```

### Order Management

**GET /api/orders**
- Returns all orders for authenticated user

**GET /api/orders/:orderId**
- Returns specific order details

**GET /api/orders/:orderId/invoice**
- Generates and returns PDF invoice

**GET /api/orders/:orderId/download-invoice**
- Downloads PDF invoice as file

## 🧪 Testing Payment Flow

### Setup Test Data

**MongoDB - Create a test coupon:**
```javascript
db.coupons.insertOne({
  code: "WELCOME20",
  discountType: "percentage",
  discountValue: 20,
  maxDiscountAmount: 5000,
  minOrderValue: 500,
  usageLimit: 100,
  usageCount: 0,
  validFrom: new Date(),
  validUpto: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  applicableCategories: [],
  isActive: true
})
```

**MongoDB - Create delivery zones:**
```javascript
db.deliveryzones.insertOne({
  pincodes: ["110001", "110002", "110003"],
  city: "Delhi",
  state: "Delhi",
  chargePerUnit: 20,
  chargeFlat: 50,
  freeDeliveryAbove: 2500,
  processingDays: "2-3",
  isActive: true
})
```

### Test Cases

#### Test 1: Full Checkout with Razorpay
1. Add 2-3 products to cart
2. Go to checkout
3. Fill address with pincode "110001"
4. Apply coupon "WELCOME20"
5. Select Razorpay payment
6. Click checkout
7. Use Razorpay test cards

#### Test 2: Free Shipping
1. Add products totaling > ₹2,500
2. Enter pincode "110001"
3. Verify shipping shows "Free"
4. Complete payment

#### Test 3: Coupon Validation
1. Try applying invalid coupon → Error message
2. Apply expired coupon → Error message
3. Apply valid coupon → Discount shows
4. Try applying twice → Error message

#### Test 4: Multiple Payment Methods
1. Select Stripe → Complete payment
2. Select Razorpay → Complete payment
3. Select UPI → Direct UPI option
4. Select Wallet → Wallet option

## 🔐 Security Features Implemented

✅ **Payment**
- PCI-DSS compliant (Stripe/Razorpay handle card data)
- HMAC signature verification for Razorpay
- Payment intent validation for Stripe
- Order status verification before invoice generation

✅ **Coupons**
- Expiry date validation
- Usage limit tracking
- Minimum order value checks
- Duplicate use prevention

✅ **Shipping**
- Pincode-based delivery zone verification
- Weight-based shipping calculation
- Free delivery threshold validation

✅ **User Data**
- Address validation (Joi schemas)
- Email verification for order confirmation
- Secure order tracking via orderId

## 📊 Data Models

### Order Schema
```javascript
{
  userId: ObjectId,
  orderId: "ORD_" + timestamp,
  items: [{ productId, name, price, quantity, subtotal }],
  shippingAddress: { fullName, email, phone, street, city, state, pincode, country },
  pricing: { subtotal, tax, shippingCharge, discountAmount, couponCode, total },
  paymentMethod: "razorpay" | "stripe" | "upi" | "netbanking" | "wallet",
  paymentStatus: "pending" | "completed" | "failed" | "cancelled",
  paymentId: String, // Payment gateway ID
  invoiceGenerated: Boolean,
  createdAt, updatedAt
}
```

### Coupon Schema
```javascript
{
  code: String (unique),
  discountType: "fixed" | "percentage",
  discountValue: Number,
  maxDiscountAmount: Number, // For percentage discounts
  minOrderValue: Number,
  usageLimit: Number,
  usageCount: Number,
  validFrom, validUpto: Date,
  applicableCategories: [String],
  isActive: Boolean
}
```

### DeliveryZone Schema
```javascript
{
  pincodes: [String],
  city: String,
  state: String,
  chargePerUnit: Number, // Per kg or per unit
  chargeFlat: Number, // Base delivery charge
  freeDeliveryAbove: Number, // Cart total threshold
  processingDays: String,
  isActive: Boolean
}
```

## 🎨 Frontend Component APIs

### CheckoutPage
- Main orchestration component
- Manages entire checkout flow
- Calls backend APIs for validation

### AddressForm
- Controlled component with 8 fields
- Validation feedback
- onChange callbacks to parent

### PaymentMethodSelector
- 4 payment options with icons
- Visual selection state
- onChange callback

### CouponApplier
- Text input + Apply button
- Loading state during validation
- Success/error messaging
- Shows applied coupon

### ShippingCalculator
- Pincode input (6 digits)
- Loading state
- Calculates shipping by location
- Error handling

### OrderSummary
- Itemized order breakdown
- Shows tax calculation (18%)
- Displays shipping (or "Free")
- Final total in bold

## 🐛 Common Issues & Solutions

### Issue: CORS Error when calling backend
**Solution:** Ensure payment-system app has CORS middleware enabled
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

### Issue: Coupon not applying
**Solution:** Check MongoDB has coupon doc with matching code and validUpto > now()

### Issue: Shipping calculation returns not available
**Solution:** Verify DeliveryZone doc exists with matching pincode

### Issue: Payment gateway not opening
**Solution:** Verify payment gateway keys in .env are correct test keys

### Issue: Order not saving
**Solution:** Ensure MongoDB connection and Order model is imported

## 📝 Environment Variables Checklist

### React Frontend (.env)
- ✓ No .env required (uses hardcoded backend URLs)

### Payment Backend (.env)
- [ ] MONGO_URI
- [ ] CLIENT_URL
- [ ] STRIPE_PUBLIC_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] RAZORPAY_KEY_ID
- [ ] RAZORPAY_KEY_SECRET
- [ ] SMTP_HOST (optional)
- [ ] SMTP_USER (optional)
- [ ] EMAIL_FROM (optional)

### Auth Backend (.env)
- [ ] MONGO_URI
- [ ] CLIENT_URL
- [ ] JWT_SECRET
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] GITHUB_CLIENT_ID
- [ ] GITHUB_CLIENT_SECRET

## 🚢 Deployment Checklist

### Before Production

**Frontend**
- [ ] Update API URLs from localhost to production domain
- [ ] Configure Redux DevTools for production
- [ ] Run build and test: `npm run build`
- [ ] Test all payment flows
- [ ] Verify HTTPS is enabled
- [ ] Test on mobile devices

**Backend**
- [ ] Switch to production payment gateway keys
- [ ] Enable HTTPS/SSL
- [ ] Setup email notifications
- [ ] Configure MongoDB Atlas or production database
- [ ] Setup logging and monitoring
- [ ] Add webhook endpoints for payment status updates
- [ ] Run security audit (helmet, rate limiting, input validation)

**Database**
- [ ] Create indexes on frequently queried fields
- [ ] Setup automated backups
- [ ] Test data recovery procedures
- [ ] Verify user data encryption

## 📚 Additional Resources

- Stripe Docs: https://stripe.com/docs/api
- Razorpay Docs: https://razorpay.com/docs
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
- MongoDB: https://docs.mongodb.com

## 🎉 Next Steps

1. **Setup all three backends** (payment, auth, main app)
2. **Configure environment variables** with test keys
3. **Create test data** (coupons, delivery zones)
4. **Test complete checkout flow** end-to-end
5. **Test all error scenarios** (invalid coupon, unavailable pincode, etc.)
6. **Integrate webhooks** for payment status updates
7. **Setup email notifications** for order confirmations
8. **Deploy to production** with production credentials

---

**Built with:** React, Vite, Tailwind CSS, Express, MongoDB, Stripe, Razorpay
**Last Updated:** 2024
